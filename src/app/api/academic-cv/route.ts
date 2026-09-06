import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-cookie';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let profileId = searchParams.get('profileId');

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

    // Fetch all profiles for selector
    const allProfiles = await prisma.researcherProfile.findMany({
      select: {
        id: true,
        prefix: true,
        firstName: true,
        lastName: true,
        chaya: true,
        academicRank: true,
        department: {
          select: { nameTh: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    if (!profileId && allProfiles.length > 0) {
      profileId = allProfiles[0].id;
    }

    if (!profileId) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 });
    }

    const profile = await prisma.researcherProfile.findUnique({
      where: { id: profileId },
      include: {
        department: true,
        authorships: {
          include: {
            publication: true,
          },
          orderBy: {
            publication: {
              yearBe: 'desc',
            },
          },
        },
        grantMemberships: {
          include: {
            grant: {
              include: {
                milestones: {
                  orderBy: { milestoneNumber: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile,
      allProfiles,
    });
  } catch (error) {
    console.error('Failed to fetch academic CV data:', error);
    return NextResponse.json({ error: 'Failed to fetch academic CV data' }, { status: 500 });
  }
}
