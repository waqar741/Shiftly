import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only Super Admins can lock payrolls' } },
        { status: 403 }
      );
    }

    const batchId = parseInt(params.id);

    const batch = await prisma.payrollBatch.findUnique({ where: { id: batchId } });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Batch not found' } },
        { status: 404 }
      );
    }

    if (batch.status === 'LOCKED') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Batch is already locked' } },
        { status: 400 }
      );
    }

    const updatedBatch = await prisma.payrollBatch.update({
      where: { id: batchId },
      data: { status: 'LOCKED' }
    });

    return NextResponse.json({
      success: true,
      data: updatedBatch,
      message: 'Payroll batch locked successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
