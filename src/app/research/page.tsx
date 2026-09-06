'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Sparkles, 
  CheckCircle, 
  ExternalLink, 
  FileText, 
  Filter,
  X,
  Loader2,
  FileCheck2,
  Download
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';

interface Publication {
  id: string;
  titleTh: string;
  titleEn?: string;
  type: string;
  indexing: string;
  venueName: string;
  yearBe: number;
  doi?: string;
  isbn?: string;
  fileUrl?: string | null;
  qaScore: number;
  authors: Array<{
    authorName: string;
    authorShare: number;
  }>;
}

export default function ResearchRepository() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    titleTh: string;
    titleEn: string;
    abstractTh: string;
    type: string;
    indexing: string;
    venueName: string;
    yearBe: number;
    authorName: string;
    authorShare: number;
    doi: string;
    fileUrl: string | null;
  }>({
    titleTh: '',
    titleEn: '',
    abstractTh: '',
    type: 'JOURNAL',
    indexing: 'TCI_TIER_1',
    venueName: '',
    yearBe: 2567,
    authorName: 'พระมหาสมคิด ชินวํโส, ผศ.ดร.',
    authorShare: 100,
    doi: '',
    fileUrl: null,
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  const fetchPublications = () => {
    setLoading(true);
    let url = `/api/publications?type=${selectedType}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPublications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPublications();
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublications();
  };

  const handleAiSummarize = async () => {
    if (!formData.titleTh || !formData.abstractTh) {
      alert('กรุณากรอกชื่อเรื่องและบทคัดย่อก่อนเรียกใช้ AI');
      return;
    }

    setAiLoading(true);
    setAiStatus('Gemini 1.5 Flash กำลังสกัดสาระสำคัญและคำสำคัญ...');

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.titleTh,
          abstract: formData.abstractTh,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          abstractTh: result.summary,
        }));
        setAiStatus(`สกัดสำเร็จ! คีย์เวิร์ดที่แนะนำ: ${result.keywords?.join(', ')}`);
      } else {
        setAiStatus('AI ทำงานไม่สำเร็จ ระบบเปิดโหมด Manual ปกติ');
      }
    } catch (err) {
      setAiStatus('AI ขัดข้อง สลับเป็นโหมด Manual');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          titleTh: '',
          titleEn: '',
          abstractTh: '',
          type: 'JOURNAL',
          indexing: 'TCI_TIER_1',
          venueName: '',
          yearBe: 2567,
          authorName: 'พระมหาสมคิด ชินวํโส, ผศ.ดร.',
          authorShare: 100,
          doi: '',
          fileUrl: null,
        });
        setAiStatus(null);
        fetchPublications();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกผลงาน');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getIndexingBadge = (indexing: string) => {
    switch (indexing) {
      case 'SCOPUS_Q1':
      case 'SCOPUS_Q2':
      case 'SCOPUS_Q3':
      case 'SCOPUS_Q4':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">Scopus</span>;
      case 'TCI_TIER_1':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">TCI กลุ่ม 1</span>;
      case 'TCI_TIER_2':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">TCI กลุ่ม 2</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">ทั่วไป/ตำรา</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-primary" />
            <span>คลังผลงานวิชาการและงานวิจัย</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            รวบรวมบทความวารสาร รายงานการประชุม ตำรา และผลงานสร้างสรรค์ พร้อมคลังเอกสารหลักฐานจริง (PDF Vault)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-medium text-sm shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>บันทึกผลงานใหม่</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่องานวิจัย, ชื่อวารสาร, หรือเลข DOI..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="ALL">ทุกประเภทผลงาน</option>
            <option value="JOURNAL">บทความวารสาร (Journal)</option>
            <option value="BOOK_TEXTBOOK">หนังสือ/ตำรา (Book)</option>
            <option value="CREATIVE_WORK">งานสร้างสรรค์/นวัตกรรม</option>
          </select>
        </div>
      </div>

      {/* Publications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : publications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">ไม่พบข้อมูลผลงานวิชาการ</h3>
          <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "บันทึกผลงานใหม่"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {publications.map((pub) => (
            <div
              key={pub.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-primary/40 transition-all flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getIndexingBadge(pub.indexing)}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    ปี พ.ศ. {pub.yearBe}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">| {pub.type}</span>

                  {/* Evidence Vault Badge */}
                  {pub.fileUrl ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <FileCheck2 className="w-3 h-3" />
                      <span>มีเอกสารหลักฐานจริง (PDF Vault)</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium italic">
                      ยังไม่มีไฟล์แนบ
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-brand-primary transition-colors">
                  {pub.titleTh}
                </h3>
                {pub.titleEn && (
                  <p className="text-xs text-slate-500 italic">{pub.titleEn}</p>
                )}

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-1">
                  <span className="font-medium text-slate-800">
                    ผู้ประพันธ์: {pub.authors.map((a) => `${a.authorName} (${a.authorShare}%)`).join(', ')}
                  </span>
                  <span>•</span>
                  <span>แหล่งเผยแพร่: {pub.venueName}</span>
                  {pub.doi && (
                    <>
                      <span>•</span>
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary hover:underline flex items-center gap-0.5"
                      >
                        <span>DOI: {pub.doi}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>

                {/* Evidence View Action Button */}
                {pub.fileUrl && (
                  <div className="pt-2">
                    <a
                      href={pub.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-50 text-brand-dark hover:bg-rose-100 text-xs font-bold transition-colors border border-rose-200"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-primary" />
                      <span>เปิดดูเอกสารฉบับเต็ม (Full-Text PDF)</span>
                    </a>
                  </div>
                )}
              </div>

              {/* QA Score Badge */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 min-w-[140px]">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ค่าน้ำหนัก SAR</span>
                <span className="text-2xl font-extrabold text-brand-primary">{pub.qaScore.toFixed(2)}</span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>ตรวจสอบแล้ว</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Publication Modal with File Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-rose-50 text-brand-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">บันทึกผลงานวิชาการ / วิจัยใหม่</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผลงาน (ภาษาไทย) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleTh}
                  onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                  placeholder="เช่น พุทธบูรณาการเพื่อการสร้างเสริมความเข้มแข็งของชุมชน..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผลงาน (ภาษาอังกฤษ)
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="e.g. Buddhist Integration for Enhancing Resilience..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                />
              </div>

              {/* Digital Evidence Upload Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <FileUpload
                  label="แนบไฟล์บทความวิจัยฉบับเต็ม / เอกสารหลักฐาน (PDF Vault)"
                  helperText="ลากไฟล์ PDF บทความวิจัย หรือใบตอบรับการตีพิมพ์มาวางที่นี่ (สูงสุด 25 MB)"
                  value={formData.fileUrl}
                  onChange={(url) => setFormData({ ...formData, fileUrl: url })}
                />
              </div>

              {/* Abstract with AI Helper Button */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">บทคัดย่อ (Abstract)</label>
                  <button
                    type="button"
                    onClick={handleAiSummarize}
                    disabled={aiLoading}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-brand-primary text-white shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-300" />
                    )}
                    <span>สรุปบทคัดย่อด้วย AI</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.abstractTh}
                  onChange={(e) => setFormData({ ...formData, abstractTh: e.target.value })}
                  placeholder="วางเนื้อหาบทคัดย่อที่นี่เพื่อให้อ่านง่ายขึ้น หรือให้ AI สกัดสาระสำคัญ..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                ></textarea>
                {aiStatus && (
                  <p className="text-xs text-brand-primary font-medium mt-1">{aiStatus}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทผลงาน *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  >
                    <option value="JOURNAL">บทความวารสารวิชาการ (Journal)</option>
                    <option value="CONFERENCE">รายงานการประชุมวิชาการ (Conference)</option>
                    <option value="BOOK_TEXTBOOK">หนังสือ / ตำราเรียน (Book)</option>
                    <option value="CREATIVE_WORK">ผลงานสร้างสรรค์ / นวัตกรรม</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ฐานข้อมูล / ดัชนี *</label>
                  <select
                    value={formData.indexing}
                    onChange={(e) => setFormData({ ...formData, indexing: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  >
                    <option value="TCI_TIER_1">TCI กลุ่ม 1 (ค่าน้ำหนัก 0.80)</option>
                    <option value="TCI_TIER_2">TCI กลุ่ม 2 (ค่าน้ำหนัก 0.60)</option>
                    <option value="SCOPUS_Q1">Scopus Q1 / WoS (ค่าน้ำหนัก 1.00)</option>
                    <option value="SCOPUS_Q2">Scopus Q2 (ค่าน้ำหนัก 0.90)</option>
                    <option value="SCOPUS_Q3">Scopus Q3 (ค่าน้ำหนัก 0.80)</option>
                    <option value="SCOPUS_Q4">Scopus Q4 (ค่าน้ำหนัก 0.70)</option>
                    <option value="NATIONAL_CONF">การประชุมระดับชาติ (ค่าน้ำหนัก 0.20)</option>
                    <option value="GENERAL">ทั่วไป / ตำรา (ค่าน้ำหนัก 1.00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อวารสาร / แหล่งพิมพ์ *</label>
                  <input
                    type="text"
                    required
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    placeholder="เช่น วารสารสันติศึกษาปริทรรศน์ มจร"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ปีที่ตีพิมพ์ (พ.ศ.) *</label>
                  <input
                    type="number"
                    required
                    value={formData.yearBe}
                    onChange={(e) => setFormData({ ...formData, yearBe: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้ประพันธ์ *</label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สัดส่วนผู้แต่ง (%) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formData.authorShare}
                    onChange={(e) => setFormData({ ...formData, authorShare: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow transition-all"
                >
                  บันทึกผลงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}