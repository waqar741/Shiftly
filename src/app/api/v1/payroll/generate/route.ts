import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { month, year } = await req.json();

    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid month (1-12) and year are required' } },
        { status: 400 }
      );
    }

    // Check if batch already exists
    const existingBatch = await prisma.payrollBatch.findUnique({
      where: { month_year: { month, year } }
    });

    if (existingBatch) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Payroll batch for this month already exists' } },
        { status: 400 }
      );
    }

    // Calculate start and end date for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch approved shifts and expenses
    const [shifts, expenses] = await Promise.all([
      prisma.shiftLog.findMany({
        where: {
          status: 'APPROVED',
          workDate: { gte: startDate, lte: endDate }
        }
      }),
      prisma.expense.findMany({
        where: {
          status: 'APPROVED',
          expenseDate: { gte: startDate, lte: endDate }
        }
      })
    ]);

    // Aggregate by user
    const userAggregates: Record<number, any> = {};

    shifts.forEach((shift: any) => {
      if (!userAggregates[shift.userId]) {
        userAggregates[shift.userId] = { shiftCount: 0, shiftPay: 0, expenseCount: 0, expensePay: 0 };
      }
      userAggregates[shift.userId].shiftCount += 1;
      userAggregates[shift.userId].shiftPay += (shift.calculatedPay || 0);
    });

    expenses.forEach((expense: any) => {
      if (!userAggregates[expense.userId]) {
        userAggregates[expense.userId] = { shiftCount: 0, shiftPay: 0, expenseCount: 0, expensePay: 0 };
      }
      userAggregates[expense.userId].expenseCount += 1;
      userAggregates[expense.userId].expensePay += expense.amount;
    });

    const payrollItemsData = Object.keys(userAggregates).map(userIdStr => {
      const userId = parseInt(userIdStr);
      const agg = userAggregates[userId];
      const totalPay = agg.shiftPay + agg.expensePay;
      return {
        userId,
        shiftCount: agg.shiftCount,
        shiftPay: agg.shiftPay,
        expenseCount: agg.expenseCount,
        expensePay: agg.expensePay,
        totalPay
      };
    });

    const totalBatchAmount = payrollItemsData.reduce((sum, item) => sum + item.totalPay, 0);

    // Transactionally create batch and items
    const batch = await prisma.$transaction(async (tx) => {
      const newBatch = await tx.payrollBatch.create({
        data: {
          month,
          year,
          totalAmount: totalBatchAmount,
        }
      });

      if (payrollItemsData.length > 0) {
        await tx.payrollItem.createMany({
          data: payrollItemsData.map(item => ({
            ...item,
            payrollBatchId: newBatch.id
          }))
        });
      }

      return newBatch;
    });

    return NextResponse.json({
      success: true,
      data: { batch_id: batch.id, total_amount: totalBatchAmount, employee_count: payrollItemsData.length },
      message: 'Payroll generated successfully',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
