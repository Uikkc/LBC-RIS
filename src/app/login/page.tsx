'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LogIn, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Building,
  User,
  Crown
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      // Redirect based on role
      if (data.user.role === 'DEPT_STAFF') {
        router.push('/department-admin');
      } else if (data.user.role === 'SUPER_ADMIN') {
        router.push('/department-admin');
      } else {
        router.push('/profile');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Header */}
        <div className="bg-gradient-to-r from-brand-dark via-brand-primary to-rose-700 p-6 sm:p-8 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-rose-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ LBC-RIS</h1>
          <p className="text-xs sm:text-sm text-rose-100 mt-1">
            วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมลประจำตัว
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@lbc.ac.th"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านของท่าน"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500">
            <span>ยังไม่มีบัญชีผู้ใช้งาน? </span>
            <Link href="/register" className="text-brand-primary font-bold hover:underline">
              สมัครสมาชิกอาจารย์ที่นี่
            </Link>
          </div>
        </div>
      </div>

      {/* Quick 1-Click Demo Login Box */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-brand-dark font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          <span>ปุ่มทดสอบเข้าสู่ระบบตัวอย่าง (1-Click Demo Logins):</span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs">
          <button
            onClick={() => performLogin('admin@lbc.ac.th', 'password123')}
            className="w-full p-2.5 rounded-xl bg-white border border-rose-200 text-left hover:border-brand-primary hover:bg-rose-50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-slate-800">1. แอดมินกลาง (Super Admin)</span>
                <p className="text-[10px] text-slate-500">ดูแลทุกอย่าง ทั้ง 4 สาขาวิชา</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-brand-primary bg-rose-100 px-2 py-0.5 rounded">คลิกเพื่อเข้า</span>
          </button>

          <button
            onClick={() => performLogin('staff.bud@lbc.ac.th', 'password123')}
            className="w-full p-2.5 rounded-xl bg-white border border-rose-200 text-left hover:border-brand-primary hover:bg-rose-50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="font-bold text-slate-800">2. เจ้าหน้าที่สาขาพระพุทธศาสนา (Dept Staff)</span>
                <p className="text-[10px] text-slate-500">ดูแลเฉพาะอาจารย์ในสาขาพุทธศาสตร์</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-brand-primary bg-rose-100 px-2 py-0.5 rounded">คลิกเพื่อเข้า</span>
          </button>

          <button
            onClick={() => performLogin('somkid@lbc.ac.th', 'password123')}
            className="w-full p-2.5 rounded-xl bg-white border border-rose-200 text-left hover:border-brand-primary hover:bg-rose-50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-bold text-slate-800">3. อาจารย์พระสงฆ์ (Researcher Monk)</span>
                <p className="text-[10px] text-slate-500">พระมหาสมคิด ชินวํโส, ผศ.ดร.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-brand-primary bg-rose-100 px-2 py-0.5 rounded">คลิกเพื่อเข้า</span>
          </button>
        </div>
      </div>
    </div>
  );
}