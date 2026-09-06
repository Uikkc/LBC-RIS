import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthSession } from '@/lib/auth-cookie';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      prefix,
      firstName,
      lastName,
      chaya,
      sanghaStatus = 'MONK',
      academicRank = 'NONE',
      departmentId,
      phone,
    } = body;

    if (!email || !password || !prefix || !firstName || !departmentId) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ได้ลงทะเบียนไว้แล้วในระบบ' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'RESEARCHER',
        isApproved: true,
        profile: {
          create: {
            departmentId,
            sanghaStatus,
            prefix,
            firstName,
            lastName: sanghaStatus === 'MONK' && !lastName ? null : lastName,
            chaya: sanghaStatus === 'MONK' ? chaya : null,
            academicRank,
            email: email.toLowerCase().trim(),
            phone,
            isVerified: true,
          },
        },
      },
      include: {
        profile: {
          include: {
            department: true,
          },
        },
      },
    });

    const displayName = sanghaStatus === 'MONK'
      ? `${prefix} (${chaya || ''})`
      : `${prefix} ${firstName} ${lastName || ''}`.trim();

    await setAuthSession({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: displayName,
      departmentName: newUser.profile?.department?.nameTh,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: displayName,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' }, { status: 500 });
  }
}