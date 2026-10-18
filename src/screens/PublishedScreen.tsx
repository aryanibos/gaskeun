import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Share2,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ThumbsUp,
  Repeat,
  Search,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { PlatformName, PublishedPostItem, QueueItem } from '../types';
import {
   EmptyFilterState,
  Instagram,
  Linkedin,
  PaginationBar,
  PlatformBadge,
  PosterGraphic,
  StatusChip,
} from '../components/SharedUI';

interface PublishedScreenProps {
  publishedPosts: PublishedPostItem[];
  latestApprovedItem: QueueItem;
  typoFixed: boolean;
}

export default function PublishedScreen({
  publishedPosts,
  latestApprovedItem,
  typoFixed,
}: PublishedScreenProps) {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | PlatformName>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publishedPosts.filter((post) => {
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.designer.toLowerCase().includes(q) ||
        post.id.toLowerCase().includes(q);
      const matchesPlatform =
        platformFilter === 'All' || post.platforms.includes(platformFilter);
      return matchesSearch && matchesPlatform;
    });
  }, [publishedPosts, search, platformFilter]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setPlatformFilter('All');
    setCurrentPage(1);
  };

  const timelineSteps = [
    {
      label: 'Submitted',
      actor: `${latestApprovedItem.designer} (Staff Designer)`,
      time: '14:08 WIB',
      desc: 'Uploaded poster & generated Gemini captions',
      icon: UploadCloud,
    },
    {
      label: 'AI pre-check',
      actor: 'Gemini Brand Guardian',
      time: '14:12 WIB',
      desc: 'LOW RISK (12/100) · Palette & typo verified',
      icon: Sparkles,
    },
    {
      label: 'Approved',
      actor: 'Bima Santoso (Head Designer)',
      time: '14:21 WIB',
      desc: '1-click approval from Review Queue',
      icon: ShieldCheck,
    },
    {
      label: 'Published',
      actor: 'Gaskeun Auto-Publisher',
      time: '14:22 WIB',
      desc: 'Live on Instagram & LinkedIn APIs',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navy Hero Card: APPROVED · GASKEUN! – Live on Instagram and LinkedIn */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #0B1F4D 0%, #123178 58%, #1450E0 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BBFB52] text-[#0B1F4D] text-xs font-extrabold tracking-wide">
              <CheckCircle2 size={14} />
              <span>APPROVED · GASKEUN! – Live on Instagram and LinkedIn</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {latestApprovedItem.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
              Automatically published to <strong className="text-white">@lumbung.studio</strong>{' '}
              (Instagram) and <strong className="text-white">Lumbung Studio Official</strong>{' '}
              (LinkedIn) with zero manual copy-pasting.
            </p>
          </div>

          {/* Stats: Upload to live 14 min & Platforms 2 */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs px-5 py-3.5 min-w-[160px]">
              <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold">
                <Clock size={14} className="text-[#08D9F0]" />
                <span>Upload to live</span>
              </div>
              <p className="text-2xl font-extrabold text-[#BBFB52] mt-1">14 min</p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs px-5 py-3.5 min-w-[140px]">
              <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold">
                <Share2 size={14} className="text-[#08D9F0]" />
                <span>Platforms</span>
              </div>
              <p className="text-2xl font-extrabold text-white mt-1">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit-Trail Timeline (Submitted -> AI pre-check -> Approved -> Published) */}
      <div className="gaskeun-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#0B1F4D]">Audit-trail timeline</h2>
          <span className="text-xs font-semibold text-[#146C3C] bg-[#E5F5EC] px-2.5 py-1 rounded-full">
            4 / 4 steps verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timelineSteps.map((step, index) => {
            const IconComp = step.icon;
            return (
              <div
                key={step.label}
                className="relative p-4 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1450E0] text-white flex items-center justify-center">
                    <IconComp size={16} />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#146C3C] bg-[#E5F5EC] px-2 py-0.5 rounded-full">
                    Step {index + 1} · {step.time}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#0B1F4D]">{step.label}</p>
                  <p className="text-xs font-bold text-[#1450E0] mt-0.5">{step.actor}</p>
                  <p className="text-[11px] text-[#52607E] mt-1">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Post Previews Styled Like Instagram and LinkedIn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instagram Live Preview */}
        <div className="gaskeun-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6ECF5]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-0.5">
                <div className="w-full h-full rounded-full bg-[#0B1F4D] text-white flex items-center justify-center text-xs font-extrabold">
                  LS
                </div>
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#0B1F4D] flex items-center gap-1.5">
                  lumbung.studio
                  <span className="px-2 py-0.5 rounded-full bg-[#E5F5EC] text-[#146C3C] text-[10px]">
                    Live on Instagram
                  </span>
                </p>
                <p className="text-[11px] text-[#52607E]">[CITY], Indonesia · Feed Post</p>
              </div>
            </div>
            <Instagram size={18} className="text-[#E1306C]" />
          </div>

          <PosterGraphic
            theme={latestApprovedItem.posterTheme}
            typoFixed={latestApprovedItem.posterTheme === 'hiring' ? typoFixed : true}
            compact
          />

          <div className="flex items-center justify-between text-[#0B1F4D] pt-1">
            <div className="flex items-center gap-4">
              <Heart size={19} className="text-[#E1306C] fill-[#E1306C]" />
              <MessageCircle size={19} />
              <Send size={19} />
            </div>
            <Bookmark size={19} />
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-extrabold text-[#0B1F4D]">148 likes · Published 2 mins ago</p>
            <p className="text-[#0B1F4D] leading-relaxed">
              <strong className="mr-1.5">lumbung.studio</strong>
              {latestApprovedItem.captions.Instagram}
            </p>
          </div>
        </div>

        {/* LinkedIn Live Preview */}
        <div className="gaskeun-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6ECF5]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#0B1F4D] text-white flex items-center justify-center text-xs font-extrabold">
                LS
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#0B1F4D] flex items-center gap-1.5">
                  Lumbung Studio Official
                  <span className="px-2 py-0.5 rounded-full bg-[#E5F5EC] text-[#146C3C] text-[10px]">
                    Live on LinkedIn
                  </span>
                </p>
                <p className="text-[11px] text-[#52607E]">14,820 followers · Just now</p>
              </div>
            </div>
            <Linkedin size={18} className="text-[#0A66C2]" />
          </div>

          <p className="text-xs text-[#0B1F4D] leading-relaxed">
            {latestApprovedItem.captions.LinkedIn}
          </p>

          <PosterGraphic
            theme={latestApprovedItem.posterTheme}
            typoFixed={latestApprovedItem.posterTheme === 'hiring' ? typoFixed : true}
            compact
          />

          <div className="flex items-center justify-between pt-2 border-t border-[#E6ECF5] text-xs font-semibold text-[#52607E]">
            <span className="inline-flex items-center gap-1.5 text-[#0A66C2]">
              <ThumbsUp size={15} /> 64 reactions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Repeat size={15} /> 12 reposts
            </span>
            <span className="inline-flex items-center gap-1 text-[#1450E0] font-bold">
              View live post <ExternalLink size={13} />
            </span>
          </div>
        </div>
      </div>

      {/* All Published Posts Table (9 rows, 4 per page) */}
      <div className="gaskeun-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-[#0B1F4D]">All published posts</h2>
            <p className="text-xs text-[#52607E]">
              Complete archive of approved &amp; auto-published studio content
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
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
                placeholder="Search published posts..."
                className="min-h-[44px] pl-9 pr-4 py-2 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
              />
            </div>

            {/* Platform filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Instagram', 'LinkedIn', 'TikTok'] as const).map((plat) => {
                const active = platformFilter === plat;
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => {
                      setPlatformFilter(plat);
                      setCurrentPage(1);
                    }}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
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
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <EmptyFilterState onReset={handleResetFilters} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#E6ECF5] text-[11px] font-extrabold uppercase tracking-wider text-[#52607E]">
                    <th className="py-3 px-3">Post title</th>
                    <th className="py-3 px-3">Designer</th>
                    <th className="py-3 px-3">Platforms</th>
                    <th className="py-3 px-3">Upload to live</th>
                    <th className="py-3 px-3">Published at</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECF5] text-xs">
                  {paginatedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#F5F7FC]/70 transition">
                      <td className="py-3.5 px-3 font-extrabold text-[#0B1F4D]">
                        {post.title}
                        <span className="block text-[11px] font-normal text-[#52607E]">
                          {post.id} · Reach {post.reach}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#0B1F4D]">{post.designer}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {post.platforms.map((p) => (
                            <PlatformBadge key={p} platform={p} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#1450E0]">
                        {post.approvalDuration}
                      </td>
                      <td className="py-3.5 px-3 text-[#52607E] font-medium">
                        {post.publishedAt}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusChip status="Published" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalItems={filteredPosts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
