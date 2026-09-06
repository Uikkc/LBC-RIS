export interface RankChecklistItem {
  id: string;
  category: 'RESEARCH' | 'TEACHING' | 'AUTHORSHIP' | 'EVIDENCE' | 'TIME_IN_RANK';
  title: string;
  description: string;
  requiredText: string;
  actualText: string;
  passed: boolean;
  scoreWeight: number; // Percentage contribution
  detailList?: string[];
}

export interface RankEvaluationResult {
  targetRank: string;
  targetRankTitle: string;
  currentRank: string;
  currentRankTitle: string;
  readinessPercentage: number;
  isReadyToApply: boolean;
  passedCount: number;
  totalCount: number;
  items: RankChecklistItem[];
  gaps: string[];
  recommendation: string;
}

export function evaluateAcademicRank(profile: {
  academicRank: string;
  targetRank?: string | null;
  teachingDocStatus?: string | null;
  teachingDocTitle?: string | null;
  teachingDocFileUrl?: string | null;
  authorships: Array<{
    authorRole: string;
    authorShare: number;
    publication: {
      id: string;
      titleTh: string;
      type: string;
      indexing: string;
      yearBe: number;
      fileUrl?: string | null;
      status: string;
    };
  }>;
  grantMemberships?: Array<{
    role: string;
    grant: {
      grantType: string;
      titleTh: string;
    };
  }>;
}, selectedTargetRank?: string): RankEvaluationResult {
  const target = selectedTargetRank || profile.targetRank || 'ASST_PROF';

  const rankTitles: Record<string, string> = {
    NONE: 'อาจารย์ผู้สอน (ยังไม่มีตำแหน่งทางวิชาการ)',
    LECTURER: 'อาจารย์',
    ASST_PROF: 'ผู้ช่วยศาสตราจารย์ (ผศ.)',
    ASSOC_PROF: 'รองศาสตราจารย์ (รศ.)',
    PROF: 'ศาสตราจารย์ (ศ.)',
  };

  const publications = profile.authorships?.map((a) => ({
    ...a.publication,
    authorRole: a.authorRole,
    authorShare: a.authorShare,
  })) || [];

  const items: RankChecklistItem[] = [];
  const gaps: string[] = [];

  if (target === 'ASST_PROF') {
    // 1. Research Articles in TCI-1 or TCI-2
    const qualifiedJournals = publications.filter(
      (p) =>
        p.type === 'JOURNAL' &&
        ['TCI_TIER_1', 'TCI_TIER_2', 'SCOPUS_Q1-Q4', 'WOS'].includes(p.indexing)
    );
    const passJournals = qualifiedJournals.length >= 2;
    items.push({
      id: 'asst-1',
      category: 'RESEARCH',
      title: 'บทความวิจัยในวารสารวิชาการที่ ก.พ.อ. รับรอง',
      description: 'บทความวิจัยที่ได้รับการตีพิมพ์ในวารสาร TCI กลุ่ม 1, TCI กลุ่ม 2 หรือฐานข้อมูลสากล',
      requiredText: 'อย่างน้อย 2 เรื่อง',
      actualText: `${qualifiedJournals.length} เรื่อง`,
      passed: passJournals,
      scoreWeight: 30,
      detailList: qualifiedJournals.map((p) => `• ${p.titleTh} (${p.indexing}, พ.ศ. ${p.yearBe})`),
    });
    if (!passJournals) {
      gaps.push(`ยังขาดบทความวิจัยในวารสาร TCI อีก ${Math.max(0, 2 - qualifiedJournals.length)} เรื่อง`);
    }

    // 2. Primary Authorship (First/Corresponding >= 50%)
    const primaryAuthorships = qualifiedJournals.filter(
      (p) =>
        ['FIRST_AUTHOR', 'CORRESPONDING'].includes(p.authorRole) &&
        p.authorShare >= 50.0
    );
    const passAuthorship = primaryAuthorships.length >= 1;
    items.push({
      id: 'asst-2',
      category: 'AUTHORSHIP',
      title: 'สัดส่วนความเป็นผู้ประพันธ์หลัก (First / Corresponding Author)',
      description: 'ต้องมีชื่อเป็นผู้ประพันธ์อันดับแรกหรือผู้ประพันธ์บรรณกิจที่มีสัดส่วนตั้งแต่ร้อยละ 50 ขึ้นไป',
      requiredText: 'อย่างน้อย 1 เรื่อง (สัดส่วน ≥ 50%)',
      actualText: `${primaryAuthorships.length} เรื่องที่เข้าเกณฑ์`,
      passed: passAuthorship,
      scoreWeight: 20,
      detailList: primaryAuthorships.map((p) => `• ${p.titleTh} (สัดส่วน ${p.authorShare}%)`),
    });
    if (!passAuthorship) {
      gaps.push('ขาดบทความที่ท่านเป็นชื่อแรก (First Author) หรือผู้รับผิดชอบหลักที่มีสัดส่วน ≥ 50%');
    }

    // 3. Teaching Documents (เอกสารประกอบการสอน / เอกสารคำสอน)
    const hasTeachingDoc =
      profile.teachingDocStatus === 'COMPLETED' ||
      publications.some((p) => p.type === 'BOOK');
    items.push({
      id: 'asst-3',
      category: 'TEACHING',
      title: 'เอกสารประกอบการสอน / เอกสารคำสอนที่มีคุณภาพ',
      description: 'เอกสารประกอบการสอนในรายวิชาที่สอนประจำตามหลักสูตรที่ผ่านการใช้สอนมาแล้ว',
      requiredText: 'อย่างน้อย 1 รายวิชา',
      actualText: hasTeachingDoc ? (profile.teachingDocTitle || 'มีเอกสารคำสอนสมบูรณ์') : 'ยังไม่มีเอกสารคำสอนในระบบ',
      passed: hasTeachingDoc,
      scoreWeight: 25,
      detailList: profile.teachingDocTitle ? [`• ${profile.teachingDocTitle}`] : undefined,
    });
    if (!hasTeachingDoc) {
      gaps.push('ยังไม่มีเอกสารประกอบการสอน/เอกสารคำสอนอย่างน้อย 1 รายวิชา');
    }

    // 4. Evidence PDF Vault Attached
    const journalsWithPdf = qualifiedJournals.filter((p) => !!p.fileUrl);
    const passEvidence = qualifiedJournals.length > 0 && journalsWithPdf.length === qualifiedJournals.length;
    items.push({
      id: 'asst-4',
      category: 'EVIDENCE',
      title: 'ความสมบูรณ์ของเอกสารหลักฐานจริง (PDF Vault)',
      description: 'บทความวิจัยที่ยื่นต้องมีไฟล์เอกสารฉบับเต็มและใบตอบรับตีพิมพ์ในระบบ Vault',
      requiredText: 'แนบไฟล์หลักฐานครบ 100%',
      actualText: `แนบแล้ว ${journalsWithPdf.length}/${qualifiedJournals.length} เรื่อง`,
      passed: passEvidence,
      scoreWeight: 15,
    });
    if (!passEvidence && qualifiedJournals.length > 0) {
      gaps.push(`มีบทความวิจัยอีก ${qualifiedJournals.length - journalsWithPdf.length} เรื่องที่ยังไม่ได้แนบไฟล์ PDF หลักฐาน`);
    }

    // 5. Academic Ethics & Verification
    const allVerified = qualifiedJournals.length > 0 && qualifiedJournals.every((p) => p.status === 'VERIFIED');
    items.push({
      id: 'asst-5',
      category: 'RESEARCH',
      title: 'การตรวจสอบและรับรองผลงานทางวิชาการ',
      description: 'ผลงานผ่านการตรวจสอบความถูกต้องโดยฝ่ายวิจัยและไม่มีการคัดลอกวรรณกรรม',
      requiredText: 'ผ่านการรับรองทุกเรื่อง',
      actualText: allVerified ? 'ผ่านการรับรองแล้ว' : 'มีผลงานที่รอการตรวจรับรอง',
      passed: allVerified,
      scoreWeight: 10,
    });
  } else if (target === 'ASSOC_PROF') {
    // 1. High-Quality Research Articles (TCI-1 or Scopus >= 3)
    const tier1Journals = publications.filter(
      (p) =>
        p.type === 'JOURNAL' &&
        ['TCI_TIER_1', 'SCOPUS_Q1-Q4', 'WOS'].includes(p.indexing)
    );
    const passJournals = tier1Journals.length >= 3;
    items.push({
      id: 'assoc-1',
      category: 'RESEARCH',
      title: 'บทความวิจัยคุณภาพสูง (TCI กลุ่ม 1 หรือ Scopus)',
      description: 'บทความวิจัยที่ได้รับการตีพิมพ์ในวารสาร TCI กลุ่ม 1 หรือวารสารระดับนานาชาติ',
      requiredText: 'อย่างน้อย 3 เรื่อง',
      actualText: `${tier1Journals.length} เรื่อง`,
      passed: passJournals,
      scoreWeight: 30,
      detailList: tier1Journals.map((p) => `• ${p.titleTh} (${p.indexing})`),
    });
    if (!passJournals) {
      gaps.push(`ยังขาดบทความ TCI กลุ่ม 1 หรือ Scopus อีก ${Math.max(0, 3 - tier1Journals.length)} เรื่อง`);
    }

    // 2. Peer-reviewed Textbook / Book
    const books = publications.filter((p) => p.type === 'BOOK');
    const passBook = books.length >= 1 || profile.teachingDocStatus === 'COMPLETED';
    items.push({
      id: 'assoc-2',
      category: 'TEACHING',
      title: 'ตำราหรือหนังสือวิชาการที่ผ่านการประเมินคุณภาพ',
      description: 'ตำราหรือหนังสือทางวิชาการที่มีกระบวนการ Peer Review และใช้ประกอบการเรียนการสอน',
      requiredText: 'อย่างน้อย 1 เล่ม',
      actualText: passBook ? `${books.length > 0 ? books[0].titleTh : profile.teachingDocTitle || 'มีตำราสมบูรณ์'}` : 'ยังไม่มีตำราหรือหนังสือวิชาการ',
      passed: passBook,
      scoreWeight: 25,
      detailList: books.map((b) => `• ${b.titleTh}`),
    });
    if (!passBook) {
      gaps.push('ยังขาดตำราหรือหนังสือวิชาการที่ผ่านการประเมินคุณภาพ 1 เล่ม');
    }

    // 3. First Authorship in at least 2 papers
    const primaryTier1 = tier1Journals.filter(
      (p) =>
        ['FIRST_AUTHOR', 'CORRESPONDING'].includes(p.authorRole) &&
        p.authorShare >= 50.0
    );
    const passAuthorship = primaryTier1.length >= 2;
    items.push({
      id: 'assoc-3',
      category: 'AUTHORSHIP',
      title: 'สัดส่วนความเป็นผู้ประพันธ์หลัก (First Author ≥ 50%)',
      description: 'ต้องมีชื่อเป็นผู้ประพันธ์อันดับแรกในบทความคุณภาพสูงอย่างน้อย 2 เรื่อง',
      requiredText: 'อย่างน้อย 2 เรื่อง',
      actualText: `${primaryTier1.length} เรื่อง`,
      passed: passAuthorship,
      scoreWeight: 20,
    });
    if (!passAuthorship) {
      gaps.push(`ยังขาดบทความที่เป็นชื่อแรก (First Author ≥ 50%) อีก ${Math.max(0, 2 - primaryTier1.length)} เรื่อง`);
    }

    // 4. Current Rank Requirement (Must already be ASST_PROF)
    const passCurrentRank = profile.academicRank === 'ASST_PROF';
    items.push({
      id: 'assoc-4',
      category: 'TIME_IN_RANK',
      title: 'คุณสมบัติตำแหน่งเดิม (ดำรงตำแหน่ง ผศ.)',
      description: 'ต้องดำรงตำแหน่งผู้ช่วยศาสตราจารย์ (ผศ.) มาแล้วไม่น้อยกว่า 2-3 ปีตามเกณฑ์คุณวุฒิ',
      requiredText: 'ดำรงตำแหน่ง ผศ. แล้ว',
      actualText: rankTitles[profile.academicRank] || profile.academicRank,
      passed: passCurrentRank,
      scoreWeight: 15,
    });
    if (!passCurrentRank) {
      gaps.push('ท่านยังไม่ได้ดำรงตำแหน่ง ผศ. (ต้องขอตำแหน่ง ผศ. ก่อนยื่นขอ รศ.)');
    }

    // 5. Evidence Vault Completeness
    const booksAndJournals = [...tier1Journals, ...books];
    const withPdf = booksAndJournals.filter((b) => !!b.fileUrl);
    const passEvidence = booksAndJournals.length > 0 && withPdf.length === booksAndJournals.length;
    items.push({
      id: 'assoc-5',
      category: 'EVIDENCE',
      title: 'เอกสารหลักฐานตัวจริงครบถ้วน (PDF Vault)',
      description: 'บทความและตำราทุกเล่มต้องมีไฟล์หลักฐานฉบับสมบูรณ์ในระบบ Vault',
      requiredText: 'แนบครบ 100%',
      actualText: `แนบแล้ว ${withPdf.length}/${booksAndJournals.length} รายการ`,
      passed: passEvidence,
      scoreWeight: 10,
    });
  } else {
    // Professor (ศ.) Criteria
    const scopusJournals = publications.filter(
      (p) => ['SCOPUS_Q1-Q4', 'WOS'].includes(p.indexing)
    );
    const books = publications.filter((p) => p.type === 'BOOK');
    const passJournals = scopusJournals.length >= 5;
    const passBooks = books.length >= 1;

    items.push({
      id: 'prof-1',
      category: 'RESEARCH',
      title: 'ผลงานวิจัยระดับนานาชาติ (Scopus / Web of Science)',
      description: 'บทความวิจัยที่ได้รับการตีพิมพ์ในวารสารฐานข้อมูลสากล Scopus หรือ Web of Science',
      requiredText: 'อย่างน้อย 5 เรื่อง',
      actualText: `${scopusJournals.length} เรื่อง`,
      passed: passJournals,
      scoreWeight: 40,
    });

    items.push({
      id: 'prof-2',
      category: 'TEACHING',
      title: 'ตำราหรือหนังสือวิชาการระดับเชี่ยวชาญ',
      description: 'ตำราวิชาการระดับลึกซึ้งที่ผ่านการประเมินคุณภาพระดับดีมาก',
      requiredText: 'อย่างน้อย 1-2 เล่ม',
      actualText: `${books.length} เล่ม`,
      passed: passBooks,
      scoreWeight: 30,
    });

    items.push({
      id: 'prof-3',
      category: 'TIME_IN_RANK',
      title: 'ดำรงตำแหน่งรองศาสตราจารย์ (รศ.)',
      description: 'ต้องดำรงตำแหน่ง รศ. มาแล้วไม่น้อยกว่า 2 ปี',
      requiredText: 'ดำรงตำแหน่ง รศ. แล้ว',
      actualText: rankTitles[profile.academicRank] || profile.academicRank,
      passed: profile.academicRank === 'ASSOC_PROF',
      scoreWeight: 30,
    });

    if (!passJournals) gaps.push(`ยังขาดผลงานในฐาน Scopus อีก ${Math.max(0, 5 - scopusJournals.length)} เรื่อง`);
    if (!passBooks) gaps.push('ยังขาดตำราวิชาการอย่างน้อย 1 เล่ม');
    if (profile.academicRank !== 'ASSOC_PROF') gaps.push('ต้องดำรงตำแหน่ง รศ. ก่อนจึงจะขอตำแหน่ง ศ. ได้');
  }

  // Calculate weighted readiness percentage
  const totalScore = items.reduce((acc, item) => acc + (item.passed ? item.scoreWeight : 0), 0);
  const passedCount = items.filter((i) => i.passed).length;
  const isReadyToApply = gaps.length === 0 && totalScore >= 100;

  // Generate Strategic Recommendation Text
  let recommendation = '';
  if (isReadyToApply) {
    recommendation = `🎉 ยอดเยี่ยมมาก! ท่านมีผลงานครบถ้วนตามเกณฑ์ ก.พ.อ. ในการยื่นขอตำแหน่ง "${rankTitles[target]}" แล้ว สามารถจัดทำเอกสารและยื่นต่อคณะกรรมการพิจารณาตำแหน่งทางวิชาการของมหาวิทยาลัยได้ทันที`;
  } else if (totalScore >= 70) {
    recommendation = `📈 ความพร้อมของท่านอยู่ในระดับสูง (${totalScore}%) ใกล้ครบเกณฑ์แล้ว! โปรดดำเนินการปิดจุดที่ยังขาดอีกเพียงเล็กน้อย: ${gaps.join(', ')}`;
  } else {
    recommendation = `🎯 แนะนำให้วางแผนจัดทำผลงานเพื่อปิดช่องว่าง: ${gaps.join(', ')} เพื่อสะสมผลงานให้ครบตามเกณฑ์ ก.พ.อ.`;
  }

  return {
    targetRank: target,
    targetRankTitle: rankTitles[target] || target,
    currentRank: profile.academicRank,
    currentRankTitle: rankTitles[profile.academicRank] || profile.academicRank,
    readinessPercentage: totalScore,
    isReadyToApply,
    passedCount,
    totalCount: items.length,
    items,
    gaps,
    recommendation,
  };
}
