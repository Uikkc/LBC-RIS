'use client';

import { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Calendar, 
  Coins, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  X 
} from 'lucide-react';

interface Milestone {
  id: string;
  milestoneNumber: number;
  title: string;
  dueDate: string;
  submittedDate?: string;
  disbursementAmount: number;
  status: string;
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

  const [formData, setFormData] = useState({
    projectCode: `LBC-GRT-2567-00${Math.floor(Math.random() * 90) + 10}`,
    titleTh: '',
    titleEn: '',
    fundingSource: 'กองทุนวิจัยพัฒนาวิทยาลัยสงฆ์เลย',
    grantType: 'INTERNAL',
    totalBudget: 100000,
    startDate: '2024-06-01',
    endDate: '2025-05-31',
  });

  const fetchGrants = () => {
    setLoading(true);
    fetch('/api/grants')
      .then((res) => res.json())
      .then((data) => {
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchGrants();
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึกโครงการ');
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
            กำกับดูแลการดำเนินงานวิจัย บริหารงบประมาณ และติดตามกำหนดส่งรายงานงวดเงินทุน
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-medium text-sm shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มโครงการวิจัยใหม่</span>
        </button>
      </div>

      {/* Grant Projects List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : grants.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">ยังไม่มีโครงการวิจัยในระบบ</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {grants.map((grant) => (
            <div
              key={grant.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-brand-primary/40 transition-all space-y-5"
            >
              {/* Project Header */}
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {grant.projectCode}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      grant.grantType === 'INTERNAL' 
                        ? 'bg-rose-100 text-brand-dark' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {grant.grantType === 'INTERNAL' ? 'ทุนภายในวิทยาลัยสงฆ์เลย' : 'ทุนภายนอก'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      กำลังดำเนินการ
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {grant.titleTh}
                  </h3>
                  {grant.titleEn && (
                    <p className="text-xs text-slate-500 italic">{grant.titleEn}</p>
                  )}
                </div>

                <div className="text-left md:text-right min-w-[160px]">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">วงเงินงบประมาณรวม</span>
                  <div className="text-xl font-extrabold text-brand-primary">
                    ฿{grant.totalBudget.toLocaleString()}
                  </div>
                  <span className="text-xs text-slate-500">{grant.fundingSource}</span>
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
                    ระยะเวลา:{' '}
                    {new Date(grant.startDate).toLocaleDateString('th-TH')} -{' '}
                    {new Date(grant.endDate).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>สถานะงวดงานและงวดเงินวิจัย (Milestones)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {grant.milestones.map((m) => {
                    const isApproved = m.status === 'APPROVED';
                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          isApproved
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">
                            งวดที่ {m.milestoneNumber}
                          </span>
                          {isApproved ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              อนุมัติแล้ว
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              รอนำส่งรายงาน
                            </span>
                          )}
                        </div>

                        <p className="text-slate-600 font-medium line-clamp-1">{m.title}</p>

                        <div className="flex justify-between items-center text-[11px] pt-1 text-slate-500 border-t border-slate-200/60">
                          <span>งวดเงิน: ฿{m.disbursementAmount.toLocaleString()}</span>
                          <span>กำหนด: {new Date(m.dueDate).toLocaleDateString('th-TH')}</span>
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

      {/* New Grant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">เพิ่มโครงการวิจัยใหม่</h2>
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