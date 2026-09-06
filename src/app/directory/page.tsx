'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Tag, 
  Mail, 
  ExternalLink, 
  BookOpen, 
  Building,
  GraduationCap
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
    };
  }>;
}

export default function PublicDirectoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sanghaFilter, setSanghaFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data: Profile[]) => {
        setProfiles(data);
        setLoading(false);
      });
  }, []);

  const filteredProfiles = profiles.filter((p) => {
    const fullName = `${p.prefix} ${p.firstName} ${p.chaya || ''} ${p.lastName || ''}`.toLowerCase();
    const dept = p.department?.nameTh?.toLowerCase() || '';
    const tags = p.expertises?.toLowerCase() || '';
    const query = search.toLowerCase();

    const matchesSearch = fullName.includes(query) || dept.includes(query) || tags.includes(query);
    const matchesSangha = sanghaFilter === 'ALL' || p.sanghaStatus === sanghaFilter;

    return matchesSearch && matchesSangha;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-3xl mx-auto">
        <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-brand-primary mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          ทำเนียบผู้เชี่ยวชาญและคณาจารย์นักวิจัย
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          วิทยาลัยสงฆ์เลย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (สำหรับนิสิต ชุมชน และหน่วยงานภายนอก)
        </p>

        {/* Search Input */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่ออาจารย์, สาขาวิชา, หรือความเชี่ยวชาญ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <select
            value={sanghaFilter}
            onChange={(e) => setSanghaFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="MONK">พระภิกษุสงฆ์</option>
            <option value="LAITY">คฤหัสถ์</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProfiles.map((p) => {
            const tags = p.expertises ? JSON.parse(p.expertises) : [];
            const displayName = `${p.prefix} ${p.firstName}${p.chaya ? ` ${p.chaya}` : ''}${p.lastName ? ` ${p.lastName}` : ''}`;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-brand-primary/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 text-brand-dark flex items-center justify-center font-bold text-lg">
                        {p.sanghaStatus === 'MONK' ? 'ภ' : 'อ'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {displayName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.department?.nameTh}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.sanghaStatus === 'MONK'
                        ? 'bg-rose-100 text-brand-dark'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.sanghaStatus === 'MONK' ? 'พระภิกษุ' : 'คฤหัสถ์'}
                    </span>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
                    <span>ผลงานตีพิมพ์: {p.authorships?.length || 0} เรื่อง</span>
                  </span>

                  {p.email && (
                    <span className="text-slate-500">{p.email}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}