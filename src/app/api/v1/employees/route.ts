import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

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

    // Optional query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '25');
    const search = searchParams.get('search');
    const branchId = searchParams.get('branch_id');
    const roleId = searchParams.get('role_id');
    
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (branchId) where.branchId = parseInt(branchId);
    if (roleId) where.roleId = parseInt(roleId);

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          email: true,
          mobile: true,
          status: true,
          role: { select: { name: true } },
          branch: { select: { name: true } }
        },
        orderBy: { id: 'desc' }
      }),
      prisma.user.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: { items, total, page },
      message: 'Employees retrieved successfully',
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

    const { employee_code, full_name, email, mobile, branch_id, role_id, password } = await req.json();

    const hashedPassword = await hashPassword(password);

    const employee = await prisma.user.create({
      data: {
        employeeCode: employee_code,
        fullName: full_name,
        email,
        mobile,
        branchId: branch_id,
        roleId: role_id,
        password: hashedPassword,
      },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee created successfully',
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Employee code or email already exists' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const { id, employee_code, full_name, email, mobile, branch_id, role_id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required' } },
        { status: 400 }
      );
    }

    const employee = await prisma.user.update({
      where: { id },
      data: {
        ...(employee_code && { employeeCode: employee_code }),
        ...(full_name && { fullName: full_name }),
        ...(email && { email }),
        ...(mobile && { mobile }),
        ...(branch_id !== undefined && { branchId: branch_id }),
        ...(role_id !== undefined && { roleId: role_id }),
      },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        mobile: true,
        status: true,
        role: { select: { name: true } },
        branch: { select: { name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Employee code or email already exists' } },
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

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Employee ID and status are required' } },
        { status: 400 }
      );
    }

    const employee = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, fullName: true }
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: `Employee ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
