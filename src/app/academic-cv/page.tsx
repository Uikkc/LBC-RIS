'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Printer, 
  ArrowLeft, 
  FileText, 
  Award, 
  User, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';

interface Publication {
  id: string;
  titleTh: string;
  titleEn?: string | null;
  type: string;
  indexing: string;
  venueName: string;
  yearBe: number;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  fileUrl?: string | null;
  status: string;
}

interface Authorship {
  authorRole: string;
  authorShare: number;
  publication: Publication;
}

interface GrantMilestone {
  milestoneNumber: number;
  title: string;
  disbursementAmount: number;
  status: string;
}

interface ResearchGrant {
  projectCode: string;
  titleTh: string;
  titleEn?: string | null;
  fundingSource: string;
  grantType: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  irbStatus: string;
  irbNumber?: string | null;
  milestones: GrantMilestone[];
}

interface GrantMembership {
  role: string;
  grant: ResearchGrant;
}

interface ProfileData {
  id: string;
  prefix: string;
  firstName: string;
  lastName?: string | null;
  chaya?: string | null;
  sanghaStatus: string;
  academicRank: string;
  targetRank?: string | null;
  email?: string | null;
  phone?: string | null;
  orcidId?: string | null;
  expertises?: string | null;
  teachingDocStatus?: string | null;
  teachingDocTitle?: string | null;
  teachingDocFileUrl?: string | null;
  department: {
    nameTh: string;
    nameEn?: string | null;
  };
  authorships: Authorship[];
  grantMemberships: GrantMembership[];
}

interface ProfileOption {
  id: string;
  prefix: string;
  firstName: string;
  lastName?: string | null;
  chaya?: string | null;
  academicRank: string;
  department: { nameTh: string };
}

function AcademicCVContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [allProfiles, setAllProfiles] = useState<ProfileOption[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [docMode, setDocMode] = useState<'GORPOROR' | 'CV'>('GORPOROR');
  const [loading, setLoading] = useState(true);

  const fetchProfileCV = (id?: string) => {
    setLoading(true);
    const q = id ? `profileId=${id}` : (searchParams.get('profileId') ? `profileId=${searchParams.get('profileId')}` : '');
    fetch(`/api/academic-cv?${q}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setSelectedProfileId(data.profile.id);
        }
        if (data.allProfiles) {
          setAllProfiles(data.allProfiles);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const initialMode = searchParams.get('mode');
    if (initialMode === 'cv') {
      setDocMode('CV');
    }
    fetchProfileCV();
  }, [searchParams]);

  const handleProfileChange = (newId: string) => {
    setSelectedProfileId(newId);
    fetchProfileCV(newId);
  };

  const handlePrint = () => {
    window.print();
  };

  const rankTitles: Record<string, string> = {
    NONE: 'อาจารย์ผู้สอน (ยังไม่มีตำแหน่งทางวิชาการ)',
    LECTURER: 'อาจารย์',
    ASST_PROF: 'ผู้ช่วยศาสตราจารย์ (ผศ.)',
    ASSOC_PROF: 'รองศาสตราจารย์ (รศ.)',
    PROF: 'ศาสตราจารย์ (ศ.)',
  };

  const roleTitles: Record<string, string> = {
    FIRST_AUTHOR: 'ผู้ประพันธ์อันดับแรก (First Author)',
    CORRESPONDING: 'ผู้ประพันธ์บรรณกิจ (Corresponding Author)',
    CO_AUTHOR: 'ผู้ร่วมวิจัย (Co-Author)',
  };

  const pubTypeTitles: Record<string, string> = {
    JOURNAL: 'บทความวิจัยในวารสารวิชาการ',
    CONFERENCE: 'บทความในการประชุมวิชาการ',
    BOOK: 'ตำราหรือหนังสือวิชาการ',
    CREATIVE_WORK: 'ผลงานสร้างสรรค์ทางวิชาการ',
  };

  return (
    <div className="space-y-6">
      {/* Control Bar - Hidden when printing */}
      <div className="print:hidden bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/academic-ranks"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="กลับไปหน้าเกณฑ์ขอตำแหน่ง"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              แบบฟอร์มเอกสารทางวิชาการทางการ (Official Academic Documents)
            </h1>
            <p className="text-xs text-slate-500">
              วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Faculty Selector */}
          <select
            value={selectedProfileId}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 shadow-2xs"
          >
            {allProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prefix} {p.firstName} {p.lastName || ''} {p.chaya ? `(${p.chaya})` : ''} - {p.academicRank}
              </option>
            ))}
          </select>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDocMode('GORPOROR')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                docMode === 'GORPOROR'
                  ? 'bg-white text-brand-primary shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แบบ ก.พ.อ. 03
            </button>
            <button
              type="button"
              onClick={() => setDocMode('CV')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                docMode === 'CV'
                  ? 'bg-white text-brand-primary shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curriculum Vitae (CV)
            </button>
          </div>

          {/* Print Action */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์เอกสาร (Print / Save as PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Container */}
      {loading || !profile ? (
        <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
      ) : (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md max-w-5xl mx-auto print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none text-slate-900 leading-relaxed font-sans">
          
          {/* Institutional Official Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900 space-y-2">
            {/* Emblem / Badge */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-900 text-white font-bold text-xl shadow-xs mx-auto mb-1 print:border print:border-slate-800">
              มจร
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 uppercase">
              มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย วิทยาลัยสงฆ์เลย
            </h2>
            <p className="text-xs text-slate-600">
              Loei Buddhist College, Mahachulalongkornrajavidyalaya University
            </p>

            {docMode === 'GORPOROR' ? (
              <div className="pt-2">
                <span className="inline-block px-4 py-1 rounded bg-slate-100 border border-slate-300 text-sm font-bold text-slate-900 uppercase">
                  แบบ ก.พ.อ. 03
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  แบบแสดงหลักฐานการมีส่วนร่วมในผลงานทางวิชาการและประวัติผลงาน
                </h3>
                <p className="text-xs text-slate-600">
                  ประกอบการขอกำหนดตำแหน่งทางวิชาการ ระดับ {rankTitles[profile.targetRank || 'ASST_PROF']}
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <h3 className="text-lg font-black text-slate-900 tracking-wider uppercase">
                  CURRICULUM VITAE & ACADEMIC PORTFOLIO
                </h3>
                <p className="text-xs text-slate-600">
                  ประวัติและผลงานวิชาการเพื่อการวิจัยและพัฒนา
                </p>
              </div>
            )}
          </div>

          {/* Section 1: ข้อมูลประวัติและตำแหน่งทางวิชาการ */}
          <div className="py-6 border-b border-slate-200 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>ส่วนที่ 1: ข้อมูลส่วนบุคคลและตำแหน่งวิชาการ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold shrink-0">ชื่อ-นามสกุล / สมณศักดิ์:</span>
                <strong className="text-slate-900">
                  {profile.prefix} {profile.firstName} {profile.lastName || ''} {profile.chaya ? `(${profile.chaya})` : ''}
                </strong>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold shrink-0">สถานภาพ:</span>
                <span className="text-slate-900">
                  {profile.sanghaStatus === 'MONK' ? 'พระภิกษุสงฆ์' : 'คฤหัสถ์'}
                </span>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold shrink-0">ตำแหน่งวิชาการปัจจุบัน:</span>
                <strong className="text-slate-900">
                  {rankTitles[profile.academicRank] || profile.academicRank}
                </strong>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold shrink-0">ตำแหน่งที่เสนอขอ:</span>
                <strong className="text-brand-primary">
                  {rankTitles[profile.targetRank || 'ASST_PROF']}
                </strong>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold shrink-0">สังกัดสาขาวิชา:</span>
                <span className="text-slate-900">{profile.department.nameTh}</span>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold shrink-0">ช่องทางติดต่อ / อีเมล:</span>
                <span className="text-slate-900">{profile.email || '-'} {profile.phone ? `(${profile.phone})` : ''}</span>
              </div>

              {profile.orcidId && (
                <div className="flex sm:col-span-2">
                  <span className="w-36 text-slate-500 font-semibold shrink-0">ORCID iD:</span>
                  <span className="font-mono text-slate-800">{profile.orcidId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: ตารางแสดงรายละเอียดผลงานทางวิชาการและสัดส่วนการมีส่วนร่วม */}
          <div className="py-6 border-b border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                <span>ส่วนที่ 2: ผลงานทางวิชาการและสัดส่วนการมีส่วนร่วม (Publication & Authorship)</span>
              </h4>
              <span className="text-xs text-slate-500">
                รวม {profile.authorships.length} ผลงาน
              </span>
            </div>

            {profile.authorships.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                ยังไม่มีรายการผลงานทางวิชาการที่บันทึกในระบบ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                      <th className="p-2.5 border-r border-slate-300 w-10 text-center">ลำดับ</th>
                      <th className="p-2.5 border-r border-slate-300">ชื่อผลงานวิชาการ / แหล่งเผยแพร่</th>
                      <th className="p-2.5 border-r border-slate-300 w-28 text-center">ประเภท / ฐาน</th>
                      <th className="p-2.5 border-r border-slate-300 w-28 text-center">ปีที่เผยแพร่</th>
                      <th className="p-2.5 border-r border-slate-300 w-36 text-center">บทบาทและสัดส่วน</th>
                      <th className="p-2.5 w-24 text-center print:hidden">หลักฐาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {profile.authorships.map((auth, idx) => {
                      const pub = auth.publication;
                      return (
                        <tr key={pub.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-600 align-top">
                            {idx + 1}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 space-y-1 align-top">
                            <div className="font-bold text-slate-900 leading-snug">{pub.titleTh}</div>
                            {pub.titleEn && (
                              <div className="text-[11px] text-slate-500 italic leading-tight">{pub.titleEn}</div>
                            )}
                            <div className="text-[11px] text-slate-600 pt-0.5">
                              <strong>แหล่งตีพิมพ์:</strong> {pub.venueName}
                              {pub.volume && ` ปีที่ ${pub.volume}`}
                              {pub.issue && ` ฉบับที่ ${pub.issue}`}
                              {pub.pages && ` หน้า ${pub.pages}`}
                            </div>
                            {pub.doi && (
                              <div className="text-[10px] text-slate-400 font-mono">DOI: {pub.doi}</div>
                            )}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center align-top space-y-1">
                            <span className="block font-semibold text-[11px] text-slate-700">
                              {pubTypeTitles[pub.type] || pub.type}
                            </span>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {pub.indexing}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center align-top font-semibold text-slate-700">
                            พ.ศ. {pub.yearBe}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center align-top space-y-1">
                            <span className="block font-bold text-slate-800 text-[11px]">
                              {roleTitles[auth.authorRole] || auth.authorRole}
                            </span>
                            <span className="inline-block text-xs font-black text-brand-primary bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {auth.authorShare}%
                            </span>
                          </td>
                          <td className="p-2.5 text-center align-top print:hidden">
                            {pub.fileUrl ? (
                              <a
                                href={pub.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-semibold"
                              >
                                <FileText className="w-3 h-3" />
                                <span>PDF</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: โครงการวิจัยและทุนสนับสนุน */}
          <div className="py-6 border-b border-slate-200 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              <span>ส่วนที่ 3: โครงการวิจัยและทุนสนับสนุนการวิจัย (Research Grants & Funding)</span>
            </h4>

            {profile.grantMemberships.length === 0 ? (
              <p className="text-xs text-slate-500 italic">ไม่มีประวัติโครงการวิจัยที่ได้รับทุน</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                      <th className="p-2 border-r border-slate-300 w-10 text-center">ลำดับ</th>
                      <th className="p-2 border-r border-slate-300">รหัส / ชื่อโครงการวิจัย</th>
                      <th className="p-2 border-r border-slate-300 w-32">แหล่งทุนวิจัย</th>
                      <th className="p-2 border-r border-slate-300 w-28 text-right">งบประมาณ</th>
                      <th className="p-2 border-r border-slate-300 w-32 text-center">จริยธรรมในมนุษย์ (IRB)</th>
                      <th className="p-2 w-28 text-center">บทบาท</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {profile.grantMemberships.map((mem, idx) => {
                      const g = mem.grant;
                      return (
                        <tr key={g.projectCode} className="hover:bg-slate-50/50">
                          <td className="p-2 border-r border-slate-200 text-center font-bold align-top">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 align-top space-y-0.5">
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">
                              {g.projectCode}
                            </span>
                            <div className="font-bold text-slate-900 leading-snug">{g.titleTh}</div>
                          </td>
                          <td className="p-2 border-r border-slate-200 align-top">{g.fundingSource}</td>
                          <td className="p-2 border-r border-slate-200 align-top text-right font-bold text-slate-800">
                            ฿{g.totalBudget.toLocaleString()}
                          </td>
                          <td className="p-2 border-r border-slate-200 align-top text-center">
                            {g.irbStatus === 'APPROVED' ? (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {g.irbNumber || 'ผ่านรับรองแล้ว'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">-</span>
                            )}
                          </td>
                          <td className="p-2 text-center align-top font-semibold text-slate-700">{mem.role}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: เอกสารประกอบการสอน / ตำราวิชาการ */}
          <div className="py-6 border-b border-slate-200 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              <span>ส่วนที่ 4: เอกสารประกอบการสอน / เอกสารคำสอน / ตำราวิชาการ</span>
            </h4>

            {profile.teachingDocTitle ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 text-sm">{profile.teachingDocTitle}</strong>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {profile.teachingDocStatus === 'COMPLETED' ? 'จัดทำสมบูรณ์แล้ว' : 'อยู่ระหว่างจัดทำ'}
                  </span>
                </div>
                <p className="text-slate-500">เอกสารประกอบการเรียนการสอนเพื่อประกอบการขอกำหนดตำแหน่งทางวิชาการ</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">ยังไม่มีการบันทึกเอกสารประกอบการสอนในระบบ</p>
            )}
          </div>

          {/* Section 5: คำรับรองความถูกต้องและช่องลงนาม (Sign-off Section) */}
          <div className="pt-8 space-y-8 print:pt-6">
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border-none print:p-0">
              <strong className="block mb-1 text-slate-900">คำรับรองความถูกต้องของผู้ขอรับการประเมิน:</strong>
              ข้าพเจ้าขอรับรองว่าข้อความและเอกสารหลักฐานผลงานทางวิชาการ ตลอดจนสัดส่วนการมีส่วนร่วมในผลงานทางวิชาการที่ระบุไว้ข้างต้น เป็นความจริงทุกประการ และผลงานดังกล่าวไม่เคยนำไปใช้ในการขอประเมินตำแหน่งทางวิชาการใดมาก่อน
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-xs pt-4">
              {/* Applicant Signature */}
              <div className="space-y-12">
                <span className="font-semibold text-slate-600 block">ผู้ขอรับการประเมิน</span>
                <div className="space-y-1">
                  <div className="border-b border-dashed border-slate-400 w-44 mx-auto"></div>
                  <p className="font-bold text-slate-900 pt-1">
                    ({profile.prefix} {profile.firstName} {profile.lastName || ''} {profile.chaya ? ` ${profile.chaya}` : ''})
                  </p>
                  <p className="text-[11px] text-slate-500">วันที่ ......../......../................</p>
                </div>
              </div>

              {/* Department Head Signature */}
              <div className="space-y-12">
                <span className="font-semibold text-slate-600 block">ผู้รับรอง (หัวหน้าสาขาวิชา)</span>
                <div className="space-y-1">
                  <div className="border-b border-dashed border-slate-400 w-44 mx-auto"></div>
                  <p className="font-bold text-slate-900 pt-1">(........................................................)</p>
                  <p className="text-[11px] text-slate-500">หัวหน้า{profile.department.nameTh}</p>
                  <p className="text-[11px] text-slate-500">วันที่ ......../......../................</p>
                </div>
              </div>

              {/* Dean / College Director Signature */}
              <div className="space-y-12">
                <span className="font-semibold text-slate-600 block">ผู้อำนวยการวิทยาลัยสงฆ์เลย</span>
                <div className="space-y-1">
                  <div className="border-b border-dashed border-slate-400 w-44 mx-auto"></div>
                  <p className="font-bold text-slate-900 pt-1">(พระครูปริยัติวีราภรณ์, รศ.ดร.)</p>
                  <p className="text-[11px] text-slate-500">ผู้อำนวยการวิทยาลัยสงฆ์เลย</p>
                  <p className="text-[11px] text-slate-500">วันที่ ......../......../................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AcademicCVPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 font-semibold bg-white rounded-2xl border border-slate-200">
        กำลังจัดเตรียมเอกสารทางวิชาการ (Academic Documents)...
      </div>
    }>
      <AcademicCVContent />
    </Suspense>
  );
}
