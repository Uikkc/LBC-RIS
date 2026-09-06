'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  Mail, 
  Phone, 
  ExternalLink, 
  BookOpen, 
  Award, 
  Edit3, 
  Save, 
  Tag,
  CheckCircle2,
  Printer
} from 'lucide-react';

interface Profile {
  id: string;
  prefix: string;
  firstName: string;
  lastName?: string;
  chaya?: string;
  sanghaStatus: string;
  academicRank: string;
  email?: string;
  phone?: string;
  expertises?: string;
  orcidId?: string;
  googleScholar?: string;
  department: {
    nameTh: string;
  };
  authorships: Array<{
    publication: {
      id: string;
      titleTh: string;
      yearBe: number;
      indexing: string;
      qaScore: number;
    };
  }>;
  grantMemberships: Array<{
    grant: {
      id: string;
      projectCode: string;
      titleTh: string;
      totalBudget: number;
      status: string;
    };
  }>;
}

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    prefix: '',
    firstName: '',
    lastName: '',
    chaya: '',
    sanghaStatus: 'MONK',
    academicRank: 'NONE',
    email: '',
    phone: '',
    expertises: '',
    orcidId: '',
    googleScholar: '',
  });

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data: Profile[]) => {
        setProfiles(data);
        if (data.length > 0) {
          selectProfile(data[0].id);
        }
      });
  }, []);

  const selectProfile = (profileId: string) => {
    fetch(`/api/profile?id=${profileId}`)
      .then((res) => res.json())
      .then((p: Profile) => {
        setActiveProfile(p);
        setFormData({
          prefix: p.prefix || '',
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          chaya: p.chaya || '',
          sanghaStatus: p.sanghaStatus || 'MONK',
          academicRank: p.academicRank || 'NONE',
          email: p.email || '',
          phone: p.phone || '',
          expertises: p.expertises ? JSON.parse(p.expertises).join(', ') : '',
          orcidId: p.orcidId || '',
          googleScholar: p.googleScholar || '',
        });
        setIsEditing(false);
      });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;

    const expertisesArray = formData.expertises
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: activeProfile.id,
        ...formData,
        expertises: expertisesArray,
      }),
    });

    if (res.ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      selectProfile(activeProfile.id);
    }
  };

  if (!activeProfile) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูลประวัตินักวิจัย...</div>;
  }

  const expertisesList = activeProfile.expertises
    ? JSON.parse(activeProfile.expertises)
    : [];

  return (
    <div className="space-y-6">
      {/* Switcher for testing all types of personas (Monk vs Lay, Executive vs Teacher) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-brand-primary" />
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            เลือกดูประวัติอาจารย์/นักวิจัย (จำลองผู้ใช้):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => {
            const isSelected = p.id === activeProfile.id;
            const displayName = p.sanghaStatus === 'MONK'
              ? `${p.prefix} (${p.chaya || ''})`
              : `${p.prefix} ${p.firstName} ${p.lastName || ''}`;
            return (
              <button
                key={p.id}
                onClick={() => selectProfile(p.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-brand-dark via-brand-primary to-rose-700"></div>

        <div className="px-6 sm:px-8 pb-8 relative">
          {/* Avatar and Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-brand-primary bg-rose-50">
              {activeProfile.sanghaStatus === 'MONK' ? 'ภ' : 'อ'}
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <Link
                href={`/academic-cv?profileId=${activeProfile.id}&mode=gorporor`}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 transition-colors shadow-2xs"
                title="พิมพ์แบบฟอร์ม ก.พ.อ. 03 และ Official Academic CV"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>พิมพ์แบบ ก.พ.อ. 03 / CV</span>
              </Link>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-brand-primary" />
                <span>{isEditing ? 'ยกเลิกการแก้ไข' : 'แก้ไขข้อมูลส่วนตัว'}</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลงประวัตินักวิจัยเรียบร้อยแล้ว</span>
            </div>
          )}

          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-brand-dark mb-4">
                <strong>คำแนะนำอัตลักษณ์สงฆ์:</strong> หากเป็นพระภิกษุ ให้ระบุสมณศักดิ์ในช่องคำนำหน้า (เช่น พระครู, พระมหา) และระบุฉายาในช่อง "ฉายา" นามสกุลสามารถเว้นว่างได้
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะ</label>
                  <select
                    value={formData.sanghaStatus}
                    onChange={(e) => setFormData({ ...formData, sanghaStatus: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  >
                    <option value="MONK">พระภิกษุ / บรรพชิต</option>
                    <option value="LAITY">คฤหัสถ์ / ฆราวาส</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สมณศักดิ์ / คำนำหน้า *</label>
                  <input
                    type="text"
                    required
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    placeholder="เช่น พระครูปริยัติวีราภรณ์, ดร., ผศ.ดร."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อตัว *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ฉายา (สำหรับพระสงฆ์)</label>
                  <input
                    type="text"
                    value={formData.chaya}
                    onChange={(e) => setFormData({ ...formData, chaya: e.target.value })}
                    placeholder="เช่น ฐิตปุญฺโญ, ชินวํโส"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">นามสกุล</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="สำหรับคฤหัสถ์ หรือพระสงฆ์ที่มีนามสกุล"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่งทางวิชาการ</label>
                  <select
                    value={formData.academicRank}
                    onChange={(e) => setFormData({ ...formData, academicRank: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  >
                    <option value="NONE">ไม่มีตำแหน่งทางวิชาการ</option>
                    <option value="LECTURER">อาจารย์</option>
                    <option value="ASST_PROF">ผู้ช่วยศาสตราจารย์ (ผศ.)</option>
                    <option value="ASSOC_PROF">รองศาสตราจารย์ (รศ.)</option>
                    <option value="PROF">ศาสตราจารย์ (ศ.)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ความเชี่ยวชาญเฉพาะทาง (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={formData.expertises}
                  onChange={(e) => setFormData({ ...formData, expertises: e.target.value })}
                  placeholder="เช่น พระพุทธศาสนา, พุทธจิตวิทยา, การวิจัยเชิงพื้นที่"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ORCID iD</label>
                  <input
                    type="text"
                    value={formData.orcidId}
                    onChange={(e) => setFormData({ ...formData, orcidId: e.target.value })}
                    placeholder="0000-0000-0000-0000"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Scholar URL</label>
                  <input
                    type="text"
                    value={formData.googleScholar}
                    onChange={(e) => setFormData({ ...formData, googleScholar: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {activeProfile.prefix} {activeProfile.firstName}
                    {activeProfile.chaya && ` ${activeProfile.chaya}`}
                    {activeProfile.lastName && ` ${activeProfile.lastName}`}
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-brand-dark font-bold">
                    {activeProfile.sanghaStatus === 'MONK' ? 'พระภิกษุ' : 'คฤหัสถ์'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  {activeProfile.department.nameTh} • วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
                </p>
              </div>

              {/* Contact & External Links */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                {activeProfile.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{activeProfile.email}</span>
                  </div>
                )}
                {activeProfile.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{activeProfile.phone}</span>
                  </div>
                )}
                {activeProfile.orcidId && (
                  <a
                    href={`https://orcid.org/${activeProfile.orcidId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-600 hover:underline font-medium"
                  >
                    <span>ORCID: {activeProfile.orcidId}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {activeProfile.googleScholar && (
                  <a
                    href={activeProfile.googleScholar}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sky-600 hover:underline font-medium"
                  >
                    <span>Google Scholar Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Expertise Tags */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>ความเชี่ยวชาญเฉพาะทาง</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expertisesList.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publications by this Researcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-primary" />
          <span>ผลงานวิชาการที่ร่วมประพันธ์ ({activeProfile.authorships.length} เรื่อง)</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {activeProfile.authorships.map((auth, idx) => (
            <div key={idx} className="py-3.5 flex justify-between items-center gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{auth.publication.titleTh}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  ปี พ.ศ. {auth.publication.yearBe} • ฐานข้อมูล: {auth.publication.indexing}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-brand-primary">
                  ค่าน้ำหนัก QA: {auth.publication.qaScore.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}