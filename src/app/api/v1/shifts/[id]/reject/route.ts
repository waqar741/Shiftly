import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userRole !== 'BRANCH_MANAGER') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { remarks } = await req.json();
    
    if (!remarks) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Remarks required' } },
        { status: 400 }
      );
    }

    const shiftId = parseInt(params.id);

    const shift = await prisma.shiftLog.update({
      where: { id: shiftId },
      data: { status: 'REJECTED', remarks },
    });

    return NextResponse.json({
      success: true,
      data: shift,
      message: 'Shift rejected successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
