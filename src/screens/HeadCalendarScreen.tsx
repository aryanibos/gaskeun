import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { CalendarPostItem, PlatformName, SubmissionStatus } from '../types';
import {
  EmptyFilterState,
  GeminiSparkleTile,
  PlatformBadge,
  StatusChip,
} from '../components/SharedUI';

interface HeadCalendarScreenProps {
  posts: CalendarPostItem[];
  onApplySuggestion: () => void;
}

const WEEKS = [
  {
    index: 0 as const,
    label: '5–11 Oct 2026',
    days: ['Mon 5', 'Tue 6', 'Wed 7', 'Thu 8', 'Fri 9', 'Sat 10', 'Sun 11'],
  },
  {
    index: 1 as const,
    label: '12–18 Oct 2026',
    days: ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17', 'Sun 18'],
  },
  {
    index: 2 as const,
    label: '19–25 Oct 2026',
    days: ['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23', 'Sat 24', 'Sun 25'],
  },
];

export default function HeadCalendarScreen({
  posts,
  onApplySuggestion,
}: HeadCalendarScreenProps) {
  const [weekIndex, setWeekIndex] = useState<0 | 1 | 2>(1);
  const [platformFilter, setPlatformFilter] = useState<'All' | PlatformName>('All');
  const [statusFilter, setStatusFilter] = useState<'All statuses' | SubmissionStatus>(
    'All statuses'
  );
  const [search, setSearch] = useState('');
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  const currentWeek = WEEKS[weekIndex];

  const weekTotalPosts = useMemo(
    () => posts.filter((p) => p.weekIndex === weekIndex),
    [posts, weekIndex]
  );

  const filteredWeekPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return weekTotalPosts.filter((p) => {
      const matchesPlatform =
        platformFilter === 'All' || p.platforms.includes(platformFilter);
      const matchesStatus =
        statusFilter === 'All statuses' || p.status === statusFilter;
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.designer.toLowerCase().includes(q);
      return matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [weekTotalPosts, platformFilter, statusFilter, search]);

  const handleResetFilters = () => {
    setPlatformFilter('All');
    setStatusFilter('All statuses');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Week Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="gaskeun-h1">Content calendar</h1>
          <p className="text-sm text-[#52607E] mt-1">
            Weekly publishing schedule across Instagram, LinkedIn, and TikTok for Lumbung Studio.
          </p>
        </div>

        {/* Previous / This week / Next buttons (3 weeks: 5–11, 12–18, 19–25 Oct 2026) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={weekIndex === 0}
            onClick={() => setWeekIndex((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2) : prev))}
            className="gaskeun-btn-secondary px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          <button
            type="button"
            onClick={() => setWeekIndex(1)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              weekIndex === 1
                ? 'bg-[#0B1F4D] text-white'
                : 'bg-white border border-[#D5DEEE] text-[#0B1F4D] hover:bg-[#F5F7FC]'
            }`}
          >
            This week
          </button>

          <button
            type="button"
            disabled={weekIndex === 2}
            onClick={() => setWeekIndex((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : prev))}
            className="gaskeun-btn-secondary px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Gemini Scheduling Suggestion */}
      <div className="gaskeun-ai-panel p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <GeminiSparkleTile size="md" />
          <div>
            <p className="text-xs sm:text-sm font-extrabold text-[#0B1F4D]">
              Scheduling suggestion (sample, not AI)
            </p>
            <p className="text-xs text-[#52607E] mt-0.5">
              {suggestionApplied
                ? 'Applied! "11.11 promo teaser" is now prioritized for peak evening engagement.'
                : 'Tuesday 13 Oct has an open evening slot. Moving "11.11 promo teaser" from Saturday noon to Tuesday 19:00 WIB is projected to boost reach by +24%.'}
            </p>
          </div>
        </div>

        {!suggestionApplied ? (
          <button
            type="button"
            onClick={() => {
              onApplySuggestion();
              setSuggestionApplied(true);
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1450E0] hover:bg-[#1044C4] text-white text-xs font-extrabold shrink-0 transition cursor-pointer"
          >
            Apply suggestion
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5F5EC] text-[#146C3C] text-xs font-extrabold shrink-0">
            <CheckCircle2 size={14} /> Slot optimized
          </span>
        )}
      </div>

      {/* Calendar Controls & Week Grid */}
      <div className="gaskeun-card p-6 space-y-5">
        {/* Top Bar inside Calendar: Date Range + "X of Y posts this week" + Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E6ECF5]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EEF2F9] text-sm font-extrabold text-[#0B1F4D]">
              <CalendarIcon size={16} className="text-[#1450E0]" />
              <span>{currentWeek.label}</span>
            </div>

            <span className="text-xs font-extrabold text-[#1450E0] bg-[#E6EFFF] px-3 py-1.5 rounded-full">
              {filteredWeekPosts.length} of {weekTotalPosts.length} posts this week
            </span>
          </div>

          {/* Platform Filter Chips + Status Dropdown + Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Instagram', 'LinkedIn', 'TikTok'] as const).map((plat) => {
                const active = platformFilter === plat;
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatformFilter(plat)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-[#0B1F4D] text-white'
                        : 'bg-[#F5F7FC] text-[#52607E] hover:text-[#0B1F4D] border border-[#E6ECF5]'
                    }`}
                  >
                    {plat}
                  </button>
                );
              })}
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'All statuses' | SubmissionStatus)
              }
              aria-label="Filter calendar by status"
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#D5DEEE] bg-white text-xs font-bold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
            >
              <option value="All statuses">All statuses</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In review">In review</option>
              <option value="Submitted">Submitted</option>
              <option value="Revision">Revision</option>
              <option value="Draft">Draft</option>
            </select>

            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52607E]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search week..."
                className="min-h-[40px] pl-9 pr-3 py-1.5 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Week Grid Mon–Sun */}
        {filteredWeekPosts.length === 0 ? (
          <EmptyFilterState onReset={handleResetFilters} />
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-3 min-w-[920px]">
              {currentWeek.days.map((dayLabel, dayIdx) => {
                const dayPosts = filteredWeekPosts.filter((p) => p.dayIndex === dayIdx);
                const isToday = weekIndex === 1 && dayIdx === 2; // Wed 14 Oct
                return (
                  <div
                    key={dayLabel}
                    className={`rounded-2xl border p-3 min-h-[250px] flex flex-col justify-between ${
                      isToday
                        ? 'bg-[#F2F6FF]/80 border-[#1450E0]'
                        : 'bg-[#F5F7FC]/60 border-[#E6ECF5]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E6ECF5]">
                        <span className="text-xs font-extrabold text-[#0B1F4D]">{dayLabel}</span>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full bg-[#1450E0] text-white text-[10px] font-extrabold">
                            Today
                          </span>
                        )}
                      </div>

                      {dayPosts.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-[11px] text-[#52607E]/60 font-medium">No posts</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {dayPosts.map((post) => (
                            <div
                              key={post.id}
                              className="p-3 rounded-xl bg-white border border-[#E6ECF5] shadow-2xs space-y-2 hover:border-[#1450E0] transition"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#52607E]">
                                  <Clock size={11} />
                                  {post.time}
                                </span>
                                <StatusChip status={post.status} />
                              </div>
                              <p className="text-xs font-extrabold text-[#0B1F4D] leading-snug">
                                {post.title}
                              </p>
                              <p className="text-[11px] text-[#52607E] font-medium">
                                {post.designer}
                              </p>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {post.platforms.map((pl) => (
                                  <PlatformBadge key={pl} platform={pl} compact />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
