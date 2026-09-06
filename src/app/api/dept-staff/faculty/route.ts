import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-cookie';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    const { searchParams } = new URL(request.url);
    const requestedDeptId = searchParams.get('departmentId');

    let targetDeptId: string | undefined = undefined;

    if (session?.role === 'DEPT_STAFF' && session.managedDeptId) {
      // Department staff is strictly scoped to their managed department
      targetDeptId = session.managedDeptId;
    } else if (requestedDeptId && requestedDeptId !== 'ALL') {
      targetDeptId = requestedDeptId;
    }

    const where: any = {};
    if (targetDeptId) {
      where.departmentId = targetDeptId;
    }

    const faculty = await prisma.researcherProfile.findMany({
      where,
      include: {
        department: true,
        authorships: {
          include: {
            publication: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            isApproved: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const departments = await prisma.department.findMany({
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({
      faculty,
      departments,
      currentScope: targetDeptId || 'ALL',
    });
  } catch (error) {
    console.error('Dept Faculty API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch department faculty' }, { status: 500 });
  }
}