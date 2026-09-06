import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const grants = await prisma.researchGrant.findMany({
      include: {
        members: {
          include: {
            profile: {
              select: {
                id: true,
                prefix: true,
                firstName: true,
                lastName: true,
                chaya: true,
              },
            },
          },
        },
        milestones: {
          orderBy: { milestoneNumber: 'asc' },
        },
        publications: {
          select: {
            id: true,
            titleTh: true,
            yearBe: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(grants);
  } catch (error) {
    console.error('Failed to fetch grants:', error);
    return NextResponse.json({ error: 'Failed to fetch grants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectCode,
      titleTh,
      titleEn,
      fundingSource,
      grantType,
      totalBudget,
      startDate,
      endDate,
      profileId,
      irbStatus,
      irbNumber,
      irbApprovalDate,
      irbExpireDate,
      irbFileUrl,
    } = body;

    const newGrant = await prisma.researchGrant.create({
      data: {
        projectCode,
        titleTh,
        titleEn,
        fundingSource,
        grantType: grantType || 'INTERNAL',
        totalBudget: Number(totalBudget),
        startDate: new Date(startDate || new Date()),
        endDate: new Date(endDate || new Date(Date.now() + 365*24*60*60*1000)),
        status: 'IN_PROGRESS',
        irbStatus: irbStatus || 'NOT_REQUIRED',
        irbNumber: irbNumber || null,
        irbApprovalDate: irbApprovalDate ? new Date(irbApprovalDate) : null,
        irbExpireDate: irbExpireDate ? new Date(irbExpireDate) : null,
        irbFileUrl: irbFileUrl || null,
        members: profileId
          ? {
              create: [
                {
                  profileId,
                  role: 'หัวหน้าโครงการ',
                },
              ],
            }
          : undefined,
        milestones: {
          create: [
            {
              milestoneNumber: 1,
              title: 'รายงานความก้าวหน้างวดที่ 1',
              dueDate: new Date(Date.now() + 90*24*60*60*1000),
              disbursementAmount: Number(totalBudget) * 0.4,
              status: 'PENDING',
            },
            {
              milestoneNumber: 2,
              title: 'รายงานฉบับสมบูรณ์ (ปิดโครงการ)',
              dueDate: new Date(Date.now() + 360*24*60*60*1000),
              disbursementAmount: Number(totalBudget) * 0.6,
              status: 'PENDING',
            },
          ],
        },
      },
    });

    return NextResponse.json(newGrant, { status: 201 });
  } catch (error) {
    console.error('Failed to create grant:', error);
    return NextResponse.json({ error: 'Failed to create grant' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { milestoneId, status, deliverableFileUrl, submittedDate } = body;

    if (!milestoneId) {
      return NextResponse.json({ error: 'milestoneId is required' }, { status: 400 });
    }

    const updated = await prisma.grantMilestone.update({
      where: { id: milestoneId },
      data: {
        status: status || undefined,
        deliverableFileUrl: deliverableFileUrl || undefined,
        submittedDate: submittedDate ? new Date(submittedDate) : (status === 'SUBMITTED' ? new Date() : undefined),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update milestone:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}