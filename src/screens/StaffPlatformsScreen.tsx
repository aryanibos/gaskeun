import React, { useEffect, useState } from 'react';
import {
  Video,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Send,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { BrandCheckResult, UploadedImage, isAIConfigured, GEMINI_MODEL } from '../lib/ai';
import { DEFAULT_BRAND_RULES } from '../config/brandRules';
import { PlatformName, Role, ScreenId } from '../types';
import { GeminiSparkleTile, Instagram, Linkedin, PosterGraphic } from '../components/SharedUI';

interface StaffPlatformsScreenProps {
  selectedPlatforms: PlatformName[];
  onTogglePlatform: (plat: PlatformName) => void;
  typoFixed: boolean;
  onFixTypo: () => void;
  uploadedImage: UploadedImage | null;
  brandCheck: BrandCheckResult | null;
  brandLoading: boolean;
  brandError: string | null;
  onRunBrandCheck: () => void;
  onSubmitForApproval: (note: string, timing: 'immediate' | 'schedule') => void;
  onNavigate: (screen: ScreenId) => void;
  onSelectRole: (role: Role) => void;
}

export default function StaffPlatformsScreen({
  selectedPlatforms,
  onTogglePlatform,
  typoFixed,
  uploadedImage,
  brandCheck,
  brandLoading,
  brandError,
  onRunBrandCheck,
  onSubmitForApproval,
  onNavigate,
  onSelectRole,
}: StaffPlatformsScreenProps) {
  // Auto-run Brand Guardian once when arriving with an uploaded image and no result yet.
  useEffect(() => {
    if (isAIConfigured && uploadedImage && !brandCheck && !brandLoading && !brandError) {
      onRunBrandCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImage]);

  const severityStyle = {
    high: 'bg-[#FDECEC] text-[#991B1B]',
    medium: 'bg-[#FFF4D6] text-[#7A5300]',
    low: 'bg-[#EEF2F9] text-[#0B1F4D]',
  } as const;
  const [timing, setTiming] = useState<'immediate' | 'schedule'>('immediate');
  const [scheduleDate, setScheduleDate] = useState('2026-10-15T19:00');
  const [reviewerNote, setReviewerNote] = useState(
    'Updated the hiring card for our [CITY] UI/UX role. Ready for your review, Mas Bima!'
  );
  const [submittedModal, setSubmittedModal] = useState(false);

  const platformCards: {
    name: PlatformName;
    handle: string;
    format: string;
    icon: React.ReactNode;
    needsVideo?: boolean;
  }[] = [
    {
      name: 'Instagram',
      handle: '@lumbung.studio',
      format: 'Feed Post · 4:5 Portrait',
      icon: <Instagram size={18} className="text-[#E1306C]" />,
    },
    {
      name: 'LinkedIn',
      handle: 'Lumbung Studio Official',
      format: 'Company Page Update',
      icon: <Linkedin size={18} className="text-[#0A66C2]" />,
    },
    {
      name: 'TikTok',
      handle: '@lumbungstudio.id',
      format: '9:16 Vertical Video / Photo Mode',
      icon: <Video size={18} className="text-[#0B1F4D]" />,
      needsVideo: true,
    },
  ];

  const handleSubmit = () => {
    onSubmitForApproval(reviewerNote, timing);
    setSubmittedModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & 3-Step Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="gaskeun-h1">Platforms &amp; Brand Guardian check</h1>
          <p className="text-sm text-[#52607E] mt-1">
            Choose target channels, publishing timing, and resolve any Brand Guardian alerts before sending to Head Designer.
          </p>
        </div>

        {/* 3-Step Stepper */}
        <div className="gaskeun-card px-4 py-2.5 flex items-center gap-2 sm:gap-3 self-start">
          <button
            type="button"
            onClick={() => onNavigate('staff-upload')}
            className="flex items-center gap-2 text-xs font-bold text-[#146C3C] cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#E5F5EC] text-[#146C3C] flex items-center justify-center text-[11px]">
              ✓
            </span>
            <span>Upload &amp; AI draft</span>
          </button>

          <div className="w-5 h-[2px] bg-[#1450E0]" />

          <button
            type="button"
            onClick={() => onNavigate('staff-platforms')}
            className="flex items-center gap-2 text-xs font-extrabold text-[#1450E0] cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#1450E0] text-white flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Platforms &amp; check</span>
          </button>

          <div className="w-5 h-[2px] bg-[#D5DEEE]" />

          <button
            type="button"
            onClick={() => {
              onSelectRole('Head');
              onNavigate('head-queue');
            }}
            className="flex items-center gap-2 text-xs font-semibold text-[#52607E] hover:text-[#0B1F4D] cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#EEF2F9] text-[#52607E] flex items-center justify-center text-[11px] font-bold">
              3
            </span>
            <span>Head approval</span>
          </button>
        </div>
      </div>

      {submittedModal && (
        <div className="gaskeun-card p-5 bg-[#E6EFFF] border-[#1450E0] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1450E0] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0B1F4D]">
                Submitted to Bima Santoso (Head Designer)!
              </p>
              <p className="text-xs text-[#52607E]">
                Your submission is now at the top of the Head Review Queue.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('staff-submissions')}
              className="gaskeun-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
            >
              View My submissions
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectRole('Head');
                onNavigate('head-queue');
              }}
              className="gaskeun-btn-primary px-4 py-2 text-xs font-extrabold cursor-pointer"
            >
              Open Head Review Queue →
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Platforms, Timing, Brand Guardian */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Selectable Platform Cards */}
          <div className="gaskeun-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#0B1F4D]">Select publishing platforms</h2>
                <p className="text-xs text-[#52607E]">
                  Posts will auto-publish to selected accounts once approved by Head Designer
                </p>
              </div>
              <span className="text-xs font-bold text-[#1450E0] bg-[#E6EFFF] px-3 py-1 rounded-full">
                {selectedPlatforms.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {platformCards.map((card) => {
                const isOn = selectedPlatforms.includes(card.name);
                return (
                  <button
                    key={card.name}
                    type="button"
                    onClick={() => onTogglePlatform(card.name)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between min-h-[132px] cursor-pointer ${
                      isOn
                        ? 'bg-[#F2F6FF] border-[#1450E0] ring-2 ring-[#1450E0]/15'
                        : 'bg-white border-[#E6ECF5] hover:border-[#D5DEEE]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E6ECF5] flex items-center justify-center shadow-2xs">
                        {card.icon}
                      </div>
                      {card.needsVideo && !isOn ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#FFF4D6] text-[#7A5300] text-[10px] font-extrabold">
                          Needs video
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isOn
                              ? 'bg-[#1450E0] text-white'
                              : 'bg-[#EEF2F9] text-[#52607E]'
                          }`}
                        >
                          {isOn ? 'ON' : 'OFF'}
                        </span>
                      )}
                    </div>

                    <div className="pt-3">
                      <p className="text-sm font-extrabold text-[#0B1F4D]">{card.name}</p>
                      <p className="text-xs font-semibold text-[#52607E] truncate">{card.handle}</p>
                      <p className="text-[11px] text-[#52607E]/80 mt-0.5">{card.format}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Timing Options */}
          <div className="gaskeun-card p-6 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0B1F4D]">Publishing timing</h2>
              <p className="text-xs text-[#52607E]">
                Choose when Gaskeun should push the post live after Head Designer approval
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setTiming('immediate')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  timing === 'immediate'
                    ? 'bg-[#F2F6FF] border-[#1450E0] ring-2 ring-[#1450E0]/15'
                    : 'bg-white border-[#E6ECF5] hover:border-[#D5DEEE]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E6EFFF] text-[#1450E0] flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  {timing === 'immediate' && <CheckCircle2 size={17} className="text-[#1450E0]" />}
                </div>
                <p className="text-sm font-extrabold text-[#0B1F4D]">Publish right after approval</p>
                <p className="text-xs text-[#52607E] mt-0.5">
                  Instant auto-publish the moment Bima Santoso clicks &ldquo;Approve &amp; Gaskeun!&rdquo;
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTiming('schedule')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  timing === 'schedule'
                    ? 'bg-[#F2F6FF] border-[#1450E0] ring-2 ring-[#1450E0]/15'
                    : 'bg-white border-[#E6ECF5] hover:border-[#D5DEEE]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E6EFFF] text-[#1450E0] flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  {timing === 'schedule' && <CheckCircle2 size={17} className="text-[#1450E0]" />}
                </div>
                <p className="text-sm font-extrabold text-[#0B1F4D]">Schedule for a specific time</p>
                <p className="text-xs text-[#52607E] mt-0.5">
                  Queue the post for a date &amp; time you choose
                </p>
              </button>
            </div>

            {/* Gemini Time Suggestion Banner */}
            <div className="gaskeun-ai-panel p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <GeminiSparkleTile size="sm" />
                <div>
                  <p className="text-xs font-extrabold text-[#0B1F4D]">
                    Suggested time: Thu, 15 Oct 2026 at 19:00 WIB
                  </p>
                  <p className="text-[11px] text-[#52607E]">
                    Static demo suggestion (not AI). Gemini-based scheduling from post analytics is on the roadmap.
                  </p>
                </div>
              </div>
              {timing === 'schedule' && (
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#D5DEEE] bg-white text-xs font-bold text-[#0B1F4D]"
                />
              )}
            </div>
          </div>

          {/* 3. Brand Guardian (real Gemini check) */}
          <div className="gaskeun-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <GeminiSparkleTile size="md" />
                <div>
                  <h2 className="text-base font-extrabold text-[#0B1F4D]">Brand Guardian check</h2>
                  <p className="text-xs text-[#52607E]">
                    Gemini ({GEMINI_MODEL}) checks artwork + captions against {DEFAULT_BRAND_RULES.brandName} brand rules
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {brandCheck && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      brandCheck.riskScore < 25
                        ? 'bg-[#E5F5EC] text-[#146C3C]'
                        : brandCheck.riskScore < 60
                          ? 'bg-[#FFF4D6] text-[#7A5300]'
                          : 'bg-[#FDECEC] text-[#991B1B]'
                    }`}
                  >
                    Risk {brandCheck.riskScore}/100 · {brandCheck.issues.length} issue
                    {brandCheck.issues.length === 1 ? '' : 's'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onRunBrandCheck}
                  disabled={!isAIConfigured || brandLoading}
                  className="gaskeun-btn-secondary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {brandLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {brandCheck ? 'Re-check' : 'Run check'}
                </button>
              </div>
            </div>

            {!isAIConfigured && (
              <div className="p-4 rounded-xl bg-[#FFF4D6]/60 border border-[#D97706]/35 flex items-start gap-3 text-xs text-[#7A5300] font-semibold">
                <AlertTriangle size={17} className="shrink-0" />
                AI not configured — Brand Guardian is unavailable. Add the Firebase config to .env (see README).
              </div>
            )}
            {isAIConfigured && !uploadedImage && !brandCheck && !brandLoading && (
              <div className="p-4 rounded-xl bg-[#F5F7FC] border border-[#E6ECF5] text-xs text-[#52607E]">
                No artwork uploaded — upload an image in step 1 for a full visual check, or run the check on captions only.
              </div>
            )}
            {brandLoading && (
              <div className="p-4 rounded-xl bg-[#F2F6FF] border border-[#D9E4FF] flex items-center gap-2 text-xs font-bold text-[#1450E0]">
                <Loader2 size={15} className="animate-spin" />
                Gemini Brand Guardian is reviewing your artwork and captions…
              </div>
            )}
            {brandError && (
              <div className="p-4 rounded-xl bg-[#FDECEC] border border-[#991B1B]/25 flex items-start gap-2 text-xs font-semibold text-[#991B1B]">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                {brandError}
              </div>
            )}

            {brandCheck && !brandLoading && (
              <div className="space-y-2.5">
                <p className="text-xs text-[#0B1F4D] font-semibold bg-[#F2F6FF] border border-[#D9E4FF] rounded-xl p-3.5">
                  {brandCheck.summary}
                </p>
                {brandCheck.issues.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-[#E5F5EC] border border-[#146C3C]/20 flex items-center gap-3 text-xs font-bold text-[#146C3C]">
                    <CheckCircle2 size={18} /> No brand-rule issues found.
                  </div>
                ) : (
                  brandCheck.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border bg-[#FFF4D6]/30 border-[#D97706]/25 flex items-start gap-3"
                    >
                      <AlertTriangle size={18} className="text-[#7A5300] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${severityStyle[issue.severity]}`}
                          >
                            {issue.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#EEF2F9] text-[#52607E] text-[10px] font-extrabold uppercase">
                            {issue.type.replace('_', ' ')}
                          </span>
                          <p className="text-xs font-extrabold text-[#0B1F4D]">{issue.text}</p>
                        </div>
                        <p className="text-xs text-[#52607E] mt-1">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <p className="text-[11px] text-[#52607E]">
                  Checked {new Date(brandCheck.checkedAt).toLocaleTimeString()} by {brandCheck.model}. Edit captions in
                  step 1 and re-check if needed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Columns: Summary Sidebar */}
        <div className="lg:col-span-4 gaskeun-card p-6 space-y-5 sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0B1F4D]">Submission summary</h2>
            <span className="text-[11px] font-bold text-[#146C3C] bg-[#E5F5EC] px-2.5 py-0.5 rounded-full">
              {brandCheck ? 'Checked' : 'Ready'}
            </span>
          </div>

          {/* Thumbnail */}
          {uploadedImage ? (
            <img
              src={uploadedImage.previewUrl}
              alt={uploadedImage.name}
              className="w-full max-h-64 object-contain rounded-xl border border-[#E6ECF5] bg-[#F5F7FC]"
            />
          ) : (
            <PosterGraphic theme="hiring" typoFixed={typoFixed} compact />
          )}

          {/* Live-updated Selected Platforms */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#52607E]">
              Selected platforms ({selectedPlatforms.length})
            </span>
            {selectedPlatforms.length === 0 ? (
              <p className="text-xs text-[#991B1B] font-semibold">
                Please select at least one platform
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedPlatforms.map((plat) => (
                  <span
                    key={plat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6EFFF] text-[#0E3AAE] text-xs font-extrabold"
                  >
                    <CheckCircle2 size={13} />
                    {plat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reviewer */}
          <div className="p-3.5 rounded-xl bg-[#F5F7FC] border border-[#E6ECF5] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0B1F4D] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
              BS
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#52607E]">
                Reviewer
              </span>
              <p className="text-xs font-extrabold text-[#0B1F4D] truncate">
                Bima Santoso · Head Designer
              </p>
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0B1F4D]">
              Optional note for reviewer
            </label>
            <textarea
              rows={3}
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              placeholder="Add context or questions for Bima..."
              className="w-full p-3 rounded-xl border border-[#D5DEEE] bg-white text-xs text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              disabled={selectedPlatforms.length === 0}
              onClick={handleSubmit}
              className="gaskeun-btn-primary w-full px-5 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Send size={16} />
              <span>Submit for approval</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('staff-upload')}
              className="gaskeun-btn-secondary w-full px-4 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back to AI draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
