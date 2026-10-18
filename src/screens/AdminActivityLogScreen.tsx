import React, { useState, useMemo } from 'react';
import { Search, Download, CheckCircle2, User } from 'lucide-react';
import { ActivityLogEntry } from '../types';
import { EmptyFilterState, PaginationBar, StatusChip } from '../components/SharedUI';

interface AdminActivityLogScreenProps {
  logs: ActivityLogEntry[];
}

const ACTION_CHIPS: (
  | 'All'
  | 'Submitted'
  | 'AI check'
  | 'Approved'
  | 'Revision'
  | 'Published'
  | 'Admin'
)[] = ['All', 'Submitted', 'AI check', 'Approved', 'Revision', 'Published', 'Admin'];

export default function AdminActivityLogScreen({ logs }: AdminActivityLogScreenProps) {
  const [search, setSearch] = useState('');
  const [personFilter, setPersonFilter] = useState('All people');
  const [actionFilter, setActionFilter] = useState<(typeof ACTION_CHIPS)[number]>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportedToast, setExportedToast] = useState(false);

  const pageSize = 8;

  const peopleOptions = useMemo(() => {
    const unique = Array.from(new Set(logs.map((l) => l.person)));
    return ['All people', ...unique];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((entry) => {
      const matchesPerson =
        personFilter === 'All people' || entry.person === personFilter;
      const matchesAction =
        actionFilter === 'All' || entry.actionCategory === actionFilter;
      const matchesSearch =
        !q ||
        entry.person.toLowerCase().includes(q) ||
        entry.actionLabel.toLowerCase().includes(q) ||
        entry.targetTitle.toLowerCase().includes(q) ||
        entry.detail.toLowerCase().includes(q);
      return matchesPerson && matchesAction && matchesSearch;
    });
  }, [logs, personFilter, actionFilter, search]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setPersonFilter('All people');
    setActionFilter('All');
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Person', 'Role', 'Category', 'Action', 'Target', 'Detail'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.person}"`,
      l.personRole,
      l.actionCategory,
      `"${l.actionLabel}"`,
      `"${l.targetTitle.replace(/"/g, '""')}"`,
      `"${l.detail.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'gaskeun-lumbung-studio-activity-log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 3500);
  };

  const mapCategoryToStatusChip = (cat: ActivityLogEntry['actionCategory']) => {
    if (cat === 'Approved' || cat === 'Published') return 'Published';
    if (cat === 'AI check') return 'In review';
    if (cat === 'Admin') return 'Draft';
    return cat;
  };

  return (
    <div className="space-y-6">
      {/* Header + Export CSV Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="gaskeun-h1">Workspace activity log</h1>
          <p className="text-sm text-[#52607E] mt-1">
            Complete audit trail of submissions, Brand Guardian checks, approvals, revisions, and admin events.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="gaskeun-btn-secondary px-5 py-2.5 text-xs font-extrabold inline-flex items-center gap-2 self-start cursor-pointer"
        >
          <Download size={15} className="text-[#1450E0]" />
          <span>Export CSV ({filteredLogs.length})</span>
        </button>
      </div>

      {exportedToast && (
        <div className="rounded-xl bg-[#E5F5EC] border border-[#146C3C]/20 px-4 py-3 text-xs font-bold text-[#146C3C] flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>Exported {filteredLogs.length} activity log rows to CSV.</span>
        </div>
      )}

      {/* Main Card: Search, Person Dropdown, Action Filter Chips, 24 entries (8 per page) */}
      <div className="gaskeun-card p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#E6ECF5]">
          {/* Action Filter Chips (All, Submitted, AI check, Approved, Revision, Published, Admin) */}
          <div className="flex flex-wrap gap-1.5">
            {ACTION_CHIPS.map((chip) => {
              const active = actionFilter === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setActionFilter(chip);
                    setCurrentPage(1);
                  }}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-[#F5F7FC] text-[#52607E] hover:text-[#0B1F4D] border border-[#E6ECF5]'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Search & Person Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
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
                placeholder="Search action, content, or detail..."
                className="min-h-[42px] pl-9 pr-4 py-2 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <User size={15} className="text-[#52607E] hidden sm:inline" />
              <select
                value={personFilter}
                onChange={(e) => {
                  setPersonFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by person"
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#D5DEEE] bg-white text-xs font-bold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
              >
                {peopleOptions.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table: 24 entries, 8 per page */}
        {filteredLogs.length === 0 ? (
          <EmptyFilterState onReset={handleResetFilters} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[740px]">
                <thead>
                  <tr className="border-b border-[#E6ECF5] text-[11px] font-extrabold uppercase tracking-wider text-[#52607E]">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Person</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Event</th>
                    <th className="py-3 px-3">Target</th>
                    <th className="py-3 px-3">Audit detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECF5] text-xs">
                  {paginatedLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#F5F7FC]/70 transition">
                      <td className="py-3.5 px-3 text-[#52607E] font-medium whitespace-nowrap">
                        {entry.timestamp}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-extrabold text-[#0B1F4D]">{entry.person}</span>
                        <span className="ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF2F9] text-[#52607E]">
                          {entry.personRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusChip status={mapCategoryToStatusChip(entry.actionCategory)} />
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#0B1F4D]">
                        {entry.actionLabel}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-[#1450E0]">
                        {entry.targetTitle}
                      </td>
                      <td className="py-3.5 px-3 text-[#52607E]">{entry.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalItems={filteredLogs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
