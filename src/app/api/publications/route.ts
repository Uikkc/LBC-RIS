import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateQaScore } from '@/lib/qa-calculator';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const indexing = searchParams.get('indexing');

    const where: any = {};
    if (type && type !== 'ALL') where.type = type;
    if (indexing && indexing !== 'ALL') where.indexing = indexing;
    if (search) {
      where.OR = [
        { titleTh: { contains: search } },
        { titleEn: { contains: search } },
        { venueName: { contains: search } },
      ];
    }

    const publications = await prisma.publication.findMany({
      where,
      include: {
        authors: {
          include: {
            profile: {
              select: {
                id: true,
                prefix: true,
                firstName: true,
                lastName: true,
                chaya: true,
                academicRank: true,
              },
            },
          },
        },
        grant: {
          select: {
            id: true,
            projectCode: true,
            titleTh: true,
          },
        },
      },
      orderBy: { yearBe: 'desc' },
    });

    return NextResponse.json(publications);
  } catch (error) {
    console.error('Failed to fetch publications:', error);
    return NextResponse.json({ error: 'Failed to fetch publications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titleTh,
      titleEn,
      abstractTh,
      abstractEn,
      type,
      indexing,
      venueName,
      yearBe,
      volume,
      issue,
      pages,
      doi,
      isbn,
      authorName,
      authorShare = 100,
      profileId,
      grantId,
    } = body;

    if (!titleTh || !type || !venueName || !yearBe) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const calculatedScore = calculateQaScore(indexing || 'GENERAL', type, Number(authorShare));

    const newPublication = await prisma.publication.create({
      data: {
        titleTh,
        titleEn,
        abstractTh,
        abstractEn,
        type,
        indexing: indexing || 'GENERAL',
        venueName,
        yearBe: Number(yearBe),
        volume,
        issue,
        pages,
        doi,
        isbn,
        status: 'VERIFIED',
        qaScore: calculatedScore,
        grantId: grantId || null,
        authors: {
          create: [
            {
              authorName: authorName || 'ผู้วิจัยหลัก',
              authorRole: 'FIRST_AUTHOR',
              authorShare: Number(authorShare),
              profileId: profileId || null,
            },
          ],
        },
      },
      include: {
        authors: true,
      },
    });

    return NextResponse.json(newPublication, { status: 201 });
  } catch (error) {
    console.error('Failed to create publication:', error);
    return NextResponse.json({ error: 'Failed to create publication' }, { status: 500 });
  }
}