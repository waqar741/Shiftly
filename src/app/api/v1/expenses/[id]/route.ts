import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const expenseId = parseInt(params.id);
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        user: { select: { fullName: true, employeeCode: true } },
        category: { select: { name: true } },
        approvedByUser: { select: { fullName: true } }
      }
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = req.headers.get('x-user-role');
    const userId = req.headers.get('x-user-id');
    
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userRole !== 'BRANCH_MANAGER') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const expenseId = parseInt(params.id);
    const { status, rejectionRemarks } = await req.json();

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid status (APPROVED, REJECTED) is required' } },
        { status: 400 }
      );
    }

    if (status === 'REJECTED' && !rejectionRemarks) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Rejection remarks are required' } },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        status,
        ...(status === 'REJECTED' && { rejectionRemarks }),
        ...(status === 'APPROVED' && { rejectionRemarks: null }),
        approvedBy: parseInt(userId!),
        approvedAt: new Date(),
      },
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
