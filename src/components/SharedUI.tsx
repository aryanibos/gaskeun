import React from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SearchX,
  RotateCcw,
  Check,
  Video,
  ArrowUpRight,
} from 'lucide-react';
import { PlatformName, SubmissionStatus } from '../types';

export const Instagram: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const Linkedin: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface GaskeunLogoProps {
  size?: 34 | 48 | number;
  customLogoUrl?: string | null;
  onUploadLogo?: (url: string) => void;
  allowUploadHint?: boolean;
}

export const GaskeunLogo: React.FC<GaskeunLogoProps> = ({
  size = 34,
  customLogoUrl,
}) => {
  const radius = size === 48 ? 14 : 10;

  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="Gaskeun Logo"
        style={{ width: size, height: size, borderRadius: radius }}
        className="object-cover shrink-0 shadow-sm"
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(135deg, #1450E0 0%, #1A5BFF 52%, #08D9F0 100%)',
      }}
      className="relative flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(8,217,240,0.28)] select-none overflow-hidden"
      aria-label="Gaskeun Logo"
    >
      <svg
        width={size * 0.72}
        height={size * 0.72}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* White "G" with forward arrow */}
        <path
          d="M24.2 10.2C22.4 8.5 19.9 7.5 17.1 7.5C11.4 7.5 6.8 12.1 6.8 17.8C6.8 23.5 11.4 28.1 17.1 28.1C22.2 28.1 26.4 24.5 27.2 19.7H17.5V15.7H29.5L32.2 18.4"
          stroke="#FFFFFF"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27.2 12.6L31.4 16.8L27.2 21"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lime check accent */}
        <circle cx="27.2" cy="9.2" r="6.5" fill="#0B1F4D" />
        <path
          d="M24.3 9.3L26.3 11.3L30.2 7.2"
          stroke="#BBFB52"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const GeminiSparkleTile: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl';
  const iconSize = size === 'sm' ? 15 : 18;
  return (
    <div
      className={`${dim} flex items-center justify-center shrink-0 text-white shadow-[0_2px_8px_rgba(20,80,224,0.25)]`}
      style={{
        background: 'linear-gradient(135deg, #1450E0 0%, #08D9F0 100%)',
      }}
    >
      <Sparkles size={iconSize} strokeWidth={2.2} />
    </div>
  );
};

export const StatusChip: React.FC<{ status: SubmissionStatus | string }> = ({ status }) => {
  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    Submitted: { bg: '#E6EFFF', text: '#0E3AAE', dot: '#1450E0' },
    'In review': { bg: '#EDE7FA', text: '#4C3D7A', dot: '#6D28D9' },
    Revision: { bg: '#FFF4D6', text: '#7A5300', dot: '#D97706' },
    Published: { bg: '#E5F5EC', text: '#146C3C', dot: '#16A34A' },
    Draft: { bg: '#EEF2F9', text: '#0B1F4D', dot: '#52607E' },
    Scheduled: { bg: '#E0F7FA', text: '#006064', dot: '#0891B2' },
    Active: { bg: '#E5F5EC', text: '#146C3C', dot: '#16A34A' },
    'Invite pending': { bg: '#FFF4D6', text: '#7A5300', dot: '#D97706' },
    Deactivated: { bg: '#EEF2F9', text: '#52607E', dot: '#94A3B8' },
  };

  const current = styles[status] || styles.Draft;

  return (
    <span
      style={{ backgroundColor: current.bg, color: current.text }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap"
    >
      <span
        style={{ backgroundColor: current.dot }}
        className="w-1.5 h-1.5 rounded-full shrink-0"
      />
      {status}
    </span>
  );
};

export const PlatformBadge: React.FC<{ platform: PlatformName; compact?: boolean }> = ({
  platform,
  compact = false,
}) => {
  const iconMap = {
    Instagram: <Instagram size={13} className="text-[#E1306C]" />,
    LinkedIn: <Linkedin size={13} className="text-[#0A66C2]" />,
    TikTok: <Video size={13} className="text-[#0B1F4D]" />,
  };

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F7FC] border border-[#E6ECF5] text-xs font-semibold text-[#0B1F4D]">
      {iconMap[platform]}
      {!compact && <span>{platform}</span>}
    </span>
  );
};

interface PaginationBarProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E6ECF5]">
      <p className="text-xs font-medium text-[#52607E]">
        Showing <span className="font-bold text-[#0B1F4D]">{startItem}–{endItem}</span> of{' '}
        <span className="font-bold text-[#0B1F4D]">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="min-h-[44px] px-3 rounded-xl border border-[#D5DEEE] bg-white text-xs font-semibold text-[#0B1F4D] inline-flex items-center gap-1 hover:bg-[#F5F7FC] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronLeft size={15} />
          Prev
        </button>
        {pages.map((page) => {
          const active = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-[44px] min-h-[44px] px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                active
                  ? 'bg-[#1450E0] text-white shadow-[0_2px_8px_rgba(20,80,224,0.28)]'
                  : 'bg-white border border-[#D5DEEE] text-[#0B1F4D] hover:bg-[#F5F7FC]'
              }`}
            >
              {page}
            </button>
          );
        })}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="min-h-[44px] px-3 rounded-xl border border-[#D5DEEE] bg-white text-xs font-semibold text-[#0B1F4D] inline-flex items-center gap-1 hover:bg-[#F5F7FC] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export const EmptyFilterState: React.FC<{
  message?: string;
  onReset: () => void;
}> = ({ message = 'No matching items found for your current search and filters.', onReset }) => {
  return (
    <div className="py-12 px-6 text-center flex flex-col items-center justify-center bg-[#F5F7FC]/60 rounded-2xl border border-dashed border-[#D5DEEE]">
      <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6ECF5] flex items-center justify-center text-[#52607E] mb-3 shadow-xs">
        <SearchX size={22} />
      </div>
      <p className="text-sm font-bold text-[#0B1F4D] mb-1">Nothing matches these filters</p>
      <p className="text-xs text-[#52607E] max-w-sm mb-4">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="gaskeun-btn-secondary px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
      >
        <RotateCcw size={14} />
        Clear search and filters
      </button>
    </div>
  );
};

interface PosterGraphicProps {
  theme?: string;
  typoFixed?: boolean;
  compact?: boolean;
}

export const PosterGraphic: React.FC<PosterGraphicProps> = ({
  theme = 'hiring',
  typoFixed = false,
  compact = false,
}) => {
  if (theme === 'hiring') {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-xl border border-[#1F1A2E]/15 select-none ${
          compact ? 'p-4' : 'p-6'
        }`}
        style={{ backgroundColor: '#FFE14D', color: '#1F1A2E' }}
      >
        {/* Decorative Geometric Grid Accent */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-[#F0307A]/15 pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1F1A2E] text-[#FFE14D] text-[10px] font-extrabold tracking-wider uppercase">
              WE&apos;RE HIRING
            </span>
            <span className="text-[11px] font-extrabold tracking-tight text-[#1F1A2E] bg-white/80 px-2.5 py-1 rounded-md border border-[#1F1A2E]/10">
              LUMBUNG STUDIO
            </span>
          </div>

          <div className="space-y-1.5 py-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#F0307A]">
              Product Design Squad
            </p>
            <h4
              className={`${
                compact ? 'text-xl' : 'text-2xl sm:text-3xl'
              } font-extrabold tracking-tight leading-none text-[#1F1A2E]`}
            >
              UI/UX Designer
            </h4>
            <p className="text-xs font-semibold text-[#1F1A2E]/80 pt-1">
              2+ Years Experience · Hybrid in [CITY]
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="bg-white/85 backdrop-blur-xs rounded-lg p-2 border border-[#1F1A2E]/10">
              <span className="block text-[10px] text-[#52607E] font-semibold">Location</span>
              <span className="font-extrabold text-[#1F1A2E]">[CITY] Studio</span>
            </div>
            <div className="bg-white/85 backdrop-blur-xs rounded-lg p-2 border border-[#1F1A2E]/10">
              <span className="block text-[10px] text-[#52607E] font-semibold">Closing Date</span>
              <span className="font-extrabold text-[#1F1A2E]">[DEADLINE]</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1F1A2E]/15">
            <div className="inline-flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold ${
                  typoFixed
                    ? 'bg-[#1F1A2E] text-white'
                    : 'bg-[#F0307A] text-white ring-2 ring-offset-2 ring-[#F0307A]'
                }`}
              >
                {typoFixed ? 'Apply now' : 'Aplly now'}
                <ArrowUpRight size={14} />
              </span>
              {!typoFixed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#991B1B] border border-[#F0307A]/40">
                  Typo detected
                </span>
              )}
              {typoFixed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5F5EC] text-[#146C3C] inline-flex items-center gap-1">
                  <Check size={11} /> Fixed
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-[#1F1A2E]">lumbung.studio/careers</span>
          </div>
        </div>
      </div>
    );
  }

  const themeConfigs: Record<
    string,
    { bg: string; badge: string; title: string; subtitle: string; accent: string }
  > = {
    product: {
      bg: '#1F1A2E',
      badge: 'DESIGN SYSTEM 3.0',
      title: 'Product launch carousel',
      subtitle: 'Multi-brand tokens & dark mode parity · 6 slides',
      accent: '#08D9F0',
    },
    promo: {
      bg: '#F0307A',
      badge: '11.11 STUDIO DROP',
      title: '11.11 promo teaser',
      subtitle: 'Annual Figma UI Kit & Token Bundle early access',
      accent: '#FFE14D',
    },
    sharing: {
      bg: '#0B1F4D',
      badge: 'FRIDAY SHARING #42',
      title: 'Friday sharing session',
      subtitle: 'Micro-interactions in React with Raka Pratama',
      accent: '#BBFB52',
    },
    outing: {
      bg: '#1450E0',
      badge: 'STUDIO CULTURE',
      title: 'Team outing recap',
      subtitle: '3 days of craft, strategy & coffee in [CITY]',
      accent: '#FFE14D',
    },
    casestudy: {
      bg: '#0E3AAE',
      badge: 'Q3 CASE STUDY',
      title: 'Q3 client case study',
      subtitle: '+38% onboarding activation for fintech partner',
      accent: '#BBFB52',
    },
    batik: {
      bg: '#1F1A2E',
      badge: 'LUMBUNG COMMUNITY',
      title: 'Heritage & Craft Series',
      subtitle: 'Celebrating timeless Indonesian visual systems',
      accent: '#FFE14D',
    },
  };

  const cfg = themeConfigs[theme] || themeConfigs.product;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-white/10 text-white select-none ${
        compact ? 'p-4' : 'p-6'
      }`}
      style={{ backgroundColor: cfg.bg }}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <span
          style={{ backgroundColor: cfg.accent, color: '#0B1F4D' }}
          className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
        >
          {cfg.badge}
        </span>
        <span className="text-[10px] font-bold text-white/80">LUMBUNG STUDIO</span>
      </div>
      <h4 className={`${compact ? 'text-lg' : 'text-2xl'} font-extrabold tracking-tight mb-1.5`}>
        {cfg.title}
      </h4>
      <p className="text-xs text-white/80 mb-4">{cfg.subtitle}</p>
      <div className="flex items-center justify-between pt-3 border-t border-white/15 text-[11px] text-white/75">
        <span>1080 × 1350 px · Verified</span>
        <span className="font-bold text-white">@lumbung.studio</span>
      </div>
    </div>
  );
};
