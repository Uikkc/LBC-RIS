'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  BookOpen, 
  UserCheck, 
  Award, 
  FileSpreadsheet, 
  Search, 
  GraduationCap,
  Building2,
  LogIn,
  LogOut,
  UserPlus,
  ShieldAlert
} from 'lucide-react';

interface CurrentUser {
  userId: string;
  email: string;
  role: string;
  name: string;
  departmentName?: string;
  managedDeptId?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      });
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/', label: 'แดชบอร์ดบริหาร', icon: BarChart3 },
    { href: '/research', label: 'คลังผลงานวิชาการ', icon: BookOpen },
    { href: '/profile', label: 'แฟ้มประวัตินักวิจัย', icon: UserCheck },
    { href: '/grants', label: 'ทุนและงวดงาน', icon: Award },
    { href: '/qa-reports', label: 'รายงาน SAR / QA', icon: FileSpreadsheet },
    { href: '/directory', label: 'ทำเนียบสาธารณะ', icon: Search },
  ];

  const canManageDept = user?.role === 'SUPER_ADMIN' || user?.role === 'DEPT_STAFF';

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'แอดมินกลาง (Super Admin)';
      case 'DEPT_STAFF':
        return 'เจ้าหน้าที่สาขาวิชา (Staff)';
      case 'EXECUTIVE':
        return 'ผู้บริหาร (Executive)';
      default:
        return 'อาจารย์/นักวิจัย';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Banner */}
      <div className="bg-brand-dark text-rose-50 text-xs py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ระบบสารสนเทศนักวิจัยและผลงานวิชาการ (LBC-RIS) • วิทยาลัยสงฆ์เลย มจร.</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-rose-200">
            <span>ปีการศึกษา 2567</span>
            <span>|</span>
            <span>ศูนย์ข้อมูลกลางงานวิจัย Single Source of Truth</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight text-slate-900 tracking-tight flex items-center gap-1.5">
                <span className="text-brand-primary">LBC-RIS</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-rose-100 text-brand-dark font-medium">มจร.เลย</span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                ระบบข้อมูลอาจารย์และผลงานวิชาการ
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-50 text-brand-primary font-bold shadow-xs border border-rose-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-primary' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Department Officer Portal Link */}
            {canManageDept && (
              <Link
                href="/department-admin"
                className={`flex items-center space-x-1 px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  pathname === '/department-admin'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>จัดการสาขาวิชา</span>
              </Link>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</span>
                  <span className="text-[10px] text-brand-primary font-medium">
                    {getRoleLabel(user.role)} {user.departmentName && `• ${user.departmentName}`}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-rose-100 border border-brand-primary/30 flex items-center justify-center text-brand-dark font-bold text-xs">
                  {user.name.slice(0, 1)}
                </div>

                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-brand-primary" />
                  <span>เข้าสู่ระบบ</span>
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold shadow-xs transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>สมัครสมาชิก</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-100 text-brand-primary font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {canManageDept && (
            <Link
              href="/department-admin"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md whitespace-nowrap bg-amber-100 text-amber-900 font-bold"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>จัดการสาขาวิชา</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}