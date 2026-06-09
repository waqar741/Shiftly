import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { preview_id } = await req.json();

    if (!preview_id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'preview_id is required' } },
        { status: 400 }
      );
    }

    const preview = await prisma.importPreview.findUnique({
      where: { id: preview_id }
    });

    if (!preview) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Preview not found or expired' } },
        { status: 404 }
      );
    }

    const { valid } = JSON.parse(preview.data);

    if (!valid || valid.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid rows to import' } },
        { status: 400 }
      );
    }

    // Pre-fetch rates
    const allRates = await prisma.rateHistory.findMany({
      orderBy: { effectiveFrom: 'desc' }
    });

    let successCount = 0;
    let failedCount = 0;

    for (const entry of valid) {
      try {
        const workDateObj = new Date(entry.work_date);
        const rate = allRates.find(r => 
          r.branchId === entry.branch_id && 
          r.shiftTypeId === entry.shift_type_id && 
          r.effectiveFrom <= workDateObj
        );

        await prisma.shiftLog.create({
          data: {
            userId: entry.employee_id,
            branchId: entry.branch_id,
            shiftTypeId: entry.shift_type_id,
            workDate: workDateObj,
            calculatedPay: rate ? rate.rate : 0,
            status: 'APPROVED',
          }
        });
        successCount++;
      } catch (err) {
        failedCount++;
      }
    }

    // Delete preview after use
    await prisma.importPreview.delete({ where: { id: preview_id } });

    return NextResponse.json({
      success: true,
      data: { success_count: successCount, failed_count: failedCount },
      message: 'Import confirmed and processed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
