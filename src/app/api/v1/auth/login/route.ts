import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePasswords, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { mobile, password } = await req.json();

    if (!mobile || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Mobile number and password are required' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { mobile },
      include: { role: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials or inactive account' } },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } },
        { status: 401 }
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      employeeCode: user.employeeCode,
    };

    const access_token = await signToken(payload, '1h');
    const refresh_token = await signToken({ id: user.id }, '7d');

    const response = NextResponse.json({
      success: true,
      data: {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          name: user.fullName,
          role: user.role.name,
        },
      },
      message: 'Login successful',
    });

    response.cookies.set('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
