'use client';

import { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Search,
  Filter,
  Landmark,
  Users,
  TrendingUp,
  GraduationCap,
  HeartHandshake,
  Coins,
  FileCheck,
  ExternalLink,
  Calendar,
  MapPin,
  Building,
  User,
  X,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';

interface Profile {
  id: string;
  prefix: string;
  firstName: string;
  lastName?: string;
  chaya?: string;
  academicRank: string;
  sanghaStatus: string;
  department?: {
    nameTh: string;
  };
}

interface Grant {
  id: string;
  projectCode: string;
  titleTh: string;
  fundingSource: string;
}

interface Publication {
  id: string;
  titleTh: string;
  venueName: string;
}

interface ResearchUtilization {
  id: string;
  title: string;
  dimension: 'POLICY' | 'PUBLIC_COMMUNITY' | 'ECONOMIC_LOCAL' | 'ACADEMIC';
  targetArea: string;
  targetGroup: string;
  impactDescription: string;
  benefitUnitCount?: number | null;
  economicValueThb?: number | null;
  certifyingAgency: string;
  certifierName?: string | null;
  letterNo?: string | null;
  letterDate?: string | null;
  evidenceFileUrl?: string | null;
  profileId: string;
  profile: Profile;
  grant?: Grant | null;
  publication?: Publication | null;
  status: string;
  yearBe: number;
  createdAt: string;
}

interface ImpactMetrics {
  totalCount: number;
  policyCount: number;
  publicCommunityCount: number;
  economicLocalCount: number;
  academicCount: number;
  totalBeneficiaries: number;
  totalEconomicValueThb: number;
  certifiedWithEvidenceCount: number;
}

export default function SocialImpactPage() {
  const [utilizations, setUtilizations] = useState<ResearchUtilization[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reference data for form dropdowns
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    dimension: 'POLICY' | 'PUBLIC_COMMUNITY' | 'ECONOMIC_LOCAL' | 'ACADEMIC';
    yearBe: number;
    targetArea: string;
    targetGroup: string;
    impactDescription: string;
    benefitUnitCount: number | '';
    economicValueThb: number | '';
    certifyingAgency: string;
    certifierName: string;
    letterNo: string;
    letterDate: string;
    evidenceFileUrl: string | null;
    profileId: string;
    grantId: string;
  }>({
    title: '',
    dimension: 'POLICY',
    yearBe: 2567,
    targetArea: '',
    targetGroup: '',
    impactDescription: '',
    benefitUnitCount: '',
    economicValueThb: '',
    certifyingAgency: '',
    certifierName: '',
    letterNo: '',
    letterDate: '',
    evidenceFileUrl: null,
    profileId: '',
    grantId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `/api/utilizations?dimension=${selectedDimension}&yearBe=${selectedYear}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setUtilizations(json.data || []);
        setMetrics(json.metrics || null);
      }
    } catch (error) {
      console.error('Failed to load utilization records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDimension, selectedYear]);

  // Load profiles and grants for modal
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProfiles(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, profileId: prev.profileId || data[0].id }));
          }
        }
      })
      .catch((err) => console.error('Error fetching profiles:', err));

    fetch('/api/grants')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGrants(data);
        }
      })
      .catch((err) => console.error('Error fetching grants:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        ...formData,
        benefitUnitCount: formData.benefitUnitCount === '' ? null : Number(formData.benefitUnitCount),
        economicValueThb: formData.economicValueThb === '' ? null : Number(formData.economicValueThb),
        grantId: formData.grantId || null,
        letterDate: formData.letterDate || null,
      };

      const res = await fetch('/api/utilizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      setIsModalOpen(false);
      // Reset form
      setFormData({
        title: '',
        dimension: 'POLICY',
        yearBe: 2567,
        targetArea: '',
        targetGroup: '',
        impactDescription: '',
        benefitUnitCount: '',
        economicValueThb: '',
        certifyingAgency: '',
        certifierName: '',
        letterNo: '',
        letterDate: '',
        evidenceFileUrl: null,
        profileId: profiles[0]?.id || '',
        grantId: '',
      });
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
      }
    } finally {
      setSaving(false);
    }
  };

  const getDimensionBadge = (dimension: string) => {
    switch (dimension) {
      case 'POLICY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Landmark className="w-3.5 h-3.5" />
            เชิงนโยบาย (Policy)
          </span>
        );
      case 'PUBLIC_COMMUNITY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Users className="w-3.5 h-3.5" />
            เชิงสาธารณะ / ชุมชน
          </span>
        );
      case 'ECONOMIC_LOCAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <TrendingUp className="w-3.5 h-3.5" />
            เชิงเศรษฐกิจฐานราก
          </span>
        );
      case 'ACADEMIC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <GraduationCap className="w-3.5 h-3.5" />
            เชิงวิชาการ (Academic)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            ทั่วไป
          </span>
        );
    }
  };

  const formatResearcherName = (p: Profile) => {
    let name = '';
    if (p.sanghaStatus === 'MONK') {
      name = `${p.prefix}${p.firstName} ${p.chaya || ''}`;
    } else {
      name = `${p.prefix}${p.firstName} ${p.lastName || ''}`;
    }

    if (p.academicRank && p.academicRank !== 'NONE') {
      const rankMap: Record<string, string> = {
        ASST_PROF: 'ผศ.',
        ASSOC_PROF: 'รศ.',
        PROF: 'ศ.',
      };
      name += `, ${rankMap[p.academicRank] || p.academicRank}`;
    }
    return name;
  };

  // Filter list by local search text
  const filteredUtilizations = utilizations.filter((item) => {
    const text = `${item.title} ${item.targetArea} ${item.targetGroup} ${item.certifyingAgency} ${item.impactDescription} ${item.profile.firstName}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-900 text-white tracking-wide uppercase">
              Research Utilization & Social Impact
            </span>
            <span className="text-xs text-slate-500 font-medium">มาตรฐาน อว. / สมศ.</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-rose-900" />
            ระบบบันทึกการนำผลงานวิจัยไปใช้ประโยชน์และผลกระทบต่อสังคม
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย — ติดตามผลกระทบ 4 มิติ พร้อมหนังสือรับรองความสำเร็จจากหน่วยงานภายนอก
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-900 text-white hover:bg-rose-950 font-medium shadow-sm transition-colors self-start md:self-auto shrink-0"
        >
          <Plus className="w-5 h-5" />
          บันทึกการนำไปใช้ประโยชน์ใหม่
        </button>
      </div>

      {/* Impact Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
        {/* Beneficiaries Count */}
        <div className="col-span-2 md:col-span-1 lg:col-span-2 bg-gradient-to-br from-rose-900 to-rose-950 text-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-200">ผู้ได้รับประโยชน์สะสม</span>
            <HeartHandshake className="w-5 h-5 text-rose-300" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {metrics ? metrics.totalBeneficiaries.toLocaleString() : '0'}
            </span>
            <span className="text-xs text-rose-200">รูป / คน</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-200/80">
            พระภิกษุสามเณรและประชาชนในชุมชนเป้าหมาย
          </div>
        </div>

        {/* Economic Value */}
        <div className="col-span-2 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-200">มูลค่าผลกระทบเศรษฐกิจชุมชน</span>
            <Coins className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xs text-emerald-200 font-medium">฿</span>
            <span className="text-3xl font-extrabold tracking-tight">
              {metrics ? metrics.totalEconomicValueThb.toLocaleString() : '0'}
            </span>
            <span className="text-xs text-emerald-200">บาท</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-200/80">
            รายได้หมุนเวียนวิสาหกิจชุมชนและการท่องเที่ยวเชิงพุทธ
          </div>
        </div>

        {/* Policy Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-700">เชิงนโยบาย</span>
            <Landmark className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {metrics ? metrics.policyCount : 0}
            <span className="text-xs font-normal text-slate-500 ml-1">เรื่อง</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">ธรรมนูญ/ยุทธศาสตร์</div>
        </div>

        {/* Public & Community Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-700">เชิงสาธารณะ</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {metrics ? metrics.publicCommunityCount : 0}
            <span className="text-xs font-normal text-slate-500 ml-1">เรื่อง</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">ชุมชน / สุขภาวะสงฆ์</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Dimension Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'POLICY', label: 'เชิงนโยบาย' },
              { id: 'PUBLIC_COMMUNITY', label: 'เชิงสาธารณะ/ชุมชน' },
              { id: 'ECONOMIC_LOCAL', label: 'เชิงเศรษฐกิจฐานราก' },
              { id: 'ACADEMIC', label: 'เชิงวิชาการ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDimension(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedDimension === tab.id
                    ? 'bg-rose-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 shrink-0">ปี พ.ศ.:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-1 focus:ring-rose-800"
              >
                <option value="ALL">ทุกปี</option>
                <option value="2567">2567</option>
                <option value="2566">2566</option>
                <option value="2565">2565</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อผลงาน, พื้นที่, หน่วยงาน..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-800 text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Utilization Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filteredUtilizations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">ไม่พบข้อมูลการนำผลงานวิจัยไปใช้ประโยชน์</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            ยังไม่มีบันทึกข้อมูลในมิติที่เลือก หรือคำค้นหานี้ สามารถเริ่มบันทึกการนำผลงานวิจัยไปใช้ประโยชน์เพื่อสะสมคะแนนประกันคุณภาพ (QA)
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-900 text-white text-xs font-medium hover:bg-rose-950 transition-colors"
          >
            <Plus className="w-4 h-4" />
            บันทึกการนำไปใช้ประโยชน์ใหม่
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUtilizations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all p-5"
            >
              {/* Top Row: Dimension Badge & Year */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getDimensionBadge(item.dimension)}
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    ปี พ.ศ. {item.yearBe}
                  </span>
                  {item.evidenceFileUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <FileCheck className="w-3.5 h-3.5" />
                      มีหนังสือรับรองทางการ
                    </span>
                  )}
                </div>

                {item.benefitUnitCount && (
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-950 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    <Users className="w-3.5 h-3.5 text-rose-800" />
                    ผู้ได้รับประโยชน์: {item.benefitUnitCount.toLocaleString()} รูป/คน
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {item.title}
              </h3>

              {/* Target Area & Target Group */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <span className="flex items-center gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-800 shrink-0" />
                  <strong className="font-semibold">พื้นที่:</strong> {item.targetArea}
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <strong className="font-semibold">กลุ่มเป้าหมาย:</strong> {item.targetGroup}
                </span>
                {item.economicValueThb && (
                  <span className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Coins className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    มูลค่าเศรษฐกิจ: ฿{item.economicValueThb.toLocaleString()} บาท
                  </span>
                )}
              </div>

              {/* Impact Description */}
              <p className="mt-3 text-xs leading-relaxed text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                {item.impactDescription}
              </p>

              {/* External Certification Block */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white -mx-5 -mb-5 p-4 rounded-b-xl">
                <div className="text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>หน่วยงานรับรอง:</span>
                    <strong className="text-slate-900">{item.certifyingAgency}</strong>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-1 pl-5">
                    {item.certifierName && <span>ผู้ลงนาม: {item.certifierName}</span>}
                    {item.letterNo && <span>เลขที่หนังสือ: {item.letterNo}</span>}
                    {item.letterDate && (
                      <span>
                        ลงวันที่:{' '}
                        {new Date(item.letterDate).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.evidenceFileUrl ? (
                    <a
                      href={item.evidenceFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900 text-white text-xs font-medium hover:bg-rose-950 transition-colors shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      เปิดดูหนังสือรับรองจริง (PDF)
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      ไม่มีไฟล์หนังสือรับรองแนบ
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Researcher Link */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>ผู้วิจัยผู้รับผิดชอบ:</span>
                  <span className="font-semibold text-slate-700">
                    {formatResearcherName(item.profile)}
                  </span>
                  {item.profile.department && (
                    <span className="text-slate-400">({item.profile.department.nameTh})</span>
                  )}
                </div>

                {item.grant && (
                  <div className="text-slate-500 hidden sm:block">
                    โครงการทุน: <span className="font-medium text-slate-700">{item.grant.titleTh}</span> ({item.grant.fundingSource})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Utilization Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-rose-900" />
                <h2 className="text-lg font-bold text-slate-900">
                  บันทึกการนำผลงานวิจัยไปใช้ประโยชน์และผลกระทบต่อสังคม
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>{formError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  ชื่อผลงาน / โครงการวิจัย / นวัตกรรมที่นำไปใช้ประโยชน์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น ธรรมนูญสุขภาพพระสงฆ์จังหวัดเลย, โมเดลท่องเที่ยวพุทธเชียงคาน"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                />
              </div>

              {/* Dimension & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    มิติการนำไปใช้ประโยชน์ (ตามเกณฑ์ อว./สมศ.) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.dimension}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimension: e.target.value as 'POLICY' | 'PUBLIC_COMMUNITY' | 'ECONOMIC_LOCAL' | 'ACADEMIC',
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 focus:border-rose-800 bg-white"
                  >
                    <option value="POLICY">เชิงนโยบาย (Policy Impact)</option>
                    <option value="PUBLIC_COMMUNITY">เชิงสาธารณะ / ชุมชนท้องถิ่น</option>
                    <option value="ECONOMIC_LOCAL">เชิงพาณิชย์ / เศรษฐกิจฐานราก</option>
                    <option value="ACADEMIC">เชิงวิชาการ (Academic Impact)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    ปี พ.ศ. ที่นำไปใช้ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={2500}
                    max={2600}
                    value={formData.yearBe}
                    onChange={(e) => setFormData({ ...formData, yearBe: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                  />
                </div>
              </div>

              {/* Target Area & Target Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    พื้นที่เป้าหมาย / พื้นที่นำไปปฏิบัติ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.targetArea}
                    onChange={(e) => setFormData({ ...formData, targetArea: e.target.value })}
                    placeholder="เช่น 14 อำเภอใน จ.เลย, อ.เชียงคาน"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    กลุ่มเป้าหมาย / ผู้ได้รับผลกระทบ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.targetGroup}
                    onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                    placeholder="เช่น พระภิกษุสามเณร 1,250 รูป, วิสาหกิจชุมชน 120 ครัวเรือน"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  รายละเอียดการนำไปใช้ประโยชน์และผลกระทบที่เกิดขึ้น <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.impactDescription}
                  onChange={(e) => setFormData({ ...formData, impactDescription: e.target.value })}
                  placeholder="อธิบายว่าหน่วยงานนำไปใช้อย่างไร เกิดการเปลี่ยนแปลงหรือแก้ไขปัญหาอะไรในพื้นที่อย่างเป็นรูปธรรม..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                />
              </div>

              {/* Beneficiary Count & Economic Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    จำนวนผู้ได้รับประโยชน์จริง (รูป / คน)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.benefitUnitCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        benefitUnitCount: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    placeholder="เช่น 1250"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    มูลค่าผลกระทบเศรษฐกิจฐานราก (บาท) <span className="text-slate-400 font-normal">(ถ้ามี)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formData.economicValueThb}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        economicValueThb: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    placeholder="เช่น 1450000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                  />
                </div>
              </div>

              {/* Institutional Certification Block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-rose-900" />
                  ข้อมูลการรับรองจากหน่วยงานภายนอก (ตามเกณฑ์ สมศ.)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      หน่วยงานที่นำไปใช้ประโยชน์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.certifyingAgency}
                      onChange={(e) => setFormData({ ...formData, certifyingAgency: e.target.value })}
                      placeholder="เช่น สำนักงานสาธารณสุขจังหวัดเลย, อบต.เชียงคาน"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ชื่อ-ตำแหน่งผู้ลงนามรับรอง
                    </label>
                    <input
                      type="text"
                      value={formData.certifierName}
                      onChange={(e) => setFormData({ ...formData, certifierName: e.target.value })}
                      placeholder="เช่น นพ.ชาญชัย บุญอยู่ (นายแพทย์ สสจ.เลย)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      เลขที่หนังสือรับรอง
                    </label>
                    <input
                      type="text"
                      value={formData.letterNo}
                      onChange={(e) => setFormData({ ...formData, letterNo: e.target.value })}
                      placeholder="เช่น ลย ๐๐๓๓.๐๐๑/ว ๑๔๘๙"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      วันที่ออกหนังสือรับรอง
                    </label>
                    <input
                      type="date"
                      value={formData.letterDate}
                      onChange={(e) => setFormData({ ...formData, letterDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* File Upload via Evidence Vault */}
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <FileUpload
                    label="แนบไฟล์หนังสือรับรองการนำไปใช้ประโยชน์จริง (PDF / ภาพถ่าย)"
                    helperText="รองรับไฟล์ PDF หรือรูปภาพหนังสือราชการที่มีตราครุฑและลายเซ็น ขนาดไม่เกิน 25 MB"
                    value={formData.evidenceFileUrl}
                    onChange={(url) => setFormData({ ...formData, evidenceFileUrl: url })}
                  />
                </div>
              </div>

              {/* Link to Researcher & Grant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    ผู้วิจัยผู้รับผิดชอบผลงาน <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.profileId}
                    onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 bg-white"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {formatResearcherName(p)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    เชื่อมโยงกับทุนวิจัย <span className="text-slate-400 font-normal">(ถ้ามี)</span>
                  </label>
                  <select
                    value={formData.grantId}
                    onChange={(e) => setFormData({ ...formData, grantId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800 bg-white"
                  >
                    <option value="">-- ไม่เชื่อมโยงโครงการทุน --</option>
                    {grants.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.projectCode}: {g.titleTh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-rose-900 hover:bg-rose-950 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังบันทึกข้อมูล...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      บันทึกข้อมูลผลกระทบทางสังคม
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
