import React, { useState } from 'react';
import {
  Shield,
  Palette,
  MessageSquareQuote,
  Ban,
  Plus,
  X,
  Copy,
  Check,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { GeminiSparkleTile, Instagram, Linkedin } from '../components/SharedUI';

export default function BrandGuidelinesScreen() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [rules, setRules] = useState([
    {
      id: 'rule-typo',
      title: 'Auto-check OCR spelling & CTA typos on posters',
      desc: 'Flags typos on embedded artwork text (e.g., "Aplly" → "Apply") before submission.',
      enabled: true,
    },
    {
      id: 'rule-logo',
      title: 'Enforce 24px minimum logo safe-zone margin',
      desc: 'Verifies the Lumbung Studio mark is unobstructed in top-left or top-right corners.',
      enabled: true,
    },
    {
      id: 'rule-palette',
      title: 'Validate primary brand palette dominance (>70%)',
      desc: 'Checks that Sun #FFE14D, Ink #1F1A2E, Berry #F0307A, or Paper #FFFFFF anchor the layout.',
      enabled: true,
    },
    {
      id: 'rule-hashtags',
      title: 'Limit hashtags to 3–7 per platform caption',
      desc: 'Prevents spammy tag blocks and ensures #LumbungStudio is always included.',
      enabled: true,
    },
    {
      id: 'rule-words',
      title: 'Block restricted & over-hyped urgency phrases',
      desc: 'Flags words from the "Words to avoid" dictionary as Medium Risk.',
      enabled: true,
    },
  ]);

  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([
    'Guaranteed cheapest',
    '100% viral',
    'Rockstar / Ninja',
    'Synergy',
    'DM for secret price',
    'Act now or regret',
    'Unbelievable discount',
  ]);
  const [newWord, setNewWord] = useState('');

  const swatches = [
    {
      name: 'Sun',
      hex: '#FFE14D',
      usage: 'Primary hiring & campaign hero background',
      textColor: '#1F1A2E',
    },
    {
      name: 'Ink',
      hex: '#1F1A2E',
      usage: 'Primary display typography & dark surfaces',
      textColor: '#FFFFFF',
    },
    {
      name: 'Berry',
      hex: '#F0307A',
      usage: 'Call-to-action badges & energetic highlights',
      textColor: '#FFFFFF',
    },
    {
      name: 'Paper',
      hex: '#FFFFFF',
      usage: 'Clean container cards & high-contrast text',
      textColor: '#1F1A2E',
    },
  ];

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const w = newWord.trim();
    if (!w) return;
    if (!wordsToAvoid.includes(w)) {
      setWordsToAvoid([...wordsToAvoid, w]);
    }
    setNewWord('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="gaskeun-h1">Brand guidelines &amp; AI rules</h1>
          <p className="text-sm text-[#52607E] mt-1">
            Lumbung Studio visual identity, platform tone of voice, and automated Brand Guardian rules.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F2F6FF] border border-[#D9E4FF] text-xs font-extrabold text-[#1450E0] self-start">
          <CheckCircle2 size={15} />
          <span>Synced with Gemini Brand Guardian</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Logo Rules + Client Palette Swatches */}
        <div className="lg:col-span-6 space-y-6">
          {/* Logo Rules */}
          <div className="gaskeun-card p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E6EFFF] text-[#1450E0] flex items-center justify-center">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B1F4D]">Logo rules</h2>
                <p className="text-xs text-[#52607E]">
                  Placement, clear space, and contrast requirements
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#1F1A2E] text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-[#FFE14D] text-[#1F1A2E] text-[10px] font-extrabold">
                    LUMBUNG STUDIO
                  </span>
                  <span className="text-[10px] font-bold text-[#BBFB52]">DO ✓</span>
                </div>
                <p className="text-xs font-bold pt-1">Dark &amp; Sun backgrounds</p>
                <p className="text-[11px] text-white/75">
                  Maintain ≥24px outer safe zone on 1080×1350px canvases and ≥4.5:1 contrast.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-[#0B1F4D] text-white text-[10px] font-extrabold">
                    SAFE ZONE: 24PX
                  </span>
                  <span className="text-[10px] font-bold text-[#146C3C]">MIN 120PX</span>
                </div>
                <p className="text-xs font-bold text-[#0B1F4D] pt-1">Corner lockup positions</p>
                <p className="text-[11px] text-[#52607E]">
                  Place primary mark in top-right or top-left corner. Never stretch or add drop shadows.
                </p>
              </div>
            </div>
          </div>

          {/* Client Palette Swatches: Sun #FFE14D, Ink #1F1A2E, Berry #F0307A, Paper #FFFFFF */}
          <div className="gaskeun-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E6EFFF] text-[#1450E0] flex items-center justify-center">
                  <Palette size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#0B1F4D]">
                    Client palette swatches
                  </h2>
                  <p className="text-xs text-[#52607E]">
                    Lumbung Studio official hex tokens (click to copy)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {swatches.map((sw) => (
                <button
                  key={sw.name}
                  type="button"
                  onClick={() => handleCopyHex(sw.hex)}
                  className="p-4 rounded-2xl border border-[#E6ECF5] bg-[#F5F7FC] hover:border-[#1450E0] text-left transition flex flex-col justify-between gap-3 cursor-pointer group"
                >
                  <div
                    style={{ backgroundColor: sw.hex, color: sw.textColor }}
                    className="w-full h-20 rounded-xl border border-[#0B1F4D]/10 p-3 flex items-end justify-between shadow-2xs"
                  >
                    <span className="text-sm font-extrabold">{sw.name}</span>
                    <span className="text-xs font-mono font-bold opacity-90">{sw.hex}</span>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-[11px] text-[#52607E] font-medium pr-2">{sw.usage}</p>
                    <span className="text-xs font-bold text-[#1450E0] shrink-0 inline-flex items-center gap-1">
                      {copiedHex === sw.hex ? <Check size={13} /> : <Copy size={13} />}
                      {copiedHex === sw.hex ? 'Copied' : 'Copy'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Tone of Voice per Platform + Brand Guardian Toggles + Words to Avoid */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tone of Voice per Platform */}
          <div className="gaskeun-card p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E6EFFF] text-[#1450E0] flex items-center justify-center">
                <MessageSquareQuote size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B1F4D]">
                  Tone of voice per platform
                </h2>
                <p className="text-xs text-[#52607E]">
                  How Gemini adapts captions for each social channel
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  platform: 'Instagram',
                  icon: <Instagram size={16} className="text-[#E1306C]" />,
                  tone: 'Energetic, visual-first & studio-friendly',
                  guideline:
                    'Hook in first 90 characters, warm peer-to-peer studio voice, clear bio link CTA, 5–6 curated tags.',
                },
                {
                  platform: 'LinkedIn',
                  icon: <Linkedin size={16} className="text-[#0A66C2]" />,
                  tone: 'Professional, career-focused & structured',
                  guideline:
                    'Lead with design craft or business outcome, structured two-paragraph breakdown, 3–5 industry hashtags.',
                },
                {
                  platform: 'TikTok',
                  icon: <Video size={16} className="text-[#0B1F4D]" />,
                  tone: 'Punchy, behind-the-scenes & conversational',
                  guideline:
                    'Under 300 characters, conversational first-person plural ("we"), fast call-to-action.',
                },
              ].map((item) => (
                <div
                  key={item.platform}
                  className="p-3.5 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                      {item.icon}
                      {item.platform}
                    </span>
                    <span className="text-[11px] font-bold text-[#1450E0] bg-[#E6EFFF] px-2.5 py-0.5 rounded-full">
                      {item.tone}
                    </span>
                  </div>
                  <p className="text-xs text-[#52607E] leading-relaxed">{item.guideline}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Guardian Rule Toggles */}
          <div className="gaskeun-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GeminiSparkleTile size="md" />
                <div>
                  <h2 className="text-base font-extrabold text-[#0B1F4D]">
                    Brand Guardian rule toggles
                  </h2>
                  <p className="text-xs text-[#52607E]">
                    Active pre-checks run automatically on every staff upload
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#1450E0]">
                {rules.filter((r) => r.enabled).length} / {rules.length} active
              </span>
            </div>

            <div className="space-y-2.5">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#0B1F4D]">{r.title}</p>
                    <p className="text-[11px] text-[#52607E] mt-0.5">{r.desc}</p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={r.enabled}
                    onClick={() => toggleRule(r.id)}
                    className={`w-12 h-7 rounded-full p-1 transition cursor-pointer shrink-0 flex items-center ${
                      r.enabled ? 'bg-[#1450E0] justify-end' : 'bg-[#D5DEEE] justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Words to Avoid List */}
          <div className="gaskeun-card p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#991B1B] flex items-center justify-center">
                <Ban size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B1F4D]">Words to avoid</h2>
                <p className="text-xs text-[#52607E]">
                  Phrases automatically flagged during Brand Guardian caption inspection
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {wordsToAvoid.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-bold text-[#991B1B]"
                >
                  {word}
                  <button
                    type="button"
                    onClick={() =>
                      setWordsToAvoid(wordsToAvoid.filter((item) => item !== word))
                    }
                    className="hover:text-[#0B1F4D] cursor-pointer"
                    aria-label={`Remove ${word}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddWord} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Add restricted word or phrase..."
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
              />
              <button
                type="submit"
                className="gaskeun-btn-secondary px-4 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                Add phrase
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
