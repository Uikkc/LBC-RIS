'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  BookOpen,
  FlaskConical,
  HeartHandshake,
  Landmark,
  Briefcase,
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  User,
  Building,
  Calendar,
  Loader2,
  ChevronRight,
  ExternalLink,
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

interface CourseItem {
  code: string;
  name: string;
  credits: number;
  lectureHours: number;
  labHours: number;
  studentsCount: number;
}

interface ActivityItem {
  activity: string;
  hours: number;
}

interface AdminItem {
  role: string;
  hours: number;
}

interface HarvestedResearchItem {
  type: string;
  title: string;
  roleOrIndexing: string;
  creditHours: number;
}

interface HarvestedResearch {
  recommendedHours: number;
  totalHarvestedRawHours: number;
  harvestedItems: HarvestedResearchItem[];
}

export default function AcademicWorkloadPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<number>(2567);
  const [semester, setSemester] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // 5 Pillars State
  const [teachingCourses, setTeachingCourses] = useState<CourseItem[]>([]);
  const [researchHours, setResearchHours] = useState<number>(0);
  const [harvestedResearch, setHarvestedResearch] = useState<HarvestedResearch | null>(null);
  const [serviceActivities, setServiceActivities] = useState<ActivityItem[]>([]);
  const [cultureActivities, setCultureActivities] = useState<ActivityItem[]>([]);
  const [adminRoles, setAdminRoles] = useState<AdminItem[]>([]);
  const [evidenceFileUrl, setEvidenceFileUrl] = useState<string | null>(null);
  const [evaluatorFeedback, setEvaluatorFeedback] = useState<string>('');
  const [evaluatorName, setEvaluatorName] = useState<string>('');
  const [workloadStatus, setWorkloadStatus] = useState<string>('DRAFT');

  // Input states for adding items
  const [newCourse, setNewCourse] = useState<CourseItem>({
    code: '',
    name: '',
    credits: 3,
    lectureHours: 3,
    labHours: 0,
    studentsCount: 30,
  });
  const [newService, setNewService] = useState<ActivityItem>({ activity: '', hours: 2 });
  const [newCulture, setNewCulture] = useState<ActivityItem>({ activity: '', hours: 2 });
  const [newAdmin, setNewAdmin] = useState<AdminItem>({ role: '', hours: 2 });

  const activeProfile = profiles.find((p) => p.id === selectedProfileId);

  const fetchWorkloadData = async (profileId: string, yr: number, sem: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/workload?profileId=${profileId}&academicYear=${yr}&semester=${sem}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
        if (!selectedProfileId && data.activeProfileId) {
          setSelectedProfileId(data.activeProfileId);
        }

        setHarvestedResearch(data.harvestedResearch || null);

        if (data.workload) {
          const wl = data.workload;
          setWorkloadStatus(wl.status);
          setEvaluatorFeedback(wl.evaluatorFeedback || '');
          setEvaluatorName(wl.evaluatorName || '');
          setEvidenceFileUrl(wl.evidenceFileUrl || null);
          setResearchHours(wl.researchHours);

          try {
            setTeachingCourses(wl.teachingDetails ? JSON.parse(wl.teachingDetails) : []);
          } catch {
            setTeachingCourses([]);
          }

          try {
            setServiceActivities(wl.serviceDetails ? JSON.parse(wl.serviceDetails) : []);
          } catch {
            setServiceActivities([]);
          }

          try {
            setCultureActivities(wl.cultureDetails ? JSON.parse(wl.cultureDetails) : []);
          } catch {
            setCultureActivities([]);
          }

          try {
            setAdminRoles(wl.adminDetails ? JSON.parse(wl.adminDetails) : []);
          } catch {
            setAdminRoles([]);
          }
        } else {
          // New record default: Auto-populate research hours from harvested items
          setWorkloadStatus('DRAFT');
          setEvaluatorFeedback('');
          setEvaluatorName('');
          setEvidenceFileUrl(null);
          setTeachingCourses([]);
          setServiceActivities([]);
          setCultureActivities([]);
          setAdminRoles([]);
          if (data.harvestedResearch) {
            setResearchHours(data.harvestedResearch.recommendedHours);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load workload:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloadData(selectedProfileId, academicYear, semester);
  }, [selectedProfileId, academicYear, semester]);

  // Calculate hours
  const teachingHours = teachingCourses.reduce(
    (sum, c) => sum + (c.lectureHours + c.labHours * 0.5),
    0
  );
  const serviceHours = serviceActivities.reduce((sum, s) => sum + s.hours, 0);
  const cultureHours = cultureActivities.reduce((sum, c) => sum + c.hours, 0);
  const adminHours = adminRoles.reduce((sum, a) => sum + a.hours, 0);
  const totalHours = teachingHours + researchHours + serviceHours + cultureHours + adminHours;

  const isPassed = totalHours >= 18.0;

  const getEvaluationTier = (hours: number) => {
    if (hours >= 35.0) return { label: 'ดีเด่น (Outstanding)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (hours >= 28.0) return { label: 'ดีมาก (Very Good)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (hours >= 18.0) return { label: 'ดี (Good - ผ่านเกณฑ์)', color: 'text-slate-800 bg-slate-100 border-slate-300' };
    return { label: 'ต้องปรับปรุง (ต่ำกว่าเกณฑ์ 18 ชม.)', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const handleSave = async (statusToSave: string = workloadStatus) => {
    if (!selectedProfileId) return;
    try {
      setSaving(true);
      const payload = {
        profileId: selectedProfileId,
        academicYear,
        semester,
        teachingHours,
        teachingDetails: JSON.stringify(teachingCourses),
        researchHours,
        researchDetails: harvestedResearch
          ? JSON.stringify({
              summary: `งานวิจัยเก็บเกี่ยวอัตโนมัติ (${researchHours} ชม.)`,
              items: harvestedResearch.harvestedItems,
            })
          : null,
        serviceHours,
        serviceDetails: JSON.stringify(serviceActivities),
        cultureHours,
        cultureDetails: JSON.stringify(cultureActivities),
        adminHours,
        adminDetails: JSON.stringify(adminRoles),
        status: statusToSave,
        evaluatorFeedback,
        evaluatorName,
        evidenceFileUrl,
      };

      const res = await fetch('/api/workload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (error) {
      console.error('Error saving workload:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatFullName = (p?: Profile) => {
    if (!p) return '';
    let name = '';
    if (p.sanghaStatus === 'MONK') {
      name = `${p.prefix}${p.firstName} ${p.chaya || ''}`;
    } else {
      name = `${p.prefix}${p.firstName} ${p.lastName || ''}`;
    }
    if (p.academicRank && p.academicRank !== 'NONE') {
      const map: Record<string, string> = { ASST_PROF: 'ผศ.', ASSOC_PROF: 'รศ.', PROF: 'ศ.' };
      name += `, ${map[p.academicRank] || p.academicRank}`;
    }
    return name;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Non-Printable Header & Controls */}
      <div className="print:hidden space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-900 text-white tracking-wide uppercase">
                Academic Workload & TOR Appraisal
              </span>
              <span className="text-xs text-slate-500 font-medium">เกณฑ์ ก.พ.อ. และข้อบังคับ มจร.</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
              <ClipboardCheck className="w-7 h-7 text-rose-900" />
              ระบบประเมินภาระงานวิชาการและข้อตกลงการปฏิบัติงาน (TOR)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย — สรุปภาระงาน 5 ด้าน พร้อมดึงผลงานวิจัยอัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              พิมพ์แบบ ทร. ๐๑ (A4)
            </button>
            <button
              onClick={() => handleSave(workloadStatus)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-900 text-white text-xs font-medium hover:bg-rose-950 transition-colors shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  บันทึกข้อมูล TOR
                </>
              )}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกข้อมูลข้อตกลงและภาระงานวิชาการเรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Profile & Semester Selector Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Professor Selector */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">อาจารย์ผู้รับการประเมิน:</span>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:ring-1 focus:ring-rose-800"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatFullName(p)} ({p.department?.nameTh || 'วิทยาลัยสงฆ์เลย'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Year */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">ปีการศึกษา:</span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-1 focus:ring-rose-800"
              >
                <option value={2567}>2567</option>
                <option value={2566}>2566</option>
                <option value={2565}>2565</option>
              </select>
            </div>

            {/* Semester */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">ภาคการศึกษา:</span>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-1 focus:ring-rose-800"
              >
                <option value={1}>ภาคการศึกษาที่ 1</option>
                <option value={2}>ภาคการศึกษาที่ 2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workload Metric Gauge & Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rose-300 tracking-wider uppercase">
                  สรุปผลการประเมินภาระงานตามข้อบังคับ มจร.
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    getEvaluationTier(totalHours).color
                  }`}
                >
                  ระดับ: {getEvaluationTier(totalHours).label}
                </span>
              </div>
              <h2 className="text-2xl font-bold mt-1">
                {activeProfile ? formatFullName(activeProfile) : 'อาจารย์ประจำ'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeProfile?.department?.nameTh || 'วิทยาลัยสงฆ์เลย'} — ภาคการศึกษาที่ {semester} ปีการศึกษา {academicYear}
              </p>
            </div>

            {/* Hours Counter */}
            <div className="flex items-center gap-6 self-start md:self-auto">
              <div className="text-right">
                <div className="text-xs text-slate-400">ชั่วโมงภาระงานรวม</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-white">
                    {totalHours.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">ชม./สัปดาห์</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  เกณฑ์ขั้นต่ำ: 18.0 ชม./สัปดาห์
                </div>
              </div>

              <div className="h-12 w-px bg-slate-700" />

              <div className="flex flex-col items-center">
                {isPassed ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-700/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ผ่านเกณฑ์ขั้นต่ำ</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-700/50">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>ขาดอีก {(18.0 - totalHours).toFixed(1)} ชม.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mini 5-Pillar Bar Progress */}
          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <div className="text-[11px] text-slate-400">1. งานสอน</div>
              <div className="text-base font-bold text-slate-100">{teachingHours.toFixed(1)} ชม.</div>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <div className="text-[11px] text-rose-300 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                2. งานวิจัย (RIS)
              </div>
              <div className="text-base font-bold text-rose-200">{researchHours.toFixed(1)} ชม.</div>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <div className="text-[11px] text-slate-400">3. บริการวิชาการ</div>
              <div className="text-base font-bold text-slate-100">{serviceHours.toFixed(1)} ชม.</div>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <div className="text-[11px] text-slate-400">4. ศิลปวัฒนธรรม</div>
              <div className="text-base font-bold text-slate-100">{cultureHours.toFixed(1)} ชม.</div>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <div className="text-[11px] text-slate-400">5. งานบริหาร</div>
              <div className="text-base font-bold text-slate-100">{adminHours.toFixed(1)} ชม.</div>
            </div>
          </div>
        </div>

        {/* 5 Pillar Detail Workspaces */}
        <div className="space-y-6">
          {/* Pillar 1: Teaching */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-900 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ด้านที่ 1: งานจัดการเรียนการสอน (Teaching Workload)
                  </h3>
                  <p className="text-xs text-slate-500">
                    คำนวณตามชั่วโมงบรรยาย 1.0 ชม. และชั่วโมงปฏิบัติการ 0.5 ชม./สัปดาห์
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-rose-900 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                รวม: {teachingHours.toFixed(1)} ชม./สัปดาห์
              </span>
            </div>

            {/* Courses Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">รหัสวิชา</th>
                    <th className="py-2.5 px-3">ชื่อรายวิชา</th>
                    <th className="py-2.5 px-3 text-center">หน่วยกิต</th>
                    <th className="py-2.5 px-3 text-center">ชม.บรรยาย</th>
                    <th className="py-2.5 px-3 text-center">จำนวนนิสิต</th>
                    <th className="py-2.5 px-3 text-center">ชม.ภาระงาน</th>
                    <th className="py-2.5 px-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachingCourses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400 italic">
                        ยังไม่มีรายวิชาที่สอนในภาคการศึกษานี้ สามารถเพิ่มรายวิชาได้จากฟอร์มด้านล่าง
                      </td>
                    </tr>
                  ) : (
                    teachingCourses.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{c.code}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">{c.name}</td>
                        <td className="py-2.5 px-3 text-center">{c.credits}</td>
                        <td className="py-2.5 px-3 text-center">{c.lectureHours}</td>
                        <td className="py-2.5 px-3 text-center">{c.studentsCount} รูป/คน</td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-900">
                          {(c.lectureHours + c.labHours * 0.5).toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setTeachingCourses(teachingCourses.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Course Form */}
            <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="รหัสวิชา (เช่น 000 156)"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white w-28"
              />
              <input
                type="text"
                placeholder="ชื่อรายวิชา"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white flex-1 min-w-[160px]"
              />
              <input
                type="number"
                placeholder="หน่วยกิต"
                value={newCourse.credits}
                onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white w-18 text-center"
              />
              <input
                type="number"
                placeholder="ชม.สอน"
                value={newCourse.lectureHours}
                onChange={(e) => setNewCourse({ ...newCourse, lectureHours: Number(e.target.value) })}
                className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white w-18 text-center"
              />
              <input
                type="number"
                placeholder="จำนวนนิสิต"
                value={newCourse.studentsCount}
                onChange={(e) => setNewCourse({ ...newCourse, studentsCount: Number(e.target.value) })}
                className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white w-22 text-center"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCourse.code && newCourse.name) {
                    setTeachingCourses([...teachingCourses, newCourse]);
                    setNewCourse({ code: '', name: '', credits: 3, lectureHours: 3, labHours: 0, studentsCount: 30 });
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-900 text-white font-medium hover:bg-rose-950 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มรายวิชา
              </button>
            </div>
          </div>

          {/* Pillar 2: Research (One-Click Auto-Harvested from RIS) */}
          <div className="bg-white rounded-xl border border-rose-200 shadow-xs p-5 ring-1 ring-rose-100">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-900 rounded-lg">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      ด้านที่ 2: งานวิจัยและงานวิชาการ (One-Click Auto-Harvested from RIS)
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-900 px-2 py-0.5 rounded-full border border-rose-200">
                      <Sparkles className="w-3 h-3" />
                      ดึงข้อมูลอัตโนมัติจากฐานข้อมูล
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    ดึงบทความตีพิมพ์ TCI/Scopus โครงการทุนวิจัย และการนำไปใช้ประโยชน์ใน LBC-RIS อัตโนมัติ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">ปรับแก้ชั่วโมงภาระงาน:</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={researchHours}
                  onChange={(e) => setResearchHours(Number(e.target.value))}
                  className="w-20 px-2.5 py-1 text-xs border border-rose-300 rounded-lg text-center font-bold text-rose-900 focus:ring-1 focus:ring-rose-800"
                />
                <span className="text-xs text-slate-600 font-semibold">ชม./สัปดาห์</span>
              </div>
            </div>

            {/* Harvested Items List */}
            {harvestedResearch && harvestedResearch.harvestedItems.length > 0 ? (
              <div className="space-y-2">
                {harvestedResearch.harvestedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-rose-50/40 rounded-lg border border-rose-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                        {item.type}
                      </span>
                      <span className="font-medium text-slate-800">{item.title}</span>
                      <span className="text-slate-500 text-[11px]">({item.roleOrIndexing})</span>
                    </div>
                    <span className="font-bold text-rose-900 shrink-0">
                      +{item.creditHours.toFixed(1)} ชม.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-500 italic">
                ยังไม่พบผลงานวิจัยหรือทุนวิจัยที่บันทึกในปีการศึกษานี้ในคลัง LBC-RIS
              </div>
            )}
          </div>

          {/* Pillars 3 & 4 Grid: Academic Services & Cultural Preservation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 3: Academic Services */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-800 rounded-lg">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ด้านที่ 3: การบริการวิชาการแก่สังคม
                  </h3>
                </div>
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {serviceHours.toFixed(1)} ชม.
                </span>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {serviceActivities.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs text-slate-800 border border-slate-100"
                  >
                    <span>{s.activity}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-800">{s.hours} ชม.</span>
                      <button
                        onClick={() => setServiceActivities(serviceActivities.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <input
                  type="text"
                  placeholder="กิจกรรม เช่น วิทยากรบรรยาย อสว."
                  value={newService.activity}
                  onChange={(e) => setNewService({ ...newService, activity: e.target.value })}
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg bg-white"
                />
                <input
                  type="number"
                  placeholder="ชม."
                  value={newService.hours}
                  onChange={(e) => setNewService({ ...newService, hours: Number(e.target.value) })}
                  className="w-14 px-2 py-1 border border-slate-300 rounded-lg bg-white text-center"
                />
                <button
                  onClick={() => {
                    if (newService.activity) {
                      setServiceActivities([...serviceActivities, newService]);
                      setNewService({ activity: '', hours: 2 });
                    }
                  }}
                  className="px-2.5 py-1 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pillar 4: Cultural Preservation */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-800 rounded-lg">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ด้านที่ 4: ทำนุบำรุงศิลปวัฒนธรรมพุทธ
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                  {cultureHours.toFixed(1)} ชม.
                </span>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {cultureActivities.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs text-slate-800 border border-slate-100"
                  >
                    <span>{c.activity}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-800">{c.hours} ชม.</span>
                      <button
                        onClick={() => setCultureActivities(cultureActivities.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <input
                  type="text"
                  placeholder="กิจกรรม เช่น สวดมนต์ข้ามปี, ประเพณีผีตาโขน"
                  value={newCulture.activity}
                  onChange={(e) => setNewCulture({ ...newCulture, activity: e.target.value })}
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg bg-white"
                />
                <input
                  type="number"
                  placeholder="ชม."
                  value={newCulture.hours}
                  onChange={(e) => setNewCulture({ ...newCulture, hours: Number(e.target.value) })}
                  className="w-14 px-2 py-1 border border-slate-300 rounded-lg bg-white text-center"
                />
                <button
                  onClick={() => {
                    if (newCulture.activity) {
                      setCultureActivities([...cultureActivities, newCulture]);
                      setNewCulture({ activity: '', hours: 2 });
                    }
                  }}
                  className="px-2.5 py-1 bg-amber-800 text-white rounded-lg hover:bg-amber-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Pillar 5: Administration & Advising */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-800 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ด้านที่ 5: งานบริหาร อาจารย์ที่ปรึกษา และภารกิจพิเศษ
                  </h3>
                  <p className="text-xs text-slate-500">
                    กรรมการหลักสูตร หัวหน้าสาขาวิชา อาจารย์ที่ปรึกษาประจำหมู่เรียน
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                รวม: {adminHours.toFixed(1)} ชม.
              </span>
            </div>

            <div className="space-y-2">
              {adminRoles.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs text-slate-800 border border-slate-100"
                >
                  <span>{a.role}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-800">{a.hours} ชม.</span>
                    <button
                      onClick={() => setAdminRoles(adminRoles.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="บทบาท เช่น กรรมการประจำหลักสูตร, อาจารย์ที่ปรึกษาชั้นปี 2"
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="number"
                placeholder="ชม."
                value={newAdmin.hours}
                onChange={(e) => setNewAdmin({ ...newAdmin, hours: Number(e.target.value) })}
                className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-center"
              />
              <button
                onClick={() => {
                  if (newAdmin.role) {
                    setAdminRoles([...adminRoles, newAdmin]);
                    setNewAdmin({ role: '', hours: 2 });
                  }
                }}
                className="px-3 py-1.5 bg-purple-800 text-white rounded-lg hover:bg-purple-900 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มภาระงานบริหาร
              </button>
            </div>
          </div>

          {/* Evidence Vault & Evaluator Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-900" />
                แนบหลักฐานตารางสอน / คำสั่งแต่งตั้ง (Evidence Vault)
              </h4>
              <FileUpload
                label="ตารางสอนหรือคำสั่งภาระงาน (PDF)"
                helperText="รองรับไฟล์ PDF ตารางสอนที่มีการรับรอง ขนาดไม่เกิน 25 MB"
                value={evidenceFileUrl}
                onChange={(url) => setEvidenceFileUrl(url)}
              />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-600" />
                ความเห็นของผู้ประเมิน / ผู้บังคับบัญชา
              </h4>
              <textarea
                rows={3}
                value={evaluatorFeedback}
                onChange={(e) => setEvaluatorFeedback(e.target.value)}
                placeholder="บันทึกความเห็นของผู้ประเมิน (หัวหน้าสาขาวิชา / รองผู้อำนวยการฝ่ายวิชาการ)..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-800"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  สถานะ: <strong className="text-slate-800">{workloadStatus}</strong>
                </span>
                <button
                  onClick={() => handleSave('APPROVED')}
                  className="px-3 py-1 rounded bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                >
                  อนุมัติผลการประเมิน (Approve)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY OFFICIAL A4 TOR LAYOUT (แบบ ทร. ๐๑)                             */}
      {/* ========================================================================= */}
      <div className="hidden print:block text-black bg-white p-8 max-w-4xl mx-auto font-serif">
        {/* Header */}
        <div className="text-center pb-4 border-b-2 border-black">
          <div className="text-base font-bold">วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</div>
          <div className="text-lg font-bold mt-1">แบบข้อตกลงและรายงานผลการปฏิบัติงานของอาจารย์ประจำ (แบบ ทร. ๐๑)</div>
          <div className="text-sm font-medium mt-0.5">
            ประจำภาคการศึกษาที่ {semester} ปีการศึกษา {academicYear}
          </div>
        </div>

        {/* Professor Information */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs leading-relaxed border-b border-black pb-3">
          <div>
            <strong>ชื่อ-ฉายา/นามสกุล:</strong> {activeProfile ? formatFullName(activeProfile) : '-'}
          </div>
          <div>
            <strong>สังกัด:</strong> {activeProfile?.department?.nameTh || 'วิทยาลัยสงฆ์เลย'}
          </div>
          <div>
            <strong>ตำแหน่งทางวิชาการ:</strong> {activeProfile?.academicRank || 'อาจารย์'}
          </div>
          <div>
            <strong>รอบการประเมิน:</strong> ภาคการศึกษาที่ {semester}/{academicYear}
          </div>
        </div>

        {/* Summary Table */}
        <div className="mt-4">
          <div className="text-sm font-bold mb-1.5">สรุปผลภาระงาน 5 ด้านตามเกณฑ์มาตรฐานขั้นต่ำ (18 ชม./สัปดาห์)</div>
          <table className="w-full text-xs border-collapse border border-black text-left">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-2 w-12 text-center">ลำดับ</th>
                <th className="border border-black p-2">ด้านภาระงาน</th>
                <th className="border border-black p-2 w-32 text-center">เกณฑ์มาตรฐาน</th>
                <th className="border border-black p-2 w-32 text-center">ภาระงานจริง (ชม./สัปดาห์)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-center">1</td>
                <td className="border border-black p-2">งานจัดการเรียนการสอน (Teaching)</td>
                <td className="border border-black p-2 text-center">ไม่น้อยกว่า 6 ชม.</td>
                <td className="border border-black p-2 text-center font-bold">{teachingHours.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center">2</td>
                <td className="border border-black p-2">งานวิจัยและงานวิชาการ (Research)</td>
                <td className="border border-black p-2 text-center">ตามข้อตกลง</td>
                <td className="border border-black p-2 text-center font-bold">{researchHours.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center">3</td>
                <td className="border border-black p-2">งานบริการวิชาการแก่สังคม (Academic Services)</td>
                <td className="border border-black p-2 text-center">ตามข้อตกลง</td>
                <td className="border border-black p-2 text-center font-bold">{serviceHours.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center">4</td>
                <td className="border border-black p-2">งานทำนุบำรุงศิลปวัฒนธรรมและพระพุทธศาสนา</td>
                <td className="border border-black p-2 text-center">ตามข้อตกลง</td>
                <td className="border border-black p-2 text-center font-bold">{cultureHours.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-center">5</td>
                <td className="border border-black p-2">งานบริหาร อาจารย์ที่ปรึกษา และภารกิจพิเศษ</td>
                <td className="border border-black p-2 text-center">ตามที่ได้รับมอบหมาย</td>
                <td className="border border-black p-2 text-center font-bold">{adminHours.toFixed(1)}</td>
              </tr>
              <tr className="font-bold bg-slate-100">
                <td colSpan={3} className="border border-black p-2 text-right">
                  รวมชั่วโมงภาระงานทั้งสิ้น (เกณฑ์ขั้นต่ำ 18.0 ชม./สัปดาห์)
                </td>
                <td className="border border-black p-2 text-center text-sm">{totalHours.toFixed(1)} ชม.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Evaluation Summary Verdict */}
        <div className="mt-4 p-3 border border-black text-xs">
          <div className="font-bold">ผลการประเมินเบื้องต้น:</div>
          <div className="mt-1 flex items-center justify-between">
            <span>
              สถานะ: <strong>{isPassed ? '✓ ผ่านเกณฑ์มาตรฐานขั้นต่ำ' : '✗ ไม่ผ่านเกณฑ์ขั้นต่ำ'}</strong>
            </span>
            <span>
              ระดับผลการประเมิน: <strong>{getEvaluationTier(totalHours).label}</strong>
            </span>
          </div>
          {evaluatorFeedback && (
            <div className="mt-2 text-slate-700">
              <strong>ความเห็นของผู้ประเมิน:</strong> {evaluatorFeedback}
            </div>
          )}
        </div>

        {/* 3 Signatures Block */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-b border-dotted border-black pb-1 mb-2">
              (................................................................)
            </div>
            <div>{activeProfile ? formatFullName(activeProfile) : 'อาจารย์ผู้รับการประเมิน'}</div>
            <div className="text-slate-600">ผู้รับการประเมิน</div>
            <div className="mt-1">วันที่ ......./......./.......</div>
          </div>

          <div>
            <div className="border-b border-dotted border-black pb-1 mb-2">
              (................................................................)
            </div>
            <div>หัวหน้าสาขาวิชา / ประธานหลักสูตร</div>
            <div className="text-slate-600">ผู้ประเมินชั้นต้น</div>
            <div className="mt-1">วันที่ ......./......./.......</div>
          </div>

          <div>
            <div className="border-b border-dotted border-black pb-1 mb-2">
              (................................................................)
            </div>
            <div>ผู้อำนวยการวิทยาลัยสงฆ์เลย</div>
            <div className="text-slate-600">ผู้บังคับบัญชาชั้นเหนือขึ้นไป</div>
            <div className="mt-1">วันที่ ......./......./.......</div>
          </div>
        </div>
      </div>
    </div>
  );
}
