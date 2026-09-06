import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateAcademicRank } from '@/lib/rank-evaluator';
import { getAuthSession } from '@/lib/auth-cookie';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let profileId = searchParams.get('profileId');
    const targetRank = searchParams.get('targetRank') || undefined;

    // If no profileId provided, check cookie session
    if (!profileId) {
      const session = await getAuthSession();
      if (session) {
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          include: { profile: true },
        });
        if (user?.profile) {
          profileId = user.profile.id;
        }
      }
    }

    // Fetch all profiles so the user can switch between faculties
    const allProfiles = await prisma.researcherProfile.findMany({
      select: {
        id: true,
        prefix: true,
        firstName: true,
        lastName: true,
        chaya: true,
        academicRank: true,
        targetRank: true,
        department: {
          select: {
            nameTh: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    // If still no profileId, pick the first one
    if (!profileId && allProfiles.length > 0) {
      profileId = allProfiles[0].id;
    }

    if (!profileId) {
      return NextResponse.json({ error: 'No researcher profiles found' }, { status: 404 });
    }

    // Fetch full profile data with publications
    const profile = await prisma.researcherProfile.findUnique({
      where: { id: profileId },
      include: {
        department: true,
        authorships: {
          include: {
            publication: true,
          },
        },
        grantMemberships: {
          include: {
            grant: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const evaluation = evaluateAcademicRank(profile, targetRank);

    return NextResponse.json({
      profile: {
        id: profile.id,
        prefix: profile.prefix,
        firstName: profile.firstName,
        lastName: profile.lastName,
        chaya: profile.chaya,
        academicRank: profile.academicRank,
        targetRank: profile.targetRank,
        teachingDocStatus: profile.teachingDocStatus,
        teachingDocTitle: profile.teachingDocTitle,
        teachingDocFileUrl: profile.teachingDocFileUrl,
        departmentName: profile.department.nameTh,
      },
      evaluation,
      allProfiles,
    });
  } catch (error) {
    console.error('Failed to evaluate academic rank:', error);
    return NextResponse.json({ error: 'Failed to evaluate rank readiness' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      profileId,
      targetRank,
      teachingDocStatus,
      teachingDocTitle,
      teachingDocFileUrl,
    } = body;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    const updatedProfile = await prisma.researcherProfile.update({
      where: { id: profileId },
      data: {
        targetRank: targetRank || undefined,
        teachingDocStatus: teachingDocStatus || undefined,
        teachingDocTitle: teachingDocTitle || undefined,
        teachingDocFileUrl: teachingDocFileUrl || undefined,
      },
      include: {
        department: true,
        authorships: {
          include: {
            publication: true,
          },
        },
        grantMemberships: {
          include: {
            grant: true,
          },
        },
      },
    });

    const evaluation = evaluateAcademicRank(updatedProfile, targetRank);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      evaluation,
    });
  } catch (error) {
    console.error('Failed to update rank target:', error);
    return NextResponse.json({ error: 'Failed to update rank target' }, { status: 500 });
  }
}
