import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '25');
    const status = searchParams.get('status');
    const branchId = searchParams.get('branch_id');
    const employeeId = searchParams.get('employee_id');

    const skip = (page - 1) * pageSize;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (branchId) whereClause.branchId = parseInt(branchId);
    if (employeeId) whereClause.userId = parseInt(employeeId);

    const [items, total] = await Promise.all([
      prisma.shiftLog.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: {
          user: { select: { fullName: true, employeeCode: true } },
          branch: { select: { name: true } },
          shiftType: { select: { name: true } },
        },
        orderBy: { workDate: 'desc' },
      }),
      prisma.shiftLog.count({ where: whereClause }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: { items, total, page },
      message: 'Shifts retrieved successfully',
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
    const { employee_id, branch_id, shift_type_id, work_date, remarks } = await req.json();

    if (!employee_id || !branch_id || !shift_type_id || !work_date) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const workDateObj = new Date(work_date);
    if (workDateObj > new Date()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Future dates are not allowed' } },
        { status: 400 }
      );
    }

    // Find the applicable rate
    const applicableRate = await prisma.rateHistory.findFirst({
      where: {
        branchId: branch_id,
        shiftTypeId: shift_type_id,
        effectiveFrom: {
          lte: workDateObj,
        },
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });

    const calculatedPay = applicableRate ? applicableRate.rate : 0;

    const shift = await prisma.shiftLog.create({
      data: {
        userId: employee_id,
        branchId: branch_id,
        shiftTypeId: shift_type_id,
        workDate: workDateObj,
        remarks,
        calculatedPay,
      },
    });

    return NextResponse.json({
      success: true,
      data: shift,
      message: 'Shift created successfully',
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Employee already has a shift on this date' } },
        { status: 400 }
      );
    }
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

    const { id, status, remarks } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Shift ID and status are required' } },
        { status: 400 }
      );
    }

    const shift = await prisma.shiftLog.update({
      where: { id },
      data: { 
        status,
        ...(remarks && { remarks })
      },
    });

    return NextResponse.json({
      success: true,
      data: shift,
      message: `Shift ${status.toLowerCase()} successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
