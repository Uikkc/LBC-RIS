import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalResearchers,
      totalPublications,
      activeGrants,
      allGrants,
      publicationsByYear,
      departments,
      overdueMilestonesCount,
      dueSoonMilestonesCount,
      irbApprovedCount,
    ] = await Promise.all([
      prisma.researcherProfile.count(),
      prisma.publication.count(),
      prisma.researchGrant.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.researchGrant.findMany({ select: { totalBudget: true, grantType: true } }),
      prisma.publication.groupBy({
        by: ['yearBe'],
        _count: { id: true },
        orderBy: { yearBe: 'asc' },
      }),
      prisma.department.findMany({
        include: {
          profiles: {
            include: {
              authorships: true,
            },
          },
        },
      }),
      prisma.grantMilestone.count({
        where: {
          status: 'PENDING',
          dueDate: { lt: new Date() },
        },
      }),
      prisma.grantMilestone.count({
        where: {
          status: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.researchGrant.count({
        where: { irbStatus: 'APPROVED' },
      }),
    ]);

    const totalBudget = allGrants.reduce((sum, g) => sum + g.totalBudget, 0);

    const fundingDistribution = allGrants.reduce((acc: Record<string, number>, g) => {
      const type = g.grantType === 'INTERNAL' ? 'ทุนวิจัยภายใน วส.เลย' : 'ทุนวิจัยภายนอก (บพท./วช./สกสว.)';
      acc[type] = (acc[type] || 0) + g.totalBudget;
      return acc;
    }, {});

    const fundingChartData = Object.entries(fundingDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    const departmentChartData = departments.map((d) => {
      const pubCount = d.profiles.reduce((sum, p) => sum + p.authorships.length, 0);
      return {
        name: d.nameTh.replace('สาขาวิชา', ''),
        publications: pubCount,
        facultyCount: d.profiles.length,
      };
    });

    const trendData = publicationsByYear.map((p) => ({
      year: `พ.ศ. ${p.yearBe}`,
      count: p._count.id,
    }));

    return NextResponse.json({
      kpis: {
        totalResearchers,
        totalPublications,
        activeGrants,
        totalBudget,
      },
      alerts: {
        overdueMilestonesCount,
        dueSoonMilestonesCount,
        irbApprovedCount,
      },
      trendData,
      fundingChartData,
      departmentChartData,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}