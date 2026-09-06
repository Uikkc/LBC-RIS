'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  User, 
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ExternalLink,
  Upload,
  Filter,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';

interface Milestone {
  id: string;
  milestoneNumber: number;
  title: string;
  dueDate: string;
  submittedDate?: string;
  disbursementAmount: number;
  status: string; // PENDING, SUBMITTED, APPROVED
  deliverableFileUrl?: string;
}

interface Grant {
  id: string;
  projectCode: string;
  titleTh: string;
  titleEn?: string;
  fundingSource: string;
  grantType: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  status: string;
  // IRB Fields
  irbStatus: string; // NOT_REQUIRED, UNDER_REVIEW, APPROVED, EXPIRED
  irbNumber?: string;
  irbApprovalDate?: string;
  irbExpireDate?: string;
  irbFileUrl?: string;
  members: Array<{
    role: string;
    profile: {
      prefix: string;
      firstName: string;
      lastName?: string;
      chaya?: string;
    };
  }>;
  milestones: Milestone[];
}

export default function GrantsTracker() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON' | 'IRB_APPROVED'>('ALL');

  // Submit Milestone Modal State
  const [selectedMilestone, setSelectedMilestone] = useState<{
    grantId: string;
    milestone: Milestone;
  } | null>(null);
  const [milestoneDeliverableUrl, setMilestoneDeliverableUrl] = useState('');
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  // New Grant Form State
  const [formData, setFormData] = useState({
    projectCode: `LBC-GRT-2567-00${Math.floor(Math.random() * 90) + 10}`,
    titleTh: '',
    titleEn: '',
    fundingSource: 'กองทุนวิจัยพัฒนาวิทยาลัยสงฆ์เลย',
    grantType: 'INTERNAL',
    totalBudget: 100000,
    startDate: '2024-06-01',
    endDate: '2025-05-31',
    irbStatus: 'NOT_REQUIRED',
    irbNumber: '',
    irbApprovalDate: '',
    irbExpireDate: '',
    irbFileUrl: '',
  });

  const fetchGrants = () => {
    setLoading(true);
    fetch('/api/grants')
      .then((res) => res.json())
      .then((data: Grant[]) => {
        setGrants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  // Compute days difference between milestone dueDate and now
  const getDaysDiff = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Milestone deadline classification
  const getMilestoneUrgency = (milestone: Milestone) => {
    if (milestone.status === 'APPROVED') return 'APPROVED';
    if (milestone.status === 'SUBMITTED') return 'SUBMITTED';
    const diff = getDaysDiff(milestone.dueDate);
    if (diff < 0) return 'OVERDUE';
    if (diff <= 30) return 'DUE_SOON';
    return 'ON_TRACK';
  };

  // Summary Metrics for Alert Banner
  const alertStats = useMemo(() => {
    let overdueCount = 0;
    let dueSoonCount = 0;
    let irbApprovedCount = 0;
    let underReviewCount = 0;

    grants.forEach((grant) => {
      if (grant.irbStatus === 'APPROVED') irbApprovedCount++;
      if (grant.irbStatus === 'UNDER_REVIEW') underReviewCount++;

      grant.milestones?.forEach((m) => {
        const urgency = getMilestoneUrgency(m);
        if (urgency === 'OVERDUE') overdueCount++;
        if (urgency === 'DUE_SOON') dueSoonCount++;
      });
    });

    return { overdueCount, dueSoonCount, irbApprovedCount, underReviewCount };
  }, [grants]);

  // Filtered Grants based on Active Tab
  const filteredGrants = useMemo(() => {
    if (activeFilter === 'ALL') return grants;

    if (activeFilter === 'OVERDUE') {
      return grants.filter((g) =>
        g.milestones?.some((m) => getMilestoneUrgency(m) === 'OVERDUE')
      );
    }

    if (activeFilter === 'DUE_SOON') {
      return grants.filter((g) =>
        g.milestones?.some((m) => getMilestoneUrgency(m) === 'DUE_SOON')
      );
    }

    if (activeFilter === 'IRB_APPROVED') {
      return grants.filter((g) => g.irbStatus === 'APPROVED');
    }

    return grants;
  }, [grants, activeFilter]);

  // Handle Form Submit for New Grant
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setFormData({
        projectCode: `LBC-GRT-2567-00${Math.floor(Math.random() * 90) + 10}`,
        titleTh: '',
        titleEn: '',
        fundingSource: 'กองทุนวิจัยพัฒนาวิทยาลัยสงฆ์เลย',
        grantType: 'INTERNAL',
        totalBudget: 100000,
        startDate: '2024-06-01',
        endDate: '2025-05-31',
        irbStatus: 'NOT_REQUIRED',
        irbNumber: '',
        irbApprovalDate: '',
        irbExpireDate: '',
        irbFileUrl: '',
      });
      fetchGrants();
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึกโครงการ');
    }
  };

  // Handle Submitting Deliverable Report for a Milestone
  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    setSubmittingMilestone(true);
    try {
      const res = await fetch('/api/grants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: selectedMilestone.milestone.id,
          status: 'SUBMITTED',
          deliverableFileUrl: milestoneDeliverableUrl || undefined,
        }),
      });

      if (res.ok) {
        setSelectedMilestone(null);
        setMilestoneDeliverableUrl('');
        fetchGrants();
      } else {
        alert('เกิดข้อผิดพลาดในการส่งรายงานงวดงาน');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSubmittingMilestone(false);
    }
  };

  // Handle Approving Milestone (for Staff / Admin)
  const handleApproveMilestone = async (milestoneId: string) => {
    if (!confirm('ยืนยันการตรวจรับและอนุมัติรายงานงวดงานนี้เพื่อเบิกจ่ายงวดเงิน?')) return;

    try {
      const res = await fetch('/api/grants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          status: 'APPROVED',
        }),
      });

      if (res.ok) {
        fetchGrants();
      } else {
        alert('เกิดข้อผิดพลาดในการอนุมัติงวดงาน');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-brand-primary" />
            <span>ระบบติดตามทุนและงวดงานวิจัย (Grant & Milestone Tracker)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            กำกับดูแลการดำเนินงานวิจัย การรับรองจริยธรรมในมนุษย์ (IRB) และระบบเตือนภัยกำหนดส่งงวดงาน
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-medium text-sm shadow transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มโครงการวิจัยใหม่</span>
        </button>
      </div>

      {/* Executive Alert & Urgency Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overdue Alert Card */}
        <div 
          onClick={() => setActiveFilter(activeFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeFilter === 'OVERDUE'
              ? 'bg-rose-100/70 border-rose-400 ring-2 ring-rose-300'
              : alertStats.overdueCount > 0 
                ? 'bg-rose-50/80 border-rose-200 hover:border-rose-300' 
                : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl ${alertStats.overdueCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-slate-700">เกินกำหนดส่งงวดงาน</span>
            </div>
            <span className={`text-xl font-black ${alertStats.overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {alertStats.overdueCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {alertStats.overdueCount > 0 ? '🚨 ต้องเร่งรัดรายงานค้างส่งด่วน' : 'ไม่มีงวดงานค้างส่ง'}
          </p>
        </div>

        {/* Due Soon Card */}
        <div 
          onClick={() => setActiveFilter(activeFilter === 'DUE_SOON' ? 'ALL' : 'DUE_SOON')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeFilter === 'DUE_SOON'
              ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-300'
              : alertStats.dueSoonCount > 0 
                ? 'bg-amber-50/80 border-amber-200 hover:border-amber-300' 
                : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl ${alertStats.dueSoonCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Clock className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-slate-700">ใกล้ครบกำหนด (ใน 30 วัน)</span>
            </div>
            <span className={`text-xl font-black ${alertStats.dueSoonCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {alertStats.dueSoonCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {alertStats.dueSoonCount > 0 ? '⚠️ แจ้งเตือนคณะวิจัยจัดเตรียมรายงาน' : 'ไม่มีงวดงานใกล้ครบกำหนด'}
          </p>
        </div>

        {/* IRB Approved Card */}
        <div 
          onClick={() => setActiveFilter(activeFilter === 'IRB_APPROVED' ? 'ALL' : 'IRB_APPROVED')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeFilter === 'IRB_APPROVED'
              ? 'bg-emerald-100/70 border-emerald-400 ring-2 ring-emerald-300'
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500 text-white">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-slate-700">ผ่านรับรองจริยธรรม (IRB)</span>
            </div>
            <span className="text-xl font-black text-emerald-600">
              {alertStats.irbApprovedCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            🛡️ มีหนังสือรับรองคุ้มครองสิทธิ์
          </p>
        </div>

        {/* IRB In Progress Card */}
        <div className="p-4 rounded-2xl border bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500 text-white">
                <FileCheck2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-slate-700">รอพิจารณาจริยธรรม</span>
            </div>
            <span className="text-xl font-black text-indigo-600">
              {alertStats.underReviewCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            ⏳ โครงการที่ยื่นขอหนังสือรับรอง
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> ตัวกรอง:
        </span>
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-brand-primary text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ทั้งหมด ({grants.length})
        </button>
        <button
          onClick={() => setActiveFilter('OVERDUE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeFilter === 'OVERDUE'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>เกินกำหนดส่ง ({alertStats.overdueCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('DUE_SOON')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeFilter === 'DUE_SOON'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>ใกล้ครบกำหนด ({alertStats.dueSoonCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('IRB_APPROVED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeFilter === 'IRB_APPROVED'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>ผ่านรับรอง IRB ({alertStats.irbApprovedCount})</span>
        </button>
      </div>

      {/* Grant Projects List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : filteredGrants.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">ไม่พบโครงการวิจัยตามเงื่อนไขที่เลือก</h3>
          <p className="text-xs text-slate-400 mt-1">ลองสลับตัวกรอง หรือเพิ่มโครงการวิจัยใหม่</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGrants.map((grant) => (
            <div
              key={grant.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 hover:border-brand-primary/40 transition-all space-y-5"
            >
              {/* Project Header */}
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {grant.projectCode}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      grant.grantType === 'INTERNAL' 
                        ? 'bg-rose-100 text-brand-dark' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {grant.grantType === 'INTERNAL' ? 'ทุนภายในวิทยาลัยสงฆ์เลย' : 'ทุนภายนอก'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      กำลังดำเนินการ
                    </span>

                    {/* IRB Research Ethics Status Badge */}
                    {grant.irbStatus === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ผ่านรับรองจริยธรรม: {grant.irbNumber || 'รับรองแล้ว'}</span>
                        {grant.irbExpireDate && (
                          <span className="text-[10px] text-emerald-700 font-normal">
                            (หมดอายุ: {new Date(grant.irbExpireDate).toLocaleDateString('th-TH')})
                          </span>
                        )}
                      </span>
                    )}

                    {grant.irbStatus === 'UNDER_REVIEW' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>รอรับรองจริยธรรม: {grant.irbNumber || 'อยู่ระหว่างพิจารณา'}</span>
                      </span>
                    )}

                    {grant.irbStatus === 'EXPIRED' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>ใบรับรองจริยธรรมหมดอายุ</span>
                      </span>
                    )}

                    {grant.irbStatus === 'NOT_REQUIRED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        <span>ไม่ต้องขอจริยธรรมในมนุษย์</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {grant.titleTh}
                  </h3>
                  {grant.titleEn && (
                    <p className="text-xs text-slate-500 italic">{grant.titleEn}</p>
                  )}
                </div>

                <div className="text-left md:text-right min-w-[170px] space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">วงเงินงบประมาณรวม</span>
                  <div className="text-xl font-extrabold text-brand-primary">
                    ฿{grant.totalBudget.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">{grant.fundingSource}</div>
                  
                  {/* Link to view full IRB Certificate PDF if attached */}
                  {grant.irbFileUrl && (
                    <div className="pt-1">
                      <a
                        href={grant.irbFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>เปิดดูใบรับรอง IRB (PDF)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Members & Duration */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>
                    หัวหน้าโครงการ/คณะวิจัย:{' '}
                    <strong>
                      {grant.members.length > 0
                        ? grant.members.map((m) => `${m.profile.prefix} ${m.profile.firstName}`).join(', ')
                        : 'ฝ่ายวิจัยและบริการวิชาการ'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    ระยะเวลาดำเนินงาน:{' '}
                    {new Date(grant.startDate).toLocaleDateString('th-TH')} -{' '}
                    {new Date(grant.endDate).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>

              {/* Milestones Timeline with Urgency Alerts & Interactive Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>สถานะงวดงานและงวดเงินวิจัย (Milestones & Deadline Tracker)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {grant.milestones.map((m) => {
                    const urgency = getMilestoneUrgency(m);
                    const daysDiff = getDaysDiff(m.dueDate);

                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
                          urgency === 'APPROVED'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : urgency === 'SUBMITTED'
                              ? 'bg-blue-50/60 border-blue-200'
                              : urgency === 'OVERDUE'
                                ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                                : urgency === 'DUE_SOON'
                                  ? 'bg-amber-50/60 border-amber-300'
                                  : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">
                            งวดที่ {m.milestoneNumber}
                          </span>

                          {/* Urgency Badge */}
                          {urgency === 'APPROVED' && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              อนุมัติแล้ว
                            </span>
                          )}

                          {urgency === 'SUBMITTED' && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ส่งรายงานแล้ว
                            </span>
                          )}

                          {urgency === 'OVERDUE' && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              เลยกำหนด {Math.abs(daysDiff)} วัน
                            </span>
                          )}

                          {urgency === 'DUE_SOON' && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              เหลืออีก {daysDiff} วัน
                            </span>
                          )}

                          {urgency === 'ON_TRACK' && (
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                              เหลืออีก {daysDiff} วัน
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 font-medium line-clamp-2 leading-relaxed">
                          {m.title}
                        </p>

                        <div className="flex justify-between items-center text-[11px] pt-1 text-slate-500 border-t border-slate-200/60">
                          <span>งวดเงิน: <strong>฿{m.disbursementAmount.toLocaleString()}</strong></span>
                          <span>กำหนด: {new Date(m.dueDate).toLocaleDateString('th-TH')}</span>
                        </div>

                        {/* Deliverable File link if present */}
                        {m.deliverableFileUrl && (
                          <div className="pt-1">
                            <a
                              href={m.deliverableFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline"
                            >
                              <FileText className="w-3 h-3" />
                              <span>เปิดดูไฟล์รายงานงวดงาน (PDF)</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}

                        {/* Interactive Buttons: Submit Deliverable or Approve */}
                        <div className="pt-1.5 flex items-center gap-2">
                          {urgency !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMilestone({ grantId: grant.id, milestone: m });
                                setMilestoneDeliverableUrl(m.deliverableFileUrl || '');
                              }}
                              className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-all"
                            >
                              <Upload className="w-3 h-3 text-slate-500" />
                              <span>{m.status === 'SUBMITTED' ? 'อัปเดตรายงานงวดงาน' : 'ส่งรายงานงวดงาน (แนบ PDF)'}</span>
                            </button>
                          )}

                          {m.status === 'SUBMITTED' && (
                            <button
                              type="button"
                              onClick={() => handleApproveMilestone(m.id)}
                              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-all shrink-0"
                              title="อนุมัติรายงานงวดงานเพื่อเบิกจ่าย"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>อนุมัติงวดงาน</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Milestone Report Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ส่งรายงานงวดงานที่ {selectedMilestone.milestone.milestoneNumber}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {selectedMilestone.milestone.title}
                </p>
              </div>
              <button 
                onClick={() => setSelectedMilestone(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeliverableSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>กำหนดส่งเดิม:</span>
                  <strong>{new Date(selectedMilestone.milestone.dueDate).toLocaleDateString('th-TH')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>งวดเงินที่จะเบิกจ่าย:</span>
                  <strong className="text-brand-primary">฿{selectedMilestone.milestone.disbursementAmount.toLocaleString()}</strong>
                </div>
              </div>

              {/* Upload Deliverable File */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  แนบไฟล์รายงานความก้าวหน้า / รายงานฉบับสมบูรณ์ (PDF หรือ DOCX) *
                </label>
                <FileUpload
                  label="แนบไฟล์รายงานความก้าวหน้า / รายงานฉบับสมบูรณ์"
                  helperText="รองรับไฟล์ PDF หรือ Word (.docx) ขนาดไม่เกิน 25 MB"
                  value={milestoneDeliverableUrl}
                  onChange={(url: string | null) => setMilestoneDeliverableUrl(url || '')}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingMilestone}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submittingMilestone ? 'กำลังบันทึก...' : 'ยืนยันนำส่งรายงานงวดงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Grant Modal with IRB Support */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">เพิ่มโครงการวิจัยใหม่</h2>
                <p className="text-xs text-slate-500">บันทึกรายละเอียดโครงการ ทุนวิจัย และข้อมูลจริยธรรมในมนุษย์ (IRB)</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสโครงการ</label>
                <input
                  type="text"
                  required
                  value={formData.projectCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อโครงการวิจัย (ภาษาไทย) *</label>
                <input
                  type="text"
                  required
                  value={formData.titleTh}
                  onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                  placeholder="เช่น การสังเคราะห์คุณค่าทางวรรณกรรมพุทธศาสน์..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อโครงการวิจัย (ภาษาอังกฤษ)</label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Project title in English (optional)"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภททุน</label>
                  <select
                    value={formData.grantType}
                    onChange={(e) => setFormData({ ...formData, grantType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  >
                    <option value="INTERNAL">ทุนภายในวิทยาลัยสงฆ์เลย</option>
                    <option value="EXTERNAL">ทุนภายนอก (บพท. / วช. / สกสว.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ยอดงบประมาณ (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">แหล่งทุนวิจัย</label>
                <input
                  type="text"
                  required
                  value={formData.fundingSource}
                  onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันเริ่มต้นโครงการ</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันสิ้นสุดโครงการ</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Research Ethics (IRB) Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    จริยธรรมการวิจัยในมนุษย์ (Institutional Review Board - IRB)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะการรับรองจริยธรรม</label>
                    <select
                      value={formData.irbStatus}
                      onChange={(e) => setFormData({ ...formData, irbStatus: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="NOT_REQUIRED">ไม่ต้องขอ (วิจัยเอกสาร/คัมภีร์)</option>
                      <option value="UNDER_REVIEW">อยู่ระหว่างยื่นขอรับรอง</option>
                      <option value="APPROVED">ผ่านการรับรองแล้ว (มีหนังสือรับรอง)</option>
                    </select>
                  </div>

                  {formData.irbStatus !== 'NOT_REQUIRED' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">เลขที่หนังสือรับรอง IRB</label>
                      <input
                        type="text"
                        value={formData.irbNumber}
                        onChange={(e) => setFormData({ ...formData, irbNumber: e.target.value })}
                        placeholder="เช่น MCU-IRB-2567/018"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  )}
                </div>

                {formData.irbStatus === 'APPROVED' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่คณะกรรมการอนุมัติ</label>
                        <input
                          type="date"
                          value={formData.irbApprovalDate}
                          onChange={(e) => setFormData({ ...formData, irbApprovalDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่หมดอายุความคุ้มครอง</label>
                        <input
                          type="date"
                          value={formData.irbExpireDate}
                          onChange={(e) => setFormData({ ...formData, irbExpireDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        แนบหนังสือรับรองจริยธรรมการวิจัย (PDF Certificate)
                      </label>
                      <FileUpload
                        label="แนบหนังสือรับรองจริยธรรมการวิจัย (PDF)"
                        helperText="รองรับไฟล์ PDF หรือรูปถ่ายหนังสือรับรอง ขนาดไม่เกิน 25 MB"
                        value={formData.irbFileUrl}
                        onChange={(url: string | null) => setFormData({ ...formData, irbFileUrl: url || '' })}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow"
                >
                  บันทึกโครงการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}