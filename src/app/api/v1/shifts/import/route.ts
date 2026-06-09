import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Excel file is required' } },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.worksheets[0];
    const parsedRows: any[] = [];
    const errors: any[] = [];

    // Pre-fetch all necessary mappings to avoid N+1 queries
    const users = await prisma.user.findMany({ select: { id: true, employeeCode: true } });
    const branches = await prisma.branch.findMany({ select: { id: true, name: true } });
    const shiftTypes = await prisma.shiftType.findMany({ select: { id: true, name: true } });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const employeeCode = row.getCell(1).text;
      const dateStr = row.getCell(2).text; // Or date value depending on Excel format
      const branchName = row.getCell(3).text;
      const shiftTypeName = row.getCell(4).text;

      if (!employeeCode || !dateStr || !branchName || !shiftTypeName) {
        errors.push({ row: rowNumber, error: 'Missing fields' });
        return;
      }

      const user = users.find((u: any) => u.employeeCode === employeeCode);
      const branch = branches.find((b: any) => b.name === branchName);
      const shiftType = shiftTypes.find((s: any) => s.name === shiftTypeName);

      if (!user) errors.push({ row: rowNumber, error: `Invalid Employee Code: ${employeeCode}` });
      if (!branch) errors.push({ row: rowNumber, error: `Invalid Branch: ${branchName}` });
      if (!shiftType) errors.push({ row: rowNumber, error: `Invalid Shift Type: ${shiftTypeName}` });

      if (user && branch && shiftType) {
        parsedRows.push({
          employee_id: user.id,
          branch_id: branch.id,
          shift_type_id: shiftType.id,
          work_date: new Date(dateStr),
          row_number: rowNumber,
        });
      }
    });

    // Save to preview
    const preview = await prisma.importPreview.create({
      data: {
        data: JSON.stringify({ valid: parsedRows, errors }),
      }
    });

    return NextResponse.json({
      success: true,
      data: { preview_id: preview.id, valid_count: parsedRows.length, error_count: errors.length, errors },
      message: 'Excel parsed successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
