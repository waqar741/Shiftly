import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

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
        { success: false, error: { code: 'NOT_FOUND', message: 'Batch not found' } },
        { status: 404 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Payroll - ${batch.month}-${batch.year}`);

    worksheet.columns = [
      { header: 'Employee Code', key: 'employeeCode', width: 20 },
      { header: 'Full Name', key: 'fullName', width: 30 },
      { header: 'Branch', key: 'branch', width: 20 },
      { header: 'Total Shifts', key: 'shiftCount', width: 15 },
      { header: 'Shift Pay', key: 'shiftPay', width: 15 },
      { header: 'Total Expenses', key: 'expenseCount', width: 15 },
      { header: 'Expense Pay', key: 'expensePay', width: 15 },
      { header: 'Total Payable', key: 'totalPay', width: 20 },
    ];

    batch.items.forEach((item: any) => {
      worksheet.addRow({
        employeeCode: item.user.employeeCode,
        fullName: item.user.fullName,
        branch: item.user.branch?.name || 'N/A',
        shiftCount: item.shiftCount,
        shiftPay: item.shiftPay,
        expenseCount: item.expenseCount,
        expensePay: item.expensePay,
        totalPay: item.totalPay,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Payroll_Export_${batch.month}_${batch.year}.xlsx"`,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
