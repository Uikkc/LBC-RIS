'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';

interface FacultyMember {
  id: string;
  prefix: string;
  firstName: string;
  lastName?: string;
  chaya?: string;
  sanghaStatus: string;
  academicRank: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  department: {
    id: string;
    nameTh: string;
  };
  authorships: Array<{
    publication: {
      id: string;
      titleTh: string;
      yearBe: number;
    };
  }>;
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

interface Department {
  id: string;
  code: string;
  nameTh: string;
}

export default function DepartmentAdminPortal() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentScope, setCurrentScope] = useState<string>('ALL');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFaculty = (deptId: string = 'ALL') => {
    setLoading(true);
    let url = `/api/dept-staff/faculty?departmentId=${deptId}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setFaculty(data.faculty || []);
        setDepartments(data.departments || []);
        setCurrentScope(data.currentScope);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.user);
        if (data.user?.managedDeptId) {
          setSelectedDeptId(data.user.managedDeptId);
          fetchFaculty(data.user.managedDeptId);
        } else {
          fetchFaculty('ALL');
        }
      });
  }, []);

  const handleDeptFilterChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    fetchFaculty(deptId);
  };

  const handleToggleVerify = async (profileId: string, currentStatus: boolean) => {
    const res = await fetch('/api/dept-staff/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, isVerified: !currentStatus }),
    });

    if (res.ok) {
      setFaculty((prev) =>
        prev.map((f) => (f.id === profileId ? { ...f, isVerified: !currentStatus } : f))
      );
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isDeptStaff = currentUser?.role === 'DEPT_STAFF';

  const filteredFaculty = faculty.filter((f) => {
    const name = `${f.prefix} ${f.firstName} ${f.chaya || ''} ${f.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) || f.email?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 text-brand-primary text-xs font-bold mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {isSuperAdmin
                ? 'ศูนย์ควบคุมผู้ดูแลระบบกลาง (Super Admin Control Center)'
                : `ระบบเจ้าหน้าที่ดูแลประจำ${currentUser?.departmentName || 'สาขาวิชา'}`}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isSuperAdmin ? 'จัดการอาจารย์และบุคลากรทุกสาขาวิชา' : `ทะเบียนอาจารย์ประจำ${currentUser?.departmentName || 'สาขาวิชา'}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isSuperAdmin
              ? 'กำกับดูแล ตรวจสอบสิทธิ์ และอนุมัติสถานะอาจารย์และเจ้าหน้าที่ทั้ง 4 สาขาวิชา'
              : 'ตรวจสอบความถูกต้องของข้อมูล ช่วยกรอกผลงานวิจัย และรับรองสถานะอาจารย์ในสาขา'}
          </p>
        </div>

        {/* Quick Department Switcher for Super Admin */}
        {isSuperAdmin && (
          <div className="flex items-center space-x-2 self-stretch md:self-auto bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedDeptId}
              onChange={(e) => handleDeptFilterChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
            >
              <option value="ALL">แสดงทุกสาขาวิชา (รวม)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameTh}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search & Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">อาจารย์ในขอบเขต</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{faculty.length} รูป/คน</div>
            <span className="text-[11px] text-slate-500">
              {isDeptStaff ? 'เฉพาะในสาขาที่รับผิดชอบ' : 'ทั้งหมดในสถาบัน'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-brand-primary">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">รับรองสถานะแล้ว</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {faculty.filter((f) => f.isVerified).length} รูป/คน
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">พร้อมรับการประเมิน SAR</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">ผลงานวิจัยสะสมในสาขา</span>
            <div className="text-2xl font-black text-brand-primary mt-1">
              {faculty.reduce((sum, f) => sum + (f.authorships?.length || 0), 0)} เรื่อง
            </div>
            <span className="text-[11px] text-slate-500">บทความวารสารและตำรา</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่ออาจารย์ สมณศักดิ์ ฉายา..."
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
            />
          </div>

          <Link
            href="/research"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ช่วยบันทึกผลงานให้อาจารย์</span>
          </Link>
        </div>

        {loading ? (
          <div className="h-44 bg-slate-50 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-slate-500 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">ชื่ออาจารย์ / นักวิจัย</th>
                  <th className="py-3 px-3">สังกัดสาขาวิชา</th>
                  <th className="py-3 px-3 text-center">สถานะสงฆ์/คฤหัสถ์</th>
                  <th className="py-3 px-3 text-center">ผลงานวิจัย</th>
                  <th className="py-3 px-3">ข้อมูลติดต่อ</th>
                  <th className="py-3 px-3 text-center">สถานะรับรอง</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.map((f) => {
                  const displayName = `${f.prefix} ${f.firstName}${f.chaya ? ` ${f.chaya}` : ''}${f.lastName ? ` ${f.lastName}` : ''}`;
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-brand-dark flex items-center justify-center font-bold text-xs shrink-0">
                            {f.sanghaStatus === 'MONK' ? 'ภ' : 'อ'}
                          </div>
                          <div>
                            <div>{displayName}</div>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {f.academicRank !== 'NONE' ? f.academicRank : 'อาจารย์ประจำ'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{f.department?.nameTh}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.sanghaStatus === 'MONK'
                            ? 'bg-rose-100 text-brand-dark'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.sanghaStatus === 'MONK' ? 'พระภิกษุ' : 'คฤหัสถ์'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-brand-primary">
                        {f.authorships?.length || 0} เรื่อง
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        <div className="flex flex-col space-y-0.5 text-[11px]">
                          {f.email && <span>{f.email}</span>}
                          {f.phone && <span>{f.phone}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {f.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            รับรองแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            <XCircle className="w-3 h-3 text-amber-500" />
                            รอตรวจสอบ
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleToggleVerify(f.id, f.isVerified)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            f.isVerified
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          }`}
                        >
                          {f.isVerified ? 'ยกเลิกรับรอง' : 'กดรับรอง'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}