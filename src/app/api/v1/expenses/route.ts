import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { employeeCode: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        user: { select: { fullName: true, employeeCode: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { expenseDate: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      data: expenses,
      message: 'Expenses retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { expense_date, category_id, amount, description } = await req.json();

    if (!expense_date || !category_id || amount === undefined || amount <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid expense_date, category_id, and amount (>0) are required' } },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        userId: parseInt(userId!),
        categoryId: category_id,
        expenseDate: new Date(expense_date),
        amount: parseFloat(amount),
        description,
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Expense created successfully',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Expense ID and status are required' } },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: `Expense ${status.toLowerCase()} successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
