'use client';

import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  User, 
  BookOpen, 
  TrendingUp, 
  Printer, 
  ExternalLink, 
  Upload, 
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';

interface ProfileSummary {
  id: string;
  prefix: string;
  firstName: string;
  lastName?: string;
  chaya?: string;
  academicRank: string;
  targetRank: string;
  teachingDocStatus?: string;
  teachingDocTitle?: string;
  teachingDocFileUrl?: string;
  departmentName?: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  requiredText: string;
  actualText: string;
  passed: boolean;
  scoreWeight: number;
  detailList?: string[];
}

interface EvaluationData {
  targetRank: string;
  targetRankTitle: string;
  currentRank: string;
  currentRankTitle: string;
  readinessPercentage: number;
  isReadyToApply: boolean;
  passedCount: number;
  totalCount: number;
  items: ChecklistItem[];
  gaps: string[];
  recommendation: string;
}

export default function AcademicRankPage() {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<ProfileSummary | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [targetRank, setTargetRank] = useState<string>('ASST_PROF');
  const [loading, setLoading] = useState(true);

  // Teaching Document Modal
  const [isTeachingModalOpen, setIsTeachingModalOpen] = useState(false);
  const [teachingTitle, setTeachingTitle] = useState('');
  const [teachingStatus, setTeachingStatus] = useState('COMPLETED');
  const [teachingFileUrl, setTeachingFileUrl] = useState('');
  const [savingDoc, setSavingDoc] = useState(false);

  // Fetch Evaluation
  const fetchEvaluation = (profId?: string, rank?: string) => {
    setLoading(true);
    const pid = profId || selectedProfileId;
    const rk = rank || targetRank;
    const url = `/api/academic-rank?${pid ? `profileId=${pid}&` : ''}${rk ? `targetRank=${rk}` : ''}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setCurrentProfile(data.profile);
          setSelectedProfileId(data.profile.id);
          setTeachingTitle(data.profile.teachingDocTitle || '');
          setTeachingStatus(data.profile.teachingDocStatus || 'COMPLETED');
          setTeachingFileUrl(data.profile.teachingDocFileUrl || '');
        }
        if (data.evaluation) {
          setEvaluation(data.evaluation);
          setTargetRank(data.evaluation.targetRank);
        }
        if (data.allProfiles) {
          setProfiles(data.allProfiles);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const handleProfileChange = (newProfileId: string) => {
    setSelectedProfileId(newProfileId);
    fetchEvaluation(newProfileId, targetRank);
  };

  const handleRankChange = (newRank: string) => {
    setTargetRank(newRank);
    fetchEvaluation(selectedProfileId, newRank);
  };

  const handleSaveTeachingDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) return;
    setSavingDoc(true);

    try {
      const res = await fetch('/api/academic-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: currentProfile.id,
          targetRank,
          teachingDocStatus: teachingStatus,
          teachingDocTitle: teachingTitle,
          teachingDocFileUrl: teachingFileUrl,
        }),
      });

      if (res.ok) {
        setIsTeachingModalOpen(false);
        fetchEvaluation(currentProfile.id, targetRank);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกเอกสารประกอบการสอน');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSavingDoc(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-primary text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>เกณฑ์ ก.พ.อ. กระทรวง อว. ฉบับล่าสุด</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ระบบประเมินความพร้อมสู่ตำแหน่งทางวิชาการ</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เครื่องมือช่วยคณาจารย์วิทยาลัยสงฆ์เลย ตรวจสอบผลงานวิชาการและวางแผนขอกำหนดตำแหน่ง ผศ. / รศ. / ศ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            title="พิมพ์รายงานสรุปผลการประเมิน (Audit Report)"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ผลการประเมิน (PDF)</span>
          </button>

          {/* Update Teaching Doc Button */}
          <button
            onClick={() => setIsTeachingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>บันทึกเอกสารคำสอน/ตำรา</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Faculty Selector & Target Rank Buttons */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
          {/* Select Researcher Profile */}
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              เลือกอาจารย์ / นักวิจัยที่ต้องการประเมิน
            </label>
            <div className="relative">
              <select
                value={selectedProfileId}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="w-full sm:max-w-md px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 shadow-2xs focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.prefix} {p.firstName} {p.lastName || ''} {p.chaya ? `(${p.chaya})` : ''} - {p.academicRank !== 'NONE' ? p.academicRank : 'อาจารย์'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Rank Badge */}
          {currentProfile && (
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-500 block">ตำแหน่งวิชาการปัจจุบัน:</span>
                <span className="text-xs font-bold text-slate-900">
                  {currentProfile.prefix} {currentProfile.firstName} {currentProfile.chaya ? `(${currentProfile.chaya})` : ''}
                </span>
                <span className="ml-2 text-[11px] font-semibold text-brand-primary bg-rose-50 px-2 py-0.5 rounded">
                  {currentProfile.academicRank}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Target Rank Switcher */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            เป้าหมายตำแหน่งทางวิชาการที่ต้องการยื่นขอ (Target Academic Rank):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'ASST_PROF', title: 'ผู้ช่วยศาสตราจารย์ (ผศ.)', desc: 'บทความ TCI 2 เรื่อง + เอกสารคำสอน 1 เล่ม' },
              { id: 'ASSOC_PROF', title: 'รองศาสตราจารย์ (รศ.)', desc: 'บทความ TCI-1/Scopus 3 เรื่อง + ตำรา 1 เล่ม' },
              { id: 'PROF', title: 'ศาสตราจารย์ (ศ.)', desc: 'ผลงานระดับนานาชาติ Scopus 5 เรื่อง + ตำรา 2 เล่ม' },
            ].map((rk) => (
              <button
                key={rk.id}
                type="button"
                onClick={() => handleRankChange(rk.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  targetRank === rk.id
                    ? 'bg-brand-primary text-white border-brand-primary shadow-xs ring-2 ring-brand-primary/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{rk.title}</span>
                  {targetRank === rk.id && <Check className="w-4 h-4" />}
                </div>
                <p className={`text-[11px] mt-1 line-clamp-1 ${targetRank === rk.id ? 'text-rose-100' : 'text-slate-500'}`}>
                  {rk.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Readiness Gauge & Evaluation Summary */}
      {loading || !evaluation ? (
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
      ) : (
        <>
          {/* Readiness Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
              {/* Left: Visual Percentage Meter */}
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-8 transition-all ${
                    evaluation.isReadyToApply
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                      : evaluation.readinessPercentage >= 70
                        ? 'border-amber-500 text-amber-700 bg-amber-50'
                        : 'border-brand-primary text-brand-primary bg-rose-50'
                  }`}>
                    <div className="text-center">
                      <span className="text-2xl font-black">{evaluation.readinessPercentage}%</span>
                      <span className="text-[10px] block font-semibold text-slate-500">ความพร้อม</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 font-medium">การประเมินเพื่อยื่นขอ:</span>
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      {evaluation.targetRankTitle}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    ผ่านแล้ว {evaluation.passedCount} จาก {evaluation.totalCount} เกณฑ์ ก.พ.อ.
                  </div>
                  <p className="text-xs text-slate-500">
                    {evaluation.isReadyToApply
                      ? 'คุณสมบัติและผลงานครบถ้วน พร้อมยื่นเสนอแต่งตั้งตำแหน่งวิชาการ'
                      : 'ยังมีเกณฑ์ที่ต้องดำเนินการเพิ่มเติมก่อนส่งตรวจประเมิน'}
                  </p>
                </div>
              </div>

              {/* Right: Status Indicator Badge */}
              <div className="text-center md:text-right">
                {evaluation.isReadyToApply ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>พร้อมยื่นขอตำแหน่งแล้ว (Ready to Apply)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-sm shadow-2xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span>ขาดอีก {evaluation.gaps.length} รายการจึงจะครบเกณฑ์</span>
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Advice Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              evaluation.isReadyToApply
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <span className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                evaluation.isReadyToApply ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  คำแนะนำเชิงกลยุทธ์จากระบบ (Strategic Gap Advice):
                </h4>
                <p className="text-xs leading-relaxed font-medium">
                  {evaluation.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* 5-Point Detailed Checklist Cards */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-primary" />
              <span>เกณฑ์มาตรฐาน ก.พ.อ. 5 มิติ (Detailed Criteria Breakdown)</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {evaluation.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    item.passed
                      ? 'bg-white border-emerald-200/80 shadow-2xs hover:border-emerald-300'
                      : 'bg-white border-rose-200/80 shadow-2xs hover:border-rose-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-xl shrink-0 ${
                        item.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">เกณฑ์ที่ {index + 1}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.passed ? 'ผ่านเกณฑ์แล้ว' : 'ยังไม่ครบเกณฑ์'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400">ค่าน้ำหนักเกณฑ์:</span>
                      <strong className="ml-1 text-slate-700">{item.scoreWeight}%</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 pl-11">{item.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-11 pt-1 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">เกณฑ์ขั้นต่ำที่ ก.พ.อ. กำหนด:</span>
                      <strong className="text-slate-800">{item.requiredText}</strong>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${
                      item.passed ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900' : 'bg-rose-50/60 border-rose-100 text-rose-900'
                    }`}>
                      <span className="block text-[11px] opacity-75">ผลงานที่มีจริงในระบบ:</span>
                      <strong>{item.actualText}</strong>
                    </div>
                  </div>

                  {/* Detail List of Papers / Textbooks */}
                  {item.detailList && item.detailList.length > 0 && (
                    <div className="pl-11 pt-1">
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                        <span className="font-semibold text-slate-500 block text-[11px]">รายการผลงานที่เข้าเกณฑ์:</span>
                        {item.detailList.map((detail, idx) => (
                          <div key={idx} className="line-clamp-1">{detail}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal: Teaching Document & Book Uploader */}
      {isTeachingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  บันทึกเอกสารประกอบการสอน / เอกสารคำสอน / ตำรา
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  หลักฐานประกอบการขอกำหนดตำแหน่ง ผศ. / รศ. ตามเกณฑ์ ก.พ.อ.
                </p>
              </div>
              <button 
                onClick={() => setIsTeachingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeachingDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อเอกสารประกอบการสอน / เอกสารคำสอน / ตำรา *
                </label>
                <input
                  type="text"
                  required
                  value={teachingTitle}
                  onChange={(e) => setTeachingTitle(e.target.value)}
                  placeholder="เช่น เอกสารประกอบการสอน รายวิชาพระพุทธศาสนากับการพัฒนาสังคม"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะความสมบูรณ์ของเอกสาร</label>
                <select
                  value={teachingStatus}
                  onChange={(e) => setTeachingStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="COMPLETED">จัดทำเสร็จสมบูรณ์และผ่านการใช้สอนแล้ว (ใช้ยื่นได้)</option>
                  <option value="IN_PROGRESS">อยู่ระหว่างการเรียบเรียง / ปรับปรุง</option>
                </select>
              </div>

              {/* Upload Document PDF into Evidence Vault */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  แนบไฟล์เอกสารประกอบการสอน / ตำรา (PDF ฉบับสมบูรณ์)
                </label>
                <FileUpload
                  label="แนบไฟล์เอกสารประกอบการสอน (PDF)"
                  helperText="รองรับไฟล์ PDF ขนาดไม่เกิน 25 MB"
                  value={teachingFileUrl}
                  onChange={(url: string | null) => setTeachingFileUrl(url || '')}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeachingModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow-xs disabled:opacity-50"
                >
                  {savingDoc ? 'กำลังบันทึก...' : 'บันทึกข้อมูลเอกสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
