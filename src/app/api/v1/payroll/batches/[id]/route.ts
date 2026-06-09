import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const batchId = parseInt(params.id);

    const batch = await prisma.payrollBatch.findUnique({
      where: { id: batchId },
      include: {
        items: {
          include: {
            user: { select: { employeeCode: true, fullName: true, branch: { select: { name: true } } } }
          }
        }
      }
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Payroll batch not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: batch,
      message: 'Payroll batch retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
