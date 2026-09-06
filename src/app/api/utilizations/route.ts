import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createUtilizationSchema = z.object({
  title: z.string().min(3, 'กรุณาระบุชื่อผลงานหรือโครงการที่นำไปใช้ประโยชน์'),
  dimension: z.enum(['POLICY', 'PUBLIC_COMMUNITY', 'ECONOMIC_LOCAL', 'ACADEMIC'], {
    errorMap: () => ({ message: 'กรุณาเลือกมิติการใช้ประโยชน์ที่ถูกต้อง' }),
  }),
  targetArea: z.string().min(2, 'กรุณาระบุพื้นที่เป้าหมาย'),
  targetGroup: z.string().min(2, 'กรุณาระบุกลุ่มเป้าหมายหรือผู้ได้รับประโยชน์'),
  impactDescription: z.string().min(5, 'กรุณาระบุรายละเอียดผลกระทบที่เกิดขึ้น'),
  benefitUnitCount: z.number().int().nonnegative().nullable().optional(),
  economicValueThb: z.number().nonnegative().nullable().optional(),
  certifyingAgency: z.string().min(2, 'กรุณาระบุหน่วยงานที่นำไปใช้ประโยชน์หรือออกหนังสือรับรอง'),
  certifierName: z.string().optional().nullable(),
  letterNo: z.string().optional().nullable(),
  letterDate: z.string().optional().nullable(),
  evidenceFileUrl: z.string().optional().nullable(),
  profileId: z.string().min(1, 'กรุณาระบุผู้วิจัย'),
  grantId: z.string().optional().nullable(),
  publicationId: z.string().optional().nullable(),
  yearBe: z.number().int().min(2500).max(2600).default(2567),
  status: z.string().default('VERIFIED'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dimension = searchParams.get('dimension');
    const yearBeStr = searchParams.get('yearBe');

    const whereClause: {
      dimension?: string;
      yearBe?: number;
    } = {};

    if (dimension && dimension !== 'ALL') {
      whereClause.dimension = dimension;
    }

    if (yearBeStr && yearBeStr !== 'ALL') {
      const year = parseInt(yearBeStr, 10);
      if (!isNaN(year)) {
        whereClause.yearBe = year;
      }
    }

    const utilizations = await prisma.researchUtilization.findMany({
      where: whereClause,
      include: {
        profile: {
          select: {
            id: true,
            prefix: true,
            firstName: true,
            lastName: true,
            chaya: true,
            academicRank: true,
            sanghaStatus: true,
            department: {
              select: {
                nameTh: true,
              },
            },
          },
        },
        grant: {
          select: {
            id: true,
            projectCode: true,
            titleTh: true,
            fundingSource: true,
          },
        },
        publication: {
          select: {
            id: true,
            titleTh: true,
            venueName: true,
          },
        },
      },
      orderBy: [{ yearBe: 'desc' }, { createdAt: 'desc' }],
    });

    // Calculate aggregated metrics
    const allRecords = await prisma.researchUtilization.findMany({
      select: {
        dimension: true,
        benefitUnitCount: true,
        economicValueThb: true,
        evidenceFileUrl: true,
      },
    });

    const metrics = {
      totalCount: allRecords.length,
      policyCount: allRecords.filter((r) => r.dimension === 'POLICY').length,
      publicCommunityCount: allRecords.filter((r) => r.dimension === 'PUBLIC_COMMUNITY').length,
      economicLocalCount: allRecords.filter((r) => r.dimension === 'ECONOMIC_LOCAL').length,
      academicCount: allRecords.filter((r) => r.dimension === 'ACADEMIC').length,
      totalBeneficiaries: allRecords.reduce((sum, r) => sum + (r.benefitUnitCount || 0), 0),
      totalEconomicValueThb: allRecords.reduce((sum, r) => sum + (r.economicValueThb || 0), 0),
      certifiedWithEvidenceCount: allRecords.filter((r) => !!r.evidenceFileUrl).length,
    };

    return NextResponse.json({
      metrics,
      data: utilizations,
    });
  } catch (error) {
    console.error('Failed to fetch research utilizations:', error);
    return NextResponse.json({ error: 'Failed to fetch research utilizations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = createUtilizationSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้องตามรูปแบบ', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      dimension,
      targetArea,
      targetGroup,
      impactDescription,
      benefitUnitCount,
      economicValueThb,
      certifyingAgency,
      certifierName,
      letterNo,
      letterDate,
      evidenceFileUrl,
      profileId,
      grantId,
      publicationId,
      yearBe,
      status,
    } = parseResult.data;

    const newUtilization = await prisma.researchUtilization.create({
      data: {
        title,
        dimension,
        targetArea,
        targetGroup,
        impactDescription,
        benefitUnitCount: benefitUnitCount ?? null,
        economicValueThb: economicValueThb ?? null,
        certifyingAgency,
        certifierName: certifierName || null,
        letterNo: letterNo || null,
        letterDate: letterDate ? new Date(letterDate) : null,
        evidenceFileUrl: evidenceFileUrl || null,
        profileId,
        grantId: grantId || null,
        publicationId: publicationId || null,
        yearBe,
        status,
      },
      include: {
        profile: true,
        grant: true,
      },
    });

    return NextResponse.json(newUtilization, { status: 201 });
  } catch (error) {
    console.error('Failed to create research utilization:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการนำไปใช้ประโยชน์' }, { status: 500 });
  }
}
