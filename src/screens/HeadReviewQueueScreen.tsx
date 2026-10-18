import React, { useState, useMemo } from 'react';
import {
  Search,
  Clock,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  XCircle,
  MessageSquareWarning,
  Rocket,
  User,
} from 'lucide-react';
import { QueueItem, ScreenId } from '../types';
import {
  EmptyFilterState,
  GeminiSparkleTile,
  PaginationBar,
  PlatformBadge,
  PosterGraphic,
  StatusChip,
} from '../components/SharedUI';

interface HeadReviewQueueScreenProps {
  items: QueueItem[];
  onUpdateItemStatus: (
    id: string,
    status: 'Submitted' | 'In review' | 'Revision',
    note?: string
  ) => void;
  onApproveItem: (item: QueueItem) => void;
  onRejectItem: (id: string) => void;
  onNavigate: (screen: ScreenId) => void;
  typoFixed: boolean;
}

const DESIGNER_OPTIONS = [
  'All designers',
  'Rina Putri',
  'Dimas Arya',
  'Sari Wulandari',
  'Nadia Kusuma',
  'Raka Pratama',
  'Maya Anggraini',
  'Tomi Hartono',
];

export default function HeadReviewQueueScreen({
  items,
  onUpdateItemStatus,
  onApproveItem,
  onRejectItem,
  onNavigate,
  typoFixed,
}: HeadReviewQueueScreenProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'In review' | 'Revision'>(
    'All'
  );
  const [designerFilter, setDesignerFilter] = useState('All designers');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id || 'SUB-1042');
  const [captionsOpen, setCaptionsOpen] = useState(true);
  const [revisionBoxOpen, setRevisionBoxOpen] = useState(false);
  const [revisionNoteInput, setRevisionNoteInput] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const pageSize = 4;

  // Status counts across items (filtered by search + designer or total)
  const counts = useMemo(() => {
    return {
      All: items.length,
      Submitted: items.filter((i) => i.status === 'Submitted').length,
      'In review': items.filter((i) => i.status === 'In review').length,
      Revision: items.filter((i) => i.status === 'Revision').length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.designer.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesDesigner =
        designerFilter === 'All designers' || item.designer === designerFilter;
      return matchesSearch && matchesStatus && matchesDesigner;
    });
  }, [items, search, statusFilter, designerFilter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  const selectedItem =
    items.find((i) => i.id === selectedId) || filteredItems[0] || items[0];

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setDesignerFilter('All designers');
    setCurrentPage(1);
  };

  const handleSendRevision = () => {
    if (!selectedItem) return;
    const note =
      revisionNoteInput.trim() ||
      'Please adjust layout spacing and verify placeholder details before final publish.';
    onUpdateItemStatus(selectedItem.id, 'Revision', note);
    setRevisionBoxOpen(false);
    setRevisionNoteInput('');
    setFeedbackBanner(`Revision requested for "${selectedItem.title}" with note sent to ${selectedItem.designer}.`);
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  const handleReject = () => {
    if (!selectedItem) return;
    onRejectItem(selectedItem.id);
    setFeedbackBanner(`Rejected submission "${selectedItem.title}".`);
    setTimeout(() => setFeedbackBanner(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="gaskeun-h1">Head Designer review queue</h1>
          <p className="text-sm text-[#52607E] mt-1">
            Review AI pre-checked submissions, request revisions, or approve to auto-publish.
          </p>
        </div>
      </div>

      {/* 3 Stat Cards: 5 waiting, 2 revisions, 3 low risk */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gaskeun-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#52607E]">
              Waiting for review
            </p>
            <p className="text-2xl font-extrabold text-[#0B1F4D] mt-1">5 waiting</p>
            <p className="text-xs text-[#52607E] mt-0.5">Submitted &amp; In review items</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E6EFFF] text-[#1450E0] flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="gaskeun-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#52607E]">
              Needs revision
            </p>
            <p className="text-2xl font-extrabold text-[#7A5300] mt-1">2 revisions</p>
            <p className="text-xs text-[#52607E] mt-0.5">Awaiting staff designer updates</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FFF4D6] text-[#7A5300] flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="gaskeun-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#52607E]">
              Brand Guardian ready
            </p>
            <p className="text-2xl font-extrabold text-[#146C3C] mt-1">3 low risk</p>
            <p className="text-xs text-[#52607E] mt-0.5">Passed all brand &amp; copy checks</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E5F5EC] text-[#146C3C] flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {feedbackBanner && (
        <div className="rounded-xl bg-[#E6EFFF] border border-[#1450E0]/30 px-4 py-3 flex items-center justify-between text-xs font-bold text-[#0E3AAE]">
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="underline cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Split Grid: Left Queue List (5 cols) + Right Selected Item Detail (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Search, Filter Chips, Designer Dropdown, Queue List (7 items, 4 per page) */}
        <div className="lg:col-span-5 gaskeun-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0B1F4D]">Submissions queue</h2>
            <span className="text-xs font-bold text-[#52607E]">{filteredItems.length} total</span>
          </div>

          {/* Live Search Input */}
          <div className="relative">
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
              placeholder="Search title, designer, or ID..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
            />
          </div>

          {/* Status Filter Chips with Counts */}
          <div className="flex flex-wrap gap-1.5">
            {(['All', 'Submitted', 'In review', 'Revision'] as const).map((st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                    active
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-[#F5F7FC] text-[#52607E] hover:text-[#0B1F4D] border border-[#E6ECF5]'
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-[#BBFB52] text-[#0B1F4D]' : 'bg-white text-[#0B1F4D]'
                    }`}
                  >
                    {counts[st]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Designer Dropdown */}
          <div className="flex items-center gap-2">
            <User size={15} className="text-[#52607E] shrink-0" />
            <select
              value={designerFilter}
              onChange={(e) => {
                setDesignerFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by designer"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#D5DEEE] bg-white text-xs font-bold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
            >
              {DESIGNER_OPTIONS.map((des) => (
                <option key={des} value={des}>
                  {des}
                </option>
              ))}
            </select>
          </div>

          {/* Queue List or Empty State */}
          {filteredItems.length === 0 ? (
            <EmptyFilterState onReset={handleResetFilters} />
          ) : (
            <div className="space-y-2.5">
              {paginatedItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      setRevisionBoxOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#F2F6FF] border-[#1450E0] ring-2 ring-[#1450E0]/15'
                        : 'bg-white border-[#E6ECF5] hover:border-[#D5DEEE] hover:bg-[#F5F7FC]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#0B1F4D] truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] font-medium text-[#52607E] mt-0.5">
                          {item.designer} · {item.submittedAt}
                        </p>
                      </div>
                      <StatusChip status={item.status} />
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#E6ECF5]">
                      <div className="flex flex-wrap gap-1">
                        {item.platforms.map((p) => (
                          <PlatformBadge key={p} platform={p} compact />
                        ))}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          item.riskLevel === 'LOW RISK'
                            ? 'bg-[#E5F5EC] text-[#146C3C]'
                            : 'bg-[#FFF4D6] text-[#7A5300]'
                        }`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>
                  </div>
                );
              })}

              <PaginationBar
                currentPage={currentPage}
                totalItems={filteredItems.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Right Card: Selected Item Review Panel */}
        {selectedItem && (
          <div className="lg:col-span-7 gaskeun-card p-6 space-y-5">
            {/* Item Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#E6ECF5]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#52607E]">{selectedItem.id}</span>
                  <StatusChip status={selectedItem.status} />
                </div>
                <h2 className="text-xl font-extrabold text-[#0B1F4D] mt-1">{selectedItem.title}</h2>
                <p className="text-xs text-[#52607E] mt-0.5">
                  Submitted by <strong className="text-[#0B1F4D]">{selectedItem.designer}</strong> ·{' '}
                  {selectedItem.submittedAt}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedItem.platforms.map((plat) => (
                  <PlatformBadge key={plat} platform={plat} />
                ))}
              </div>
            </div>

            {/* Poster Preview */}
            {selectedItem.imageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-[#E6ECF5] bg-[#F5F7FC] flex items-center justify-center">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full max-h-[520px] object-contain"
                />
              </div>
            ) : (
              <PosterGraphic
                theme={selectedItem.posterTheme}
                typoFixed={selectedItem.posterTheme === 'hiring' ? typoFixed : true}
              />
            )}

            {/* AI Review Summary Panel */}
            <div className="gaskeun-ai-panel p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <GeminiSparkleTile size="md" />
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B1F4D]">AI review summary</h3>
                    <p className="text-[11px] text-[#52607E]">
                      {selectedItem.aiSource === 'gemini'
                        ? 'Live Gemini Brand Guardian result for this submission'
                        : 'Sample demo data (not AI-generated)'}
                    </p>
                  </div>
                </div>

                {/* LOW RISK Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    selectedItem.riskLevel === 'LOW RISK'
                      ? 'bg-[#E5F5EC] text-[#146C3C] border border-[#146C3C]/20'
                      : 'bg-[#FFF4D6] text-[#7A5300] border border-[#7A5300]/20'
                  }`}
                >
                  {selectedItem.riskLevel}
                </span>
              </div>

              {/* Risk Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#52607E]">Brand &amp; compliance risk score</span>
                  <span className="text-[#0B1F4D]">{selectedItem.riskScore} / 100 (Safe threshold &lt; 25)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white border border-[#D9E4FF] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${selectedItem.riskScore}%`,
                      backgroundColor:
                        selectedItem.riskLevel === 'LOW RISK' ? '#146C3C' : '#D97706',
                    }}
                  />
                </div>
              </div>

              {/* What it is */}
              <div className="bg-white rounded-xl p-3.5 border border-[#D9E4FF] space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1450E0]">
                  What it is
                </span>
                <p className="text-xs text-[#0B1F4D] leading-relaxed font-medium">
                  {selectedItem.aiWhatItIs}
                </p>
              </div>

              {/* Checks list */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#52607E]">
                  {selectedItem.aiSource === 'gemini' ? 'Brand Guardian findings' : 'Checks (sample)'}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedItem.aiChecks.map((chk, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-[#0B1F4D] bg-white/80 px-3 py-2 rounded-lg border border-[#D9E4FF]"
                    >
                      <CheckCircle2
                        size={15}
                        className={`shrink-0 mt-0.5 ${
                          selectedItem.aiIssues && selectedItem.aiIssues.length > 0
                            ? 'text-[#D97706]'
                            : 'text-[#146C3C]'
                        }`}
                      />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="flex items-center justify-between pt-2 border-t border-[#D9E4FF] text-xs">
                <span className="font-extrabold text-[#0E3AAE]">
                  {selectedItem.aiRecommendation}
                </span>
                <span className="text-[11px] font-semibold text-[#52607E]">
                  Est. publish time: &lt; 10 sec
                </span>
              </div>
            </div>

            {/* Collapsible Captions */}
            <div className="rounded-2xl border border-[#E6ECF5] bg-[#F5F7FC]/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setCaptionsOpen(!captionsOpen)}
                className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-xs font-extrabold text-[#0B1F4D] hover:bg-[#EEF2F9] transition cursor-pointer"
              >
                <span>Platform captions ({Object.keys(selectedItem.captions).length})</span>
                {captionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {captionsOpen && (
                <div className="p-4 pt-0 space-y-3 border-t border-[#E6ECF5]">
                  {Object.entries(selectedItem.captions).map(([plat, cap]) => (
                    <div key={plat} className="bg-white rounded-xl p-3.5 border border-[#E6ECF5] mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <PlatformBadge platform={plat as 'Instagram' | 'LinkedIn' | 'TikTok'} />
                        <span className="text-[11px] text-[#52607E] font-semibold">
                          {cap.length} chars
                        </span>
                      </div>
                      <p className="text-xs text-[#0B1F4D] leading-relaxed">{cap}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Request Revision Note Box (when toggled) */}
            {revisionBoxOpen && (
              <div className="p-4 rounded-2xl bg-[#FFF4D6]/60 border border-[#D97706]/40 space-y-3">
                <label className="block text-xs font-extrabold text-[#7A5300]">
                  Revision note for {selectedItem.designer}
                </label>
                <textarea
                  rows={3}
                  value={revisionNoteInput}
                  onChange={(e) => setRevisionNoteInput(e.target.value)}
                  placeholder="Explain what needs to be adjusted (e.g., fix safe-zone margin or update [DEADLINE])..."
                  className="w-full p-3 rounded-xl border border-[#D97706]/40 bg-white text-xs text-[#0B1F4D] focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRevisionBoxOpen(false)}
                    className="gaskeun-btn-secondary px-3.5 py-2 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRevision}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#7A5300] text-white text-xs font-extrabold cursor-pointer"
                  >
                    Send revision request
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons: Reject / Request revision / Approve & Gaskeun! */}
            <div className="pt-3 border-t border-[#E6ECF5] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleReject}
                  className="min-h-[48px] px-4 rounded-xl border border-[#FECACA] bg-white hover:bg-[#FEF2F2] text-[#991B1B] text-xs font-extrabold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <XCircle size={15} />
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => setRevisionBoxOpen(!revisionBoxOpen)}
                  className="gaskeun-btn-secondary min-h-[48px] px-4 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquareWarning size={15} className="text-[#7A5300]" />
                  Request revision
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onApproveItem(selectedItem);
                  onNavigate('published');
                }}
                className="gaskeun-btn-primary px-6 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <Rocket size={17} />
                <span>Approve &amp; Gaskeun!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
