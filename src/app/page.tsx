'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  Award, 
  Coins, 
  TrendingUp, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface StatsData {
  kpis: {
    totalResearchers: number;
    totalPublications: number;
    activeGrants: number;
    totalBudget: number;
  };
  alerts?: {
    overdueMilestonesCount: number;
    dueSoonMilestonesCount: number;
    irbApprovedCount: number;
  };
  trendData: Array<{ year: string; count: number }>;
  fundingChartData: Array<{ name: string; value: number }>;
  departmentChartData: Array<{ name: string; publications: number; facultyCount: number }>;
}

const COLORS = ['#b80035', '#0284c7', '#059669', '#d97706'];

export default function ExecutiveDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-rose-100/50 rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200/60 rounded-xl"></div>
          <div className="h-72 bg-slate-200/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const { kpis, trendData, fundingChartData, departmentChartData } = data;

  return (
    <div className="space-y-8">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand-primary to-rose-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs backdrop-blur mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-200" />
            <span>ศูนย์ข้อมูลสารสนเทศการวิจัย มจร. วิทยาลัยสงฆ์เลย</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            ภาพรวมงานวิจัยและผลงานวิชาการเชิงยุทธศาสตร์
          </h1>
          <p className="text-rose-100 text-sm leading-relaxed mb-6">
            ขับเคลื่อนพันธกิจวิจัยพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ เพื่อพัฒนาชุมชนและสังคมลุ่มน้ำเลยอย่างยั่งยืน
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/research"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-brand-dark font-semibold text-sm shadow hover:bg-rose-50 transition-all"
            >
              <BookOpen className="w-4 h-4 text-brand-primary" />
              <span>บันทึกผลงานวิจัยใหม่</span>
            </Link>
            <Link
              href="/qa-reports"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ออกรายงาน SAR ประจำปี</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Center Widget for Executives & Officers */}
      {data.alerts && (data.alerts.overdueMilestonesCount > 0 || data.alerts.dueSoonMilestonesCount > 0) && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-2xs mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                ศูนย์เตือนภัยเร่งรัดงวดงานวิจัย (Research Milestone Alert)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {data.alerts.overdueMilestonesCount > 0 && (
                  <span className="font-semibold text-rose-700 mr-3">
                    🚨 เกินกำหนดส่ง {data.alerts.overdueMilestonesCount} งวดงาน
                  </span>
                )}
                {data.alerts.dueSoonMilestonesCount > 0 && (
                  <span className="font-medium text-amber-900">
                    ⚠️ ใกล้ถึงกำหนดส่งภายใน 30 วัน {data.alerts.dueSoonMilestonesCount} งวดงาน
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            href="/grants"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition-all shrink-0"
          >
            <span>ตรวจสอบและเร่งรัด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">บุคลากร/นักวิจัย</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-brand-primary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{kpis.totalResearchers}</div>
          <p className="text-xs text-slate-500">
            พระภิกษุและคฤหัสถ์ วิทยาลัยสงฆ์เลย
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ผลงานวิชาการสะสม</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{kpis.totalPublications}</div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>วารสาร TCI, Scopus และตำรา</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">โครงการวิจัย active</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{kpis.activeGrants}</div>
          <p className="text-xs text-slate-500">
            กำลังดำเนินการตามงวดงาน
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ยอดงบประมาณวิจัยรวม</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mb-1">
            ฿{kpis.totalBudget.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">
            ทุนภายใน วส.เลย + บพท./วช.
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">แนวโน้มผลงานวิชาการย้อนหลังรายปี</h2>
              <p className="text-xs text-slate-500">จำนวนบทความและผลงานวิจัยที่ตีพิมพ์ (พ.ศ.)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-brand-primary">
              ประจำปี 2566 - 2567
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#b80035" radius={[6, 6, 0, 0]} name="จำนวนผลงาน" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funding Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">สัดส่วนงบประมาณตามแหล่งทุน</h2>
              <p className="text-xs text-slate-500">การกระจายตัวของทุนวิจัยภายในและภายนอก</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundingChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {fundingChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `฿${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-brand-primary" />
            <h2 className="text-base font-bold text-slate-900">ผลิตภาพงานวิจัยจำแนกตามสาขาวิชา</h2>
          </div>
          <Link href="/directory" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
            <span>ดูทำเนียบอาจารย์ทั้งหมด</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">สาขาวิชา</th>
                <th className="py-3 px-4 text-center">จำนวนอาจารย์ (รูป/คน)</th>
                <th className="py-3 px-4 text-center">ผลงานวิจัยที่ตีพิมพ์</th>
                <th className="py-3 px-4 text-right">สัดส่วนผลิตภาพ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentChartData.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-900">{dept.name}</td>
                  <td className="py-3.5 px-4 text-center">{dept.facultyCount}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-brand-primary">
                    {dept.publications}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block w-24 bg-slate-100 rounded-full h-2 mr-2 overflow-hidden">
                      <span 
                        className="bg-brand-primary h-full block rounded-full" 
                        style={{ width: `${Math.min(100, (dept.publications / (kpis.totalPublications || 1)) * 100)}%` }}
                      ></span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {((dept.publications / (kpis.totalPublications || 1)) * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}