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

    const { entries } = await req.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Entries array is required' } },
        { status: 400 }
      );
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // Pre-fetch all active rates to calculate pay locally rather than querying in a loop
    const allRates = await prisma.rateHistory.findMany({
      orderBy: { effectiveFrom: 'desc' }
    });

    for (const [index, entry] of entries.entries()) {
      try {
        const workDateObj = new Date(entry.work_date);
        
        // Find applicable rate
        const rate = allRates.find((r: any) => 
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
            status: 'APPROVED', // Bulk entries by admin are automatically approved as per spec
          }
        });
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({ index, employee_id: entry.employee_id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      data: { success_count: successCount, failed_count: failedCount, errors },
      message: 'Bulk entry processed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
