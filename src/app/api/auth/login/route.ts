import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthSession } from '@/lib/auth-cookie';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        profile: {
          include: {
            department: true,
          },
        },
        managedDept: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' }, { status: 403 });
    }

    const displayName = user.profile
      ? user.profile.sanghaStatus === 'MONK'
        ? `${user.profile.prefix} (${user.profile.chaya || ''})`
        : `${user.profile.prefix} ${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
      : user.email;

    await setAuthSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: displayName,
      managedDeptId: user.managedDeptId,
      departmentName: user.managedDept?.nameTh || user.profile?.department?.nameTh,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: displayName,
        role: user.role,
        managedDeptId: user.managedDeptId,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}