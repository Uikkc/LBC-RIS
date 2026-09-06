import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const saveWorkloadSchema = z.object({
  profileId: z.string().min(1, 'กรุณาระบุผู้วิจัย/อาจารย์'),
  academicYear: z.number().int().min(2500).max(2600).default(2567),
  semester: z.number().int().min(1).max(3).default(1),
  teachingHours: z.number().min(0).default(0),
  teachingDetails: z.string().optional().nullable(),
  researchHours: z.number().min(0).default(0),
  researchDetails: z.string().optional().nullable(),
  serviceHours: z.number().min(0).default(0),
  serviceDetails: z.string().optional().nullable(),
  cultureHours: z.number().min(0).default(0),
  cultureDetails: z.string().optional().nullable(),
  adminHours: z.number().min(0).default(0),
  adminDetails: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED']).default('DRAFT'),
  evaluatorFeedback: z.string().optional().nullable(),
  evaluatorName: z.string().optional().nullable(),
  evidenceFileUrl: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileIdParam = searchParams.get('profileId');
    const yearParam = searchParams.get('academicYear') || '2567';
    const semParam = searchParams.get('semester') || '1';

    const academicYear = parseInt(yearParam, 10);
    const semester = parseInt(semParam, 10);

    // Fetch all profiles for selector
    const profiles = await prisma.researcherProfile.findMany({
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
      orderBy: { firstName: 'asc' },
    });

    const activeProfileId = profileIdParam || (profiles.length > 0 ? profiles[0].id : null);

    if (!activeProfileId) {
      return NextResponse.json({
        profiles: [],
        workload: null,
        harvestedResearch: null,
      });
    }

    // 1. Fetch saved workload if exists
    const workload = await prisma.academicWorkload.findUnique({
      where: {
        profileId_academicYear_semester: {
          profileId: activeProfileId,
          academicYear,
          semester,
        },
      },
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
      },
    });

    // 2. Auto-harvest research output from RIS
    const publications = await prisma.publication.findMany({
      where: {
        authors: {
          some: {
            profileId: activeProfileId,
          },
        },
        yearBe: {
          in: [academicYear, academicYear - 1],
        },
      },
      include: {
        authors: {
          where: { profileId: activeProfileId },
        },
      },
    });

    const grants = await prisma.researchGrant.findMany({
      where: {
        members: {
          some: {
            profileId: activeProfileId,
          },
        },
      },
      include: {
        members: {
          where: { profileId: activeProfileId },
        },
      },
    });

    const utilizations = await prisma.researchUtilization.findMany({
      where: {
        profileId: activeProfileId,
        yearBe: {
          in: [academicYear, academicYear - 1],
        },
      },
    });

    // Calculate harvested items and recommended hours
    let calculatedResearchHours = 0;
    const harvestedItems: Array<{
      type: string;
      title: string;
      roleOrIndexing: string;
      creditHours: number;
    }> = [];

    // Publications
    for (const pub of publications) {
      const author = pub.authors[0];
      const isFirst = author?.authorRole === 'FIRST_AUTHOR';
      let hours = 3.0;

      if (pub.indexing.includes('SCOPUS') || pub.indexing === 'TCI_TIER_1') {
        hours = isFirst ? 6.0 : 4.0;
      } else if (pub.indexing === 'TCI_TIER_2') {
        hours = isFirst ? 4.0 : 3.0;
      }

      calculatedResearchHours += hours;
      harvestedItems.push({
        type: 'PUBLICATION',
        title: pub.titleTh,
        roleOrIndexing: `${pub.indexing} (${isFirst ? 'ผู้แต่งหลัก' : 'ผู้แต่งร่วม'})`,
        creditHours: hours,
      });
    }

    // Grants
    for (const grant of grants) {
      const member = grant.members[0];
      const isPI = member?.role === 'หัวหน้าโครงการ';
      const hours = isPI ? 4.0 : 2.0;

      calculatedResearchHours += hours;
      harvestedItems.push({
        type: 'GRANT',
        title: grant.titleTh,
        roleOrIndexing: `${member?.role || 'นักวิจัย'} (${grant.fundingSource})`,
        creditHours: hours,
      });
    }

    // Utilizations
    for (const util of utilizations) {
      const hours = 2.0;
      calculatedResearchHours += hours;
      harvestedItems.push({
        type: 'UTILIZATION',
        title: util.title,
        roleOrIndexing: `การนำไปใช้ประโยชน์ (${util.certifyingAgency})`,
        creditHours: hours,
      });
    }

    const harvestedResearch = {
      recommendedHours: Math.min(calculatedResearchHours, 16.0), // Cap at 16 hours for balanced academic workload
      totalHarvestedRawHours: calculatedResearchHours,
      harvestedItems,
    };

    return NextResponse.json({
      profiles,
      activeProfileId,
      workload,
      harvestedResearch,
    });
  } catch (error) {
    console.error('Failed to fetch academic workload:', error);
    return NextResponse.json({ error: 'Failed to fetch academic workload' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = saveWorkloadSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้องตามรูปแบบ', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const {
      profileId,
      academicYear,
      semester,
      teachingHours,
      teachingDetails,
      researchHours,
      researchDetails,
      serviceHours,
      serviceDetails,
      cultureHours,
      cultureDetails,
      adminHours,
      adminDetails,
      status,
      evaluatorFeedback,
      evaluatorName,
      evidenceFileUrl,
    } = parseResult.data;

    // Calculate total hours
    const totalHours = teachingHours + researchHours + serviceHours + cultureHours + adminHours;
    const isPassedMinimum = totalHours >= 18.0;

    let evaluationLevel = 'GOOD';
    if (totalHours >= 35.0) {
      evaluationLevel = 'OUTSTANDING';
    } else if (totalHours >= 28.0) {
      evaluationLevel = 'VERY_GOOD';
    } else if (totalHours >= 18.0) {
      evaluationLevel = 'GOOD';
    } else {
      evaluationLevel = 'UNSATISFACTORY';
    }

    const savedWorkload = await prisma.academicWorkload.upsert({
      where: {
        profileId_academicYear_semester: {
          profileId,
          academicYear,
          semester,
        },
      },
      update: {
        teachingHours,
        teachingDetails: teachingDetails || null,
        researchHours,
        researchDetails: researchDetails || null,
        serviceHours,
        serviceDetails: serviceDetails || null,
        cultureHours,
        cultureDetails: cultureDetails || null,
        adminHours,
        adminDetails: adminDetails || null,
        totalHours,
        evaluationLevel,
        isPassedMinimum,
        status,
        evaluatorFeedback: evaluatorFeedback || null,
        evaluatorName: evaluatorName || null,
        evaluatedAt: status === 'APPROVED' ? new Date() : null,
        evidenceFileUrl: evidenceFileUrl || null,
      },
      create: {
        profileId,
        academicYear,
        semester,
        teachingHours,
        teachingDetails: teachingDetails || null,
        researchHours,
        researchDetails: researchDetails || null,
        serviceHours,
        serviceDetails: serviceDetails || null,
        cultureHours,
        cultureDetails: cultureDetails || null,
        adminHours,
        adminDetails: adminDetails || null,
        totalHours,
        evaluationLevel,
        isPassedMinimum,
        status,
        evaluatorFeedback: evaluatorFeedback || null,
        evaluatorName: evaluatorName || null,
        evaluatedAt: status === 'APPROVED' ? new Date() : null,
        evidenceFileUrl: evidenceFileUrl || null,
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(savedWorkload, { status: 200 });
  } catch (error) {
    console.error('Failed to save academic workload:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกภาระงานวิชาการ' }, { status: 500 });
  }
}
