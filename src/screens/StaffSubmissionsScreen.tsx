import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  FileEdit,
} from 'lucide-react';
import { ContentType, PlatformName, ScreenId, StaffSubmissionItem } from '../types';
import {
  EmptyFilterState,
  PaginationBar,
  PlatformBadge,
  StatusChip,
} from '../components/SharedUI';

interface StaffSubmissionsScreenProps {
  submissions: StaffSubmissionItem[];
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

type TabKey = 'All' | 'Drafts' | 'In review' | 'Revision' | 'Scheduled' | 'Published';

export default function StaffSubmissionsScreen({
  submissions,
  initialTab = 'All',
  onTabChange,
  onNavigate,
}: StaffSubmissionsScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>((initialTab as TabKey) || 'All');
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All platforms' | PlatformName>(
    'All platforms'
  );
  const [typeFilter, setTypeFilter] = useState<'All types' | ContentType>('All types');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as TabKey);
      setCurrentPage(1);
    }
  }, [initialTab]);

  const tabCounts = useMemo(() => {
    return {
      All: submissions.length,
      Drafts: submissions.filter((s) => s.status === 'Draft').length,
      'In review': submissions.filter((s) => s.status === 'In review' || s.status === 'Submitted')
        .length,
      Revision: submissions.filter((s) => s.status === 'Revision').length,
      Scheduled: submissions.filter((s) => s.status === 'Scheduled').length,
      Published: submissions.filter((s) => s.status === 'Published').length,
    };
  }, [submissions]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((row) => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Drafts' && row.status === 'Draft') ||
        (activeTab === 'In review' &&
          (row.status === 'In review' || row.status === 'Submitted')) ||
        row.status === activeTab;

      const matchesSearch =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.reviewer.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q);

      const matchesPlatform =
        platformFilter === 'All platforms' || row.platforms.includes(platformFilter);

      const matchesType = typeFilter === 'All types' || row.type === typeFilter;

      return matchesTab && matchesSearch && matchesPlatform && matchesType;
    });
  }, [submissions, activeTab, search, platformFilter, typeFilter]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  const handleResetFilters = () => {
    setActiveTab('All');
    onTabChange?.('All');
    setSearch('');
    setPlatformFilter('All platforms');
    setTypeFilter('All types');
    setCurrentPage(1);
  };

  const revisionItems = submissions.filter((s) => s.status === 'Revision');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="gaskeun-h1">
            {activeTab === 'Drafts' ? 'Drafts' : 'My submissions'}
          </h1>
          <p className="text-sm text-[#52607E] mt-1">
            Track your uploaded designs, address Head Designer revision notes, and manage scheduled posts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('staff-upload')}
          className="gaskeun-btn-primary px-5 text-xs font-extrabold inline-flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus size={16} />
          <span>New submission</span>
        </button>
      </div>

      {/* Revision Alert Banner */}
      {revisionItems.length > 0 && (
        <div className="rounded-2xl bg-[#FFF4D6] border border-[#D97706]/35 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#7A5300] text-white flex items-center justify-center shrink-0">
              <AlertTriangle size={19} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#7A5300]">
                {revisionItems.length} submissions need your revision
              </p>
              <p className="text-xs text-[#7A5300]/90 mt-0.5">
                <strong>Bima Santoso</strong> left a note on &ldquo;{revisionItems[0].title}&rdquo;: &ldquo;
                {revisionItems[0].revisionNote}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('Revision');
                onTabChange?.('Revision');
                setCurrentPage(1);
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-[#7A5300]/30 text-xs font-extrabold text-[#7A5300] hover:bg-[#FFF4D6]/50 transition cursor-pointer"
            >
              Filter revisions ({revisionItems.length})
            </button>
            <button
              type="button"
              onClick={() => onNavigate('staff-upload')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#7A5300] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Fix in editor</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Card: Status Tabs, Search & Dropdowns, 12-row Table (5 per page) */}
      <div className="gaskeun-card p-6 space-y-5">
        {/* Status Tabs with Counts */}
        <div className="flex flex-wrap gap-1.5 pb-4 border-b border-[#E6ECF5]">
          {(['All', 'Drafts', 'In review', 'Revision', 'Scheduled', 'Published'] as TabKey[]).map(
            (tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    onTabChange?.(tab);
                    setCurrentPage(1);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
                    active
                      ? 'bg-[#0B1F4D] text-white shadow-2xs'
                      : 'bg-[#F5F7FC] text-[#52607E] hover:text-[#0B1F4D] border border-[#E6ECF5]'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-[#BBFB52] text-[#0B1F4D]' : 'bg-white text-[#0B1F4D]'
                    }`}
                  >
                    {tabCounts[tab]}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Search, Platform Dropdown, and Type Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52607E]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by submission title, ID, or reviewer..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value as 'All platforms' | PlatformName);
                setCurrentPage(1);
              }}
              aria-label="Filter by platform"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D5DEEE] bg-white text-xs font-bold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
            >
              <option value="All platforms">All platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="TikTok">TikTok</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'All types' | ContentType);
                setCurrentPage(1);
              }}
              aria-label="Filter by content type"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D5DEEE] bg-white text-xs font-bold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
            >
              <option value="All types">All types</option>
              <option value="Poster">Poster</option>
              <option value="Carousel">Carousel</option>
              <option value="Video">Video</option>
              <option value="Story">Story</option>
            </select>
          </div>
        </div>

        {/* Table (12 rows, 5 per page) */}
        {filteredRows.length === 0 ? (
          <EmptyFilterState onReset={handleResetFilters} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#E6ECF5] text-[11px] font-extrabold uppercase tracking-wider text-[#52607E]">
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Platforms</th>
                    <th className="py-3 px-3">Reviewer</th>
                    <th className="py-3 px-3">Updated</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECF5] text-xs">
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#F5F7FC]/70 transition">
                      <td className="py-3.5 px-3">
                        <p className="font-extrabold text-[#0B1F4D]">{row.title}</p>
                        {row.revisionNote ? (
                          <p className="text-[11px] font-semibold text-[#7A5300] mt-0.5">
                            Note: {row.revisionNote}
                          </p>
                        ) : (
                          <span className="text-[11px] text-[#52607E]">{row.id}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[#EEF2F9] text-[#0B1F4D] font-bold text-[11px]">
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {row.platforms.map((p) => (
                            <PlatformBadge key={p} platform={p} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#0B1F4D]">{row.reviewer}</td>
                      <td className="py-3.5 px-3 text-[#52607E] font-medium">{row.updatedAt}</td>
                      <td className="py-3.5 px-3">
                        <StatusChip status={row.status} />
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate('staff-upload')}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#D5DEEE] bg-white hover:bg-[#F5F7FC] text-xs font-bold text-[#0B1F4D] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileEdit size={13} />
                          <span>Open</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalItems={filteredRows.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
