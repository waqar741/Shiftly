import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const expenseId = parseInt(params.id);
    const userId = parseInt(req.headers.get('x-user-id') || '0');

    if (!userId) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    // 1. Verify the expense belongs to the user
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense || expense.userId !== userId) {
      return NextResponse.json({ success: false, error: { message: 'Expense not found or unauthorized' } }, { status: 403 });
    }

    // 2. Extract the file from the multipart/form-data request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: { message: 'No file provided' } }, { status: 400 });
    }

    // 3. Convert the file to an ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate a unique filename: e.g. "expense_5_123456.jpg"
    const fileExt = file.name.split('.').pop();
    const fileName = `expense_${expenseId}_${Date.now()}.${fileExt}`;

    // 4. Upload to Supabase Storage bucket named 'receipts'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return NextResponse.json(
        { success: false, error: { message: 'Failed to upload image to Supabase' } },
        { status: 500 }
      );
    }

    // 5. Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    // 6. Save the receipt URL to your Prisma SQLite database
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: { receiptUrl: publicUrl },
    });

    return NextResponse.json({
      success: true,
      data: { receipt_url: publicUrl, expense: updatedExpense },
      message: 'Receipt uploaded successfully',
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
