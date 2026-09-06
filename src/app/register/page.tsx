'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  Lock, 
  Mail, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  ArrowRight
} from 'lucide-react';

interface Department {
  id: string;
  code: string;
  nameTh: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [sanghaStatus, setSanghaStatus] = useState<'MONK' | 'LAITY'>('MONK');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    prefix: 'พระมหา',
    firstName: '',
    lastName: '',
    chaya: '',
    academicRank: 'NONE',
    departmentId: '',
    phone: '',
  });

  useEffect(() => {
    fetch('/api/dept-staff/faculty')
      .then((res) => res.json())
      .then((data) => {
        if (data.departments && data.departments.length > 0) {
          setDepartments(data.departments);
          setFormData((prev) => ({ ...prev, departmentId: data.departments[0].id }));
        }
      });
  }, []);

  const handleStatusSwitch = (status: 'MONK' | 'LAITY') => {
    setSanghaStatus(status);
    setFormData((prev) => ({
      ...prev,
      prefix: status === 'MONK' ? 'พระมหา' : 'อาจารย์ ดร.',
      lastName: status === 'MONK' ? '' : prev.lastName,
      chaya: status === 'MONK' ? prev.chaya : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sanghaStatus,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'การลงทะเบียนล้มเหลว');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Header */}
        <div className="bg-gradient-to-r from-brand-dark via-brand-primary to-rose-700 p-6 sm:p-8 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6 text-rose-100" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ลงทะเบียนอาจารย์ / นักวิจัย</h1>
          <p className="text-xs sm:text-sm text-rose-100 mt-1">
            ระบบสารสนเทศนักวิจัยและผลงานวิชาการ วิทยาลัยสงฆ์เลย มจร.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ลงทะเบียนสำเร็จ! กำลังนำท่านเข้าสู่หน้าแฟ้มประวัตินักวิจัย...</span>
            </div>
          )}

          {/* Sangha Status Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              เลือกสถานะของท่าน:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => handleStatusSwitch('MONK')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  sanghaStatus === 'MONK'
                    ? 'bg-white text-brand-dark shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                พระภิกษุสงฆ์ / สามเณร
              </button>
              <button
                type="button"
                onClick={() => handleStatusSwitch('LAITY')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  sanghaStatus === 'LAITY'
                    ? 'bg-white text-brand-dark shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                คฤหัสถ์ / อาจารย์ฆราวาส
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สาขาวิชาที่สังกัด *
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameTh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ตำแหน่งทางวิชาการ
                </label>
                <select
                  value={formData.academicRank}
                  onChange={(e) => setFormData({ ...formData, academicRank: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                >
                  <option value="NONE">ไม่มีตำแหน่งทางวิชาการ</option>
                  <option value="LECTURER">อาจารย์</option>
                  <option value="ASST_PROF">ผู้ช่วยศาสตราจารย์ (ผศ.)</option>
                  <option value="ASSOC_PROF">รองศาสตราจารย์ (รศ.)</option>
                  <option value="PROF">ศาสตราจารย์ (ศ.)</option>
                </select>
              </div>
            </div>

            {/* Buddhist vs Lay specific fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {sanghaStatus === 'MONK' ? 'สมณศักดิ์ / คำนำหน้า *' : 'คำนำหน้านาม *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  placeholder={sanghaStatus === 'MONK' ? 'เช่น พระมหา, พระครู' : 'เช่น ผศ.ดร., อาจารย์'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อตัว *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="เช่น สมคิด, นงลักษณ์"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                />
              </div>

              {sanghaStatus === 'MONK' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ฉายา (ทางธรรม) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.chaya}
                    onChange={(e) => setFormData({ ...formData, chaya: e.target.value })}
                    placeholder="เช่น ฐิตธมฺโม, ชินวํโส"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="เช่น บุญมี, สุวรรณสิทธิ์"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล (สำหรับเข้าสู่ระบบ) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@lbc.ac.th หรือ gmail.com"
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08X-XXX-XXXX"
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ยืนยันรหัสผ่าน *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'กำลังลงทะเบียน...' : 'ยืนยันการลงทะเบียนอาจารย์'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
            <span>มีบัญชีผู้ใช้งานอยู่แล้ว? </span>
            <Link href="/login" className="text-brand-primary font-bold hover:underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}