import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-cookie';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'DEPT_STAFF')) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ในการดำเนินการนี้' }, { status: 403 });
    }

    const { profileId, isVerified } = await request.json();

    const updated = await prisma.researcherProfile.update({
      where: { id: profileId },
      data: { isVerified: Boolean(isVerified) },
      include: { department: true },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Verify API Error:', error);
    return NextResponse.json({ error: 'Failed to verify profile' }, { status: 500 });
  }
}