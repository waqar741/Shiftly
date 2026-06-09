import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branch_id');
    const shiftTypeId = searchParams.get('shift_type_id');

    const rates = await prisma.rateHistory.findMany({
      where: {
        ...(branchId ? { branchId: parseInt(branchId) } : {}),
        ...(shiftTypeId ? { shiftTypeId: parseInt(shiftTypeId) } : {}),
      },
      include: {
        branch: { select: { name: true } },
        shiftType: { select: { name: true } },
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      data: rates,
      message: 'Rates retrieved successfully',
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
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { branch_id, shift_type_id, rate, effective_from } = await req.json();

    if (!branch_id || !shift_type_id || rate === undefined || !effective_from) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'branch_id, shift_type_id, rate, and effective_from are required' } },
        { status: 400 }
      );
    }

    if (rate <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Rate must be greater than 0' } },
        { status: 400 }
      );
    }

    const rateEntry = await prisma.rateHistory.create({
      data: {
        branchId: branch_id,
        shiftTypeId: shift_type_id,
        rate: parseFloat(rate),
        effectiveFrom: new Date(effective_from),
      },
    });

    return NextResponse.json({
      success: true,
      data: rateEntry,
      message: 'Rate created successfully',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
