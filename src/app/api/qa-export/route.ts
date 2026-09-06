import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearBe = searchParams.get('yearBe');

    const where: any = {};
    if (yearBe && yearBe !== 'ALL') {
      where.yearBe = Number(yearBe);
    }

    const publications = await prisma.publication.findMany({
      where,
      include: {
        authors: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { yearBe: 'desc' },
    });

    // Generate CSV data with UTF-8 BOM for Excel compatibility in Thai
    let csv = '\uFEFF';
    csv += 'ลำดับ,ปี พ.ศ.,ประเภทผลงาน,ชื่อผลงานวิชาการ,ผู้ประพันธ์,สัดส่วน (%),ฐานข้อมูล/ระดับ,ค่าน้ำหนัก QA,วารสาร/แหล่งตีพิมพ์,DOI/ISBN,ลิงก์เอกสารหลักฐานจริง (PDF Vault)\n';

    publications.forEach((pub, index) => {
      const authorList = pub.authors
        .map((a) => `${a.authorName} (${a.authorShare}%)`)
        .join('; ');
      
      const primaryShare = pub.authors[0]?.authorShare || 100;
      
      const cleanTitle = `"${pub.titleTh.replace(/"/g, '""')}"`;
      const cleanVenue = `"${pub.venueName.replace(/"/g, '""')}"`;
      const identifier = pub.doi || pub.isbn || '-';
      const evidenceLink = pub.fileUrl || 'ไม่มีไฟล์แนบ';

      csv += `${index + 1},${pub.yearBe},${pub.type},${cleanTitle},"${authorList}",${primaryShare},${pub.indexing},${pub.qaScore},${cleanVenue},${identifier},"${evidenceLink}"\n`;
    });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="LBC-RIS-SAR-QA-Report-${yearBe || 'All'}.csv"`,
      },
    });
  } catch (error) {
    console.error('QA Export Error:', error);
    return NextResponse.json({ error: 'Failed to export QA report' }, { status: 500 });
  }
}