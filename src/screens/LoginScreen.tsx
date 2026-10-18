import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Send,
  UploadCloud,
  Lock,
  Mail,
  ImagePlus,
} from 'lucide-react';
import { Role, ScreenId } from '../types';
import { ROLE_PROFILES } from '../data/mockData';
import { GaskeunLogo } from '../components/SharedUI';
import { isAIConfigured } from '../lib/ai';

interface LoginScreenProps {
  selectedRole: Role;
  onSelectRole: (role: Role) => void;
  onSignIn: (role: Role, targetScreen: ScreenId) => void;
  customLogoUrl: string | null;
  onUploadLogo: (url: string) => void;
}

export default function LoginScreen({
  selectedRole,
  onSelectRole,
  onSignIn,
  customLogoUrl,
  onUploadLogo,
}: LoginScreenProps) {
  const [email, setEmail] = useState(ROLE_PROFILES[selectedRole].email);
  const [password, setPassword] = useState('••••••••••••••••');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleRolePick = (role: Role) => {
    onSelectRole(role);
    setEmail(ROLE_PROFILES[role].email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(selectedRole, ROLE_PROFILES[selectedRole].homeScreen);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUploadLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    {
      num: '01',
      title: 'Upload & Gemini AI Draft',
      desc: 'Staff Designer uploads a poster or photo. Gemini drafts platform captions & hashtags while Brand Guardian pre-checks typos, logo, and colors.',
      icon: UploadCloud,
    },
    {
      num: '02',
      title: '1-Click Head Designer Review',
      desc: 'Head Designer gets an executive AI summary with a visual risk score to Approve, Request revision with a note, or Reject.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Auto-Publish Across Channels',
      desc: 'Approved posts go live automatically or on schedule to Instagram, LinkedIn, and TikTok—with a complete audit log.',
      icon: Send,
    },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F5F7FC]">
      {/* Left Navy Gradient Panel */}
      <div
        className="lg:col-span-6 xl:col-span-6 p-8 sm:p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(155deg, #0B1F4D 0%, #0F2B6B 55%, #1450E0 100%)',
        }}
      >
        {/* Subtle ambient glow */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, #08D9F0 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, #BBFB52 0%, transparent 70%)' }}
        />

        <div className="relative z-10 space-y-8">
          {/* Logo (48px) + Workspace tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <GaskeunLogo size={48} customLogoUrl={customLogoUrl} />
              <div>
                <span className="text-2xl font-extrabold tracking-tight block leading-none">
                  Gaskeun
                </span>
                <span className="text-xs font-semibold text-[#08D9F0]">
                  Lumbung Studio Workspace
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white/85 inline-flex items-center gap-1.5 transition cursor-pointer"
              title="Upload custom logo image"
            >
              <ImagePlus size={14} className="text-[#BBFB52]" />
              <span>Upload Logo</span>
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              className="hidden"
            />
          </div>

          {/* Pill: AI approval & publishing workspace */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xs">
            <Sparkles size={14} className="text-[#BBFB52]" />
            <span className="text-xs font-bold tracking-wide text-white">
              AI approval &amp; publishing workspace
            </span>
          </div>

          {/* Hero H1: Approve. / Gaskeun. (second line lime) */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]">
              <span className="block text-white">Approve.</span>
              <span className="block text-[#BBFB52]">Gaskeun.</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed font-medium">
              Stop losing hours chasing design approvals in WhatsApp threads, rewriting captions per
              channel, and manually posting. Built for high-velocity in-house design teams.
            </p>
          </div>

          {/* 3 Numbered Steps in Translucent Cards */}
          <div className="space-y-3 pt-2">
            {steps.map((step) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.num}
                  className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-4 flex items-start gap-4 hover:bg-white/15 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0B1F4D]/80 border border-[#08D9F0]/40 flex items-center justify-center text-xs font-extrabold text-[#BBFB52] shrink-0">
                    {step.num}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <IconComp size={15} className="text-[#08D9F0]" />
                      <h3 className="text-sm font-extrabold text-white">{step.title}</h3>
                    </div>
                    <p className="text-xs text-white/75 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/65 border-t border-white/15 mt-8">
          <span>Customer workspace: Lumbung Studio</span>
          <span className="inline-flex items-center gap-1.5 text-[#BBFB52] font-semibold">
            <CheckCircle2 size={14} />{' '}
            {isAIConfigured ? 'Gemini 2.5 Flash Brand Guardian enabled' : 'AI not configured (demo mode)'}
          </span>
        </div>
      </div>

      {/* Right Sign-In Card */}
      <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center p-6 sm:p-12">
        <div className="gaskeun-card w-full max-w-[480px] p-6 sm:p-9 space-y-6">
          <div className="space-y-1.5">
            <h2 className="gaskeun-h1">Sign in to Gaskeun</h2>
            <p className="text-xs sm:text-sm text-[#52607E] font-medium">
              Workspace: <span className="font-bold text-[#0B1F4D]">Lumbung Studio</span> · Design
              team approval hub
            </p>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => onSignIn(selectedRole, ROLE_PROFILES[selectedRole].homeScreen)}
            className="w-full min-h-[48px] px-4 rounded-xl border border-[#D5DEEE] bg-white hover:bg-[#F5F7FC] text-sm font-bold text-[#0B1F4D] flex items-center justify-center gap-3 transition cursor-pointer shadow-2xs"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E6ECF5] w-full" />
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#52607E]">
              or with email
            </span>
            <div className="border-t border-[#E6ECF5] w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0B1F4D]">Work email</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52607E]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/50 text-sm font-medium text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#0B1F4D]">Password</label>
                <span className="text-xs font-semibold text-[#1450E0] cursor-pointer hover:underline">
                  SSO enabled
                </span>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52607E]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/50 text-sm font-medium text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Demo: sign in as (3 selectable role cards: Staff / Head / Admin) */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#52607E]">
                  Demo: sign in as
                </span>
                <span className="text-[11px] font-semibold text-[#1450E0]">
                  Pick a role to preview
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(['Staff', 'Head', 'Admin'] as Role[]).map((role) => {
                  const prof = ROLE_PROFILES[role];
                  const isSelected = selectedRole === role;
                  const roleDesc: Record<Role, string> = {
                    Staff: 'Upload & AI draft',
                    Head: 'Review & approve',
                    Admin: 'Manage & audit',
                  };
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRolePick(role)}
                      className={`min-h-[88px] p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2F6FF] border-[#1450E0] ring-2 ring-[#1450E0]/15'
                          : 'bg-white border-[#E6ECF5] hover:border-[#D5DEEE] hover:bg-[#F5F7FC]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-[#1450E0] text-white'
                              : 'bg-[#EEF2F9] text-[#0B1F4D]'
                          }`}
                        >
                          {role}
                        </span>
                        {isSelected && <CheckCircle2 size={15} className="text-[#1450E0]" />}
                      </div>
                      <div className="pt-2">
                        <p className="text-xs font-bold text-[#0B1F4D] truncate">{prof.name}</p>
                        <p className="text-[11px] text-[#52607E] truncate">{roleDesc[role]}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main CTA Button: "Sign in as {role}" */}
            <button
              type="submit"
              className="gaskeun-btn-primary w-full px-6 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign in as {selectedRole}</span>
              <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
