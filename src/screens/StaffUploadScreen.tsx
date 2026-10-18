import React, { useRef, useState } from 'react';
import {
  RefreshCw,
  Plus,
  X,
  ArrowRight,
  Save,
  Upload,
  CheckCircle2,
  FileImage,
  Video,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { CaptionResult, UploadedImage, isAIConfigured, GEMINI_MODEL } from '../lib/ai';
import { PlatformDraft, PlatformName, ScreenId } from '../types';
import { GeminiSparkleTile, Instagram, Linkedin, PosterGraphic } from '../components/SharedUI';

interface StaffUploadScreenProps {
  drafts: Record<PlatformName, PlatformDraft>;
  onUpdateDraft: (platform: PlatformName, updated: Partial<PlatformDraft>) => void;
  onRegenerateDraft: () => Promise<boolean>;
  typoFixed: boolean;
  uploadedImage: UploadedImage | null;
  onSelectFile: (file: File) => void;
  draftSource: 'sample' | 'gemini';
  detected: CaptionResult['detected'] | null;
  captionLoading: boolean;
  captionError: string | null;
  onSaveDraft: () => void;
  onNavigate: (screen: ScreenId) => void;
}

const formatBytes = (n: number) =>
  n > 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

export default function StaffUploadScreen({
  drafts,
  onUpdateDraft,
  onRegenerateDraft,
  typoFixed,
  onSaveDraft,
  onNavigate,
  uploadedImage,
  onSelectFile,
  draftSource,
  detected,
  captionLoading,
  captionError,
}: StaffUploadScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePlatform, setActivePlatform] = useState<PlatformName>('Instagram');
  const [newHashtag, setNewHashtag] = useState('');
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const isRegenerating = captionLoading;

  const currentDraft = drafts[activePlatform];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleReplaceFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelectFile(file);
    e.target.value = '';
  };

  const handleRegenerate = async () => {
    const ok = await onRegenerateDraft();
    if (ok) triggerToast('Gemini regenerated captions for Instagram, LinkedIn & TikTok');
  };

  const handleAddHashtag = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = newHashtag.trim();
    if (!raw) return;
    const formatted = raw.startsWith('#') ? raw : `#${raw.replace(/\s+/g, '')}`;
    if (!currentDraft.hashtags.includes(formatted)) {
      onUpdateDraft(activePlatform, {
        hashtags: [...currentDraft.hashtags, formatted],
      });
    }
    setNewHashtag('');
    setShowAddTagInput(false);
  };

  const handleRemoveHashtag = (tag: string) => {
    onUpdateDraft(activePlatform, {
      hashtags: currentDraft.hashtags.filter((t) => t !== tag),
    });
  };

  const handleSaveDraftClick = () => {
    onSaveDraft();
    triggerToast('Saved to Drafts');
  };

  return (
    <div className="space-y-6">
      {/* Header & 3-Step Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="gaskeun-h1">New content submission</h1>
          <p className="text-sm text-[#52607E] mt-1">
            Upload your artwork—Gemini drafts platform captions and pre-checks Lumbung Studio brand rules.
          </p>
        </div>

        {/* 3-Step Stepper: Upload & AI draft -> Platforms & check -> Head approval */}
        <div className="gaskeun-card px-4 py-2.5 flex items-center gap-2 sm:gap-3 self-start">
          <button
            type="button"
            onClick={() => onNavigate('staff-upload')}
            className="flex items-center gap-2 text-xs font-extrabold text-[#1450E0] cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#1450E0] text-white flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Upload &amp; AI draft</span>
          </button>

          <div className="w-5 h-[2px] bg-[#D5DEEE]" />

          <button
            type="button"
            onClick={() => onNavigate('staff-platforms')}
            className="flex items-center gap-2 text-xs font-semibold text-[#52607E] hover:text-[#0B1F4D] cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#EEF2F9] text-[#52607E] flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>Platforms &amp; check</span>
          </button>

          <div className="w-5 h-[2px] bg-[#D5DEEE]" />

          <button
            type="button"
            onClick={() => onNavigate('head-queue')}
            className="flex items-center gap-2 text-xs font-semibold text-[#52607E] hover:text-[#0B1F4D] cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#EEF2F9] text-[#52607E] flex items-center justify-center text-[11px] font-bold">
              3
            </span>
            <span>Head approval</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="rounded-xl bg-[#E5F5EC] border border-[#146C3C]/20 px-4 py-3 flex items-center justify-between text-xs font-bold text-[#146C3C]">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            {toastMsg}
          </span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-[#146C3C] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Poster Preview + File Info + Gemini Detected */}
        <div className="lg:col-span-5 gaskeun-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0B1F4D]">Artwork preview</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EEF2F9] text-[#0B1F4D]">
              Poster · 4:5
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploadedImage ? (
            <div className="rounded-2xl overflow-hidden border border-[#E6ECF5] bg-[#F5F7FC] flex items-center justify-center">
              <img
                src={uploadedImage.previewUrl}
                alt={uploadedImage.name}
                className="w-full max-h-[520px] object-contain"
              />
            </div>
          ) : (
            <div className="relative">
              {/* Sample poster shown until the user uploads real artwork */}
              <PosterGraphic theme="hiring" typoFixed={typoFixed} />
              <button
                type="button"
                onClick={handleReplaceFile}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0B1F4D]/55 text-white rounded-2xl cursor-pointer hover:bg-[#0B1F4D]/65 transition"
              >
                <Upload size={26} />
                <span className="text-sm font-extrabold">Upload your artwork</span>
                <span className="text-[11px] font-semibold opacity-90">
                  PNG, JPG or WEBP · sample poster shown
                </span>
              </button>
            </div>
          )}

          {/* File info + Replace button */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F5F7FC] border border-[#E6ECF5]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#D5DEEE] flex items-center justify-center text-[#1450E0] shrink-0">
                <FileImage size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0B1F4D] truncate">
                  {uploadedImage ? uploadedImage.name : 'No file uploaded yet'}
                </p>
                <p className="text-[11px] text-[#52607E]">
                  {uploadedImage
                    ? `${formatBytes(uploadedImage.size)}${
                        uploadedImage.width ? ` · ${uploadedImage.width} × ${uploadedImage.height} px` : ''
                      }`
                    : 'Sample artwork preview'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReplaceFile}
              className="gaskeun-btn-secondary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Upload size={13} />
              {uploadedImage ? 'Replace' : 'Upload'}
            </button>
          </div>

          {/* AI Panel: what Gemini detected in the uploaded artwork */}
          <div className="gaskeun-ai-panel p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <GeminiSparkleTile size="sm" />
              <div>
                <p className="text-xs font-extrabold text-[#0B1F4D]">
                  {!isAIConfigured
                    ? 'AI not configured'
                    : captionLoading
                      ? 'Gemini is analysing your artwork…'
                      : detected
                        ? `Gemini detected: ${detected.contentType}`
                        : 'Upload artwork for Gemini analysis'}
                </p>
                <p className="text-[11px] text-[#52607E]">
                  {!isAIConfigured
                    ? 'Set the VITE_FIREBASE_* env vars (see .env.example) to enable Gemini.'
                    : detected
                      ? detected.summary
                      : `Uses ${GEMINI_MODEL} via Firebase AI Logic`}
                </p>
              </div>
            </div>

            {detected && detected.keyFields.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {detected.keyFields.map((f) => (
                  <div key={f.label} className="bg-white rounded-xl p-2.5 border border-[#D9E4FF]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#52607E]">
                      {f.label}
                    </span>
                    <span className="text-xs font-extrabold text-[#0B1F4D]">{f.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Card: AI-drafted post */}
        <div className="lg:col-span-7 gaskeun-card p-6 space-y-5">
          {/* Card Header + Regenerate Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <GeminiSparkleTile size="md" />
              <div>
                <h2 className="text-base font-extrabold text-[#0B1F4D]">AI-drafted post</h2>
                <p className="text-xs text-[#52607E]">
                  {draftSource === 'gemini'
                    ? `Generated by Gemini (${GEMINI_MODEL}) using Lumbung Studio voice rules`
                    : 'Sample draft (not AI-generated) — upload artwork to generate with Gemini'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={captionLoading || !isAIConfigured || !uploadedImage}
              title={
                !isAIConfigured
                  ? 'AI not configured'
                  : !uploadedImage
                    ? 'Upload artwork first'
                    : 'Ask Gemini for a new variation'
              }
              className="disabled:opacity-40 gaskeun-btn-secondary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} className={isRegenerating ? 'animate-spin text-[#1450E0]' : ''} />
              Regenerate
            </button>
          </div>

          {!isAIConfigured && (
            <div className="rounded-xl bg-[#FFF4D6] border border-[#D97706]/35 px-4 py-3 flex items-start gap-2 text-xs font-semibold text-[#7A5300]">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>
                AI not configured. Captions below are sample text, not Gemini output. Add your Firebase
                config to <code>.env</code> (see README) to enable real Gemini generation.
              </span>
            </div>
          )}
          {captionLoading && (
            <div className="rounded-xl bg-[#F2F6FF] border border-[#D9E4FF] px-4 py-3 flex items-center gap-2 text-xs font-bold text-[#1450E0]">
              <Loader2 size={15} className="animate-spin" />
              Gemini is writing captions for Instagram, LinkedIn &amp; TikTok…
            </div>
          )}
          {captionError && (
            <div className="rounded-xl bg-[#FDECEC] border border-[#991B1B]/25 px-4 py-3 flex items-start gap-2 text-xs font-semibold text-[#991B1B]">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{captionError}</span>
            </div>
          )}

          {/* Segmented Tabs: Instagram / LinkedIn / TikTok */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5]">
            {(['Instagram', 'LinkedIn', 'TikTok'] as PlatformName[]).map((plat) => {
              const active = activePlatform === plat;
              const icons = {
                Instagram: <Instagram size={15} />,
                LinkedIn: <Linkedin size={15} />,
                TikTok: <Video size={15} />,
              };
              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setActivePlatform(plat)}
                  className={`min-h-[44px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                    active
                      ? 'bg-white text-[#1450E0] shadow-xs border border-[#E6ECF5]'
                      : 'text-[#52607E] hover:text-[#0B1F4D]'
                  }`}
                >
                  {icons[plat]}
                  <span>{plat}</span>
                </button>
              );
            })}
          </div>

          {/* Platform Tone Indicator */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F2F6FF] border border-[#D9E4FF] text-xs">
            <span className="font-semibold text-[#52607E] flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#1450E0]" />
              Platform tone ({activePlatform}):
            </span>
            <span className="font-extrabold text-[#0B1F4D]">{currentDraft.tone}</span>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0B1F4D]">Post title</label>
            <input
              type="text"
              value={currentDraft.title}
              onChange={(e) => onUpdateDraft(activePlatform, { title: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D5DEEE] bg-white text-sm font-bold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] transition"
            />
          </div>

          {/* Caption Textarea with Character Count */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#0B1F4D]">
                {activePlatform} caption
              </label>
              <span className="text-xs font-semibold text-[#52607E]">
                <strong className="text-[#0B1F4D]">{currentDraft.caption.length}</strong> /{' '}
                {currentDraft.maxChars} chars
              </span>
            </div>
            <textarea
              rows={5}
              value={currentDraft.caption}
              onChange={(e) => onUpdateDraft(activePlatform, { caption: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-[#D5DEEE] bg-white text-sm leading-relaxed text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] transition"
            />
          </div>

          {/* Hashtag Chips + Add */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#0B1F4D]">
                Recommended hashtags ({currentDraft.hashtags.length})
              </label>
              <span className="text-[11px] text-[#52607E]">Click tag to remove</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentDraft.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2F9] text-xs font-bold text-[#0B1F4D] border border-[#D5DEEE]"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="text-[#52607E] hover:text-[#0B1F4D] cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}

              {showAddTagInput ? (
                <form onSubmit={handleAddHashtag} className="inline-flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="#NewHashtag"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    autoFocus
                    className="h-9 px-3 rounded-xl border border-[#1450E0] text-xs font-semibold text-[#0B1F4D] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-9 px-3 rounded-xl bg-[#1450E0] text-white text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTagInput(false)}
                    className="h-9 px-2 rounded-xl text-xs text-[#52607E] cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddTagInput(true)}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl border border-dashed border-[#1450E0] bg-[#F2F6FF] text-xs font-bold text-[#1450E0] inline-flex items-center gap-1 hover:bg-[#E6EFFF] transition cursor-pointer"
                >
                  <Plus size={13} />
                  Add
                </button>
              )}
            </div>
          </div>

          {/* Footer Buttons: Save draft / Continue to platforms */}
          <div className="pt-4 border-t border-[#E6ECF5] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSaveDraftClick}
              className="gaskeun-btn-secondary px-5 text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} />
              Save draft
            </button>

            <button
              type="button"
              onClick={() => onNavigate('staff-platforms')}
              className="gaskeun-btn-primary px-6 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to platforms</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
