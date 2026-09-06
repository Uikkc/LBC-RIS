import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const profile = await prisma.researcherProfile.findUnique({
        where: { id },
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
      return NextResponse.json(profile);
    }

    const profiles = await prisma.researcherProfile.findMany({
      include: {
        department: true,
        authorships: {
          include: {
            publication: true,
          },
        },
      },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      prefix,
      firstName,
      lastName,
      chaya,
      academicRank,
      sanghaStatus,
      email,
      phone,
      expertises,
      orcidId,
      googleScholar,
    } = body;

    const updatedProfile = await prisma.researcherProfile.update({
      where: { id },
      data: {
        prefix,
        firstName,
        lastName: sanghaStatus === 'MONK' && !lastName ? null : lastName,
        chaya: sanghaStatus === 'MONK' ? chaya : null,
        academicRank,
        sanghaStatus,
        email,
        phone,
        expertises: typeof expertises === 'string' ? expertises : JSON.stringify(expertises),
        orcidId,
        googleScholar,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}