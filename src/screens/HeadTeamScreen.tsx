import React, { useState, useMemo } from 'react';
import { Search, ArrowUpRight, Clock } from 'lucide-react';
import { ScreenId, TeamDesignerItem } from '../types';
import {
  EmptyFilterState,
  GeminiSparkleTile,
  PaginationBar,
  StatusChip,
} from '../components/SharedUI';

interface HeadTeamScreenProps {
  designers: TeamDesignerItem[];
  onNavigate: (screen: ScreenId) => void;
}

export default function HeadTeamScreen({ designers, onNavigate }: HeadTeamScreenProps) {
  const [search, setSearch] = useState('');
  const [workloadFilter, setWorkloadFilter] = useState<'All' | 'Busy' | 'Normal' | 'Light'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const workloadCounts = useMemo(() => {
    return {
      All: designers.length,
      Busy: designers.filter((d) => d.workload === 'Busy').length,
      Normal: designers.filter((d) => d.workload === 'Normal').length,
      Light: designers.filter((d) => d.workload === 'Light').length,
    };
  }, [designers]);

  const filteredDesigners = useMemo(() => {
    const q = search.trim().toLowerCase();
    return designers.filter((des) => {
      const matchesWorkload = workloadFilter === 'All' || des.workload === workloadFilter;
      const matchesSearch =
        !q ||
        des.name.toLowerCase().includes(q) ||
        des.title.toLowerCase().includes(q) ||
        des.latestItem.toLowerCase().includes(q);
      return matchesWorkload && matchesSearch;
    });
  }, [designers, workloadFilter, search]);

  const paginatedDesigners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDesigners.slice(start, start + pageSize);
  }, [filteredDesigners, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setWorkloadFilter('All');
    setCurrentPage(1);
  };

  const workloadBadgeStyle = (w: 'Busy' | 'Normal' | 'Light') => {
    if (w === 'Busy') return 'bg-[#FFF4D6] text-[#7A5300]';
    if (w === 'Normal') return 'bg-[#E6EFFF] text-[#0E3AAE]';
    return 'bg-[#E5F5EC] text-[#146C3C]';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="gaskeun-h1">Design team workload &amp; throughput</h1>
        <p className="text-sm text-[#52607E] mt-1">
          Monitor submission queues, revision turnarounds, and weekly capacity across Lumbung Studio&apos;s 7 Staff Designers.
        </p>
      </div>

      {/* Gemini Weekly Insight */}
      <div className="gaskeun-ai-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <GeminiSparkleTile size="md" />
          <div>
            <p className="text-sm font-extrabold text-[#0B1F4D]">Weekly insight (sample data, not AI)</p>
            <p className="text-xs text-[#52607E] mt-0.5 leading-relaxed">
              First-pass approval rate climbed from <strong className="text-[#0B1F4D]">64% to 82%</strong> this week after Staff Designers enabled the Brand Guardian OCR check. <strong className="text-[#0B1F4D]">Rina Putri</strong> and <strong className="text-[#0B1F4D]">Sari Wulandari</strong> have the highest active queue; <strong className="text-[#0B1F4D]">Maya Anggraini</strong> and <strong className="text-[#0B1F4D]">Tomi Hartono</strong> have open capacity for upcoming 11.11 assets.
            </p>
          </div>
        </div>
      </div>

      {/* Search + Workload Filter Chips + 7 Designer Cards (6 per page) */}
      <div className="gaskeun-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E6ECF5]">
          {/* Workload Filter Chips: All / Busy / Normal / Light */}
          <div className="flex flex-wrap gap-1.5">
            {(['All', 'Busy', 'Normal', 'Light'] as const).map((wl) => {
              const active = workloadFilter === wl;
              return (
                <button
                  key={wl}
                  type="button"
                  onClick={() => {
                    setWorkloadFilter(wl);
                    setCurrentPage(1);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
                    active
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-[#F5F7FC] text-[#52607E] hover:text-[#0B1F4D] border border-[#E6ECF5]'
                  }`}
                >
                  <span>{wl}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-[#BBFB52] text-[#0B1F4D]' : 'bg-white text-[#0B1F4D]'
                    }`}
                  >
                    {workloadCounts[wl]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Search */}
          <div className="relative w-full md:w-72">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52607E]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search designer or latest post..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
            />
          </div>
        </div>

        {filteredDesigners.length === 0 ? (
          <EmptyFilterState onReset={handleResetFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedDesigners.map((des) => (
                <div
                  key={des.id}
                  className="p-5 rounded-2xl border border-[#E6ECF5] bg-[#F5F7FC]/50 hover:bg-white hover:border-[#1450E0] transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        style={{ backgroundColor: des.avatarBg }}
                        className="w-11 h-11 rounded-2xl text-white flex items-center justify-center text-sm font-extrabold shrink-0"
                      >
                        {des.initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-[#0B1F4D] truncate">
                          {des.name}
                        </h3>
                        <p className="text-xs text-[#52607E] truncate">{des.title}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 ${workloadBadgeStyle(
                        des.workload
                      )}`}
                    >
                      {des.workload}
                    </span>
                  </div>

                  {/* In review / revisions / published counts */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6ECF5] text-center">
                      <span className="block text-base font-extrabold text-[#4C3D7A]">
                        {des.inReviewCount}
                      </span>
                      <span className="text-[10px] font-bold text-[#52607E]">In review</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6ECF5] text-center">
                      <span className="block text-base font-extrabold text-[#7A5300]">
                        {des.revisionsCount}
                      </span>
                      <span className="text-[10px] font-bold text-[#52607E]">Revisions</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6ECF5] text-center">
                      <span className="block text-base font-extrabold text-[#146C3C]">
                        {des.publishedCount}
                      </span>
                      <span className="text-[10px] font-bold text-[#52607E]">Published</span>
                    </div>
                  </div>

                  {/* Latest item */}
                  <div className="p-3 rounded-xl bg-white border border-[#E6ECF5] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#52607E]">
                        Latest item
                      </span>
                      <StatusChip status={des.latestStatus} />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <p className="text-xs font-extrabold text-[#0B1F4D] truncate">
                        {des.latestItem}
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('head-queue')}
                        className="text-xs font-bold text-[#1450E0] inline-flex items-center gap-0.5 shrink-0 hover:underline cursor-pointer"
                      >
                        Review <ArrowUpRight size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#52607E] pt-0.5">
                      <Clock size={12} />
                      <span>Avg. approval turnaround: {des.avgTurnaround}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalItems={filteredDesigners.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
