'use client';

import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Award, 
  Calculator, 
  Filter,
  FileText,
  ExternalLink,
  FileCheck2
} from 'lucide-react';

interface Publication {
  id: string;
  titleTh: string;
  type: string;
  indexing: string;
  venueName: string;
  yearBe: number;
  qaScore: number;
  doi?: string;
  isbn?: string;
  fileUrl?: string | null;
  authors: Array<{
    authorName: string;
    authorShare: number;
  }>;
}

export default function QaReportsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    let url = '/api/publications';
    fetch(url)
      .then((res) => res.json())
      .then((data: Publication[]) => {
        if (selectedYear === 'ALL') {
          setPublications(data);
        } else {
          setPublications(data.filter((p) => p.yearBe === Number(selectedYear)));
        }
        setLoading(false);
      });
  }, [selectedYear]);

  const totalScore = publications.reduce((sum, p) => sum + p.qaScore, 0);
  const facultyCount = 50; // บุคลากร 50 รูป/คน
  const scorePerCapita = totalScore / facultyCount;
  const verifiedWithFilesCount = publications.filter((p) => p.fileUrl).length;

  const handleExportCsv = () => {
    window.location.href = `/api/qa-export?yearBe=${selectedYear}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-brand-primary" />
            <span>ระบบออกรายงานประกันคุณภาพการศึกษา (SAR / กพอ. / สมศ.)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            รวบรวมและคำนวณค่าน้ำหนักผลงานทางวิชาการตามเกณฑ์มาตรฐาน พร้อมตรวจสอบเอกสารหลักฐานจริง (PDF Vault)
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition-all"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออกตาราง SAR (Excel / CSV)</span>
        </button>
      </div>

      {/* Year Filter & SAR Score Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">ปี พ.ศ. ที่ประเมิน</span>
            <div className="mt-1">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="ALL">ทุกปีการศึกษา</option>
                <option value="2567">ปี พ.ศ. 2567</option>
                <option value="2566">ปี พ.ศ. 2566</option>
              </select>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-brand-primary">
            <Filter className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">คะแนนผลงานวิจัยรวม</span>
            <div className="text-2xl font-extrabold text-brand-primary mt-0.5">
              {totalScore.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-500">ค่าน้ำหนักสะสมตามเกณฑ์</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <Calculator className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">คะแนนเฉลี่ยต่อรูป/คน</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {scorePerCapita.toFixed(3)}
            </div>
            <span className="text-[11px] text-slate-500">คำนวณจากบุคลากร 50 รูป/คน</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">มีหลักฐาน PDF แนบ</span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-0.5">
              {verifiedWithFilesCount} / {publications.length}
            </div>
            <span className="text-[11px] text-slate-500">พร้อมตรวจประเมินจริง</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* QA SAR Evidence Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-primary" />
            <h2 className="text-base font-bold text-slate-900">
              ตารางบัญชีรายชื่อผลงานวิชาการและค่าน้ำหนักประกอบเล่ม SAR
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            พบ {publications.length} รายการ
          </span>
        </div>

        {loading ? (
          <div className="h-48 bg-slate-50 rounded-xl animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-slate-500 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center">ลำดับ</th>
                  <th className="py-3 px-3">ปี พ.ศ.</th>
                  <th className="py-3 px-4">ชื่อผลงานวิจัย / ผลงานวิชาการ</th>
                  <th className="py-3 px-3">ผู้ประพันธ์และสัดส่วน (%)</th>
                  <th className="py-3 px-3">ฐานข้อมูล / ดัชนี</th>
                  <th className="py-3 px-3 text-center">ค่าน้ำหนัก</th>
                  <th className="py-3 px-3">แหล่งตีพิมพ์ / เผยแพร่</th>
                  <th className="py-3 px-3 text-center">เอกสารหลักฐานจริง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {publications.map((pub, index) => (
                  <tr key={pub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 text-center font-medium text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{pub.yearBe}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-sm">
                      {pub.titleTh}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {pub.authors.map((a) => `${a.authorName} (${a.authorShare}%)`).join(', ')}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[10px] text-slate-800">
                        {pub.indexing}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-extrabold text-brand-primary">
                      {pub.qaScore.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 truncate max-w-xs">{pub.venueName}</td>
                    <td className="py-3.5 px-3 text-center">
                      {pub.fileUrl ? (
                        <a
                          href={pub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition-colors"
                        >
                          <span>ดูหลักฐาน (PDF)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">ไม่มีไฟล์</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}