import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    const userId = parseInt(req.headers.get('x-user-id') || '0');
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (userRole === 'EMPLOYEE') {
      const [upcomingShifts, pendingExpensesAgg, lastPayroll] = await Promise.all([
        prisma.shiftLog.findMany({
          where: { userId, workDate: { gte: now } },
          orderBy: { workDate: 'asc' },
          take: 5,
        }),
        prisma.expense.aggregate({
          where: { userId, status: 'PENDING' },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.payrollItem.findFirst({
          where: { userId },
          orderBy: { id: 'desc' },
          include: { batch: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          upcomingShiftsCount: upcomingShifts.length,
          nextShift: upcomingShifts[0]?.workDate || null,
          pendingExpensesAmount: pendingExpensesAgg._sum.amount || 0,
          pendingExpensesCount: pendingExpensesAgg._count,
          lastPayoutAmount: lastPayroll?.totalPay || 0,
          lastPayoutMonth: lastPayroll?.batch?.month ? `${lastPayroll.batch.month}/${lastPayroll.batch.year}` : null,
          isEmployee: true,
        },
      });
    }

    const [
      pendingShiftsCount,
      pendingExpensesAgg,
      activeEmployeeCount,
      branchCount,
      activeBranchCount,
      latestPayroll,
      recentShifts,
    ] = await Promise.all([
      prisma.shiftLog.count({ where: { status: 'PENDING' } }),
      prisma.expense.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.branch.count(),
      prisma.branch.count({ where: { status: 'ACTIVE' } }),
      prisma.payrollBatch.findFirst({
        where: { month: now.getMonth() + 1, year: now.getFullYear() },
        select: { totalAmount: true, status: true },
      }),
      prisma.shiftLog.findMany({
        take: 10,
        orderBy: { workDate: 'desc' },
        include: {
          user: { select: { fullName: true, employeeCode: true } },
          branch: { select: { name: true } },
          shiftType: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        pendingShifts: pendingShiftsCount,
        pendingExpenses: {
          amount: pendingExpensesAgg._sum.amount || 0,
          count: pendingExpensesAgg._count,
        },
        activeEmployees: activeEmployeeCount,
        branches: {
          total: branchCount,
          active: activeBranchCount,
          inactive: branchCount - activeBranchCount,
        },
        monthlyPayroll: latestPayroll?.totalAmount || 0,
        recentShifts,
        isEmployee: false,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
