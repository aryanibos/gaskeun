import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FolderKanban,
  FileEdit,
  BookOpen,
  CheckSquare,
  Send,
  Calendar,
  Users,
  LayoutDashboard,
  UserCog,
  Link2,
  Activity,
  Bell,
  LogOut,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Layers,
  ImagePlus,
} from 'lucide-react';
import { Role, ScreenId } from '../types';
import { ROLE_PROFILES } from '../data/mockData';
import { GaskeunLogo } from './SharedUI';

interface NavItem {
  id: string;
  label: string;
  screen: ScreenId;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  subAction?: () => void;
}

interface LayoutShellProps {
  currentRole: Role;
  currentScreen: ScreenId;
  onSelectRole: (role: Role) => void;
  onNavigate: (screen: ScreenId, options?: { staffTab?: string }) => void;
  customLogoUrl: string | null;
  onUploadLogo: (url: string) => void;
  activeStaffTab?: string;
  children: React.ReactNode;
}

const SCREEN_BREADCRUMBS: Record<ScreenId, { section: string; page: string }> = {
  login: { section: 'Auth', page: 'Sign in' },
  'staff-upload': { section: 'Staff', page: 'Upload & AI draft' },
  'staff-platforms': { section: 'Staff', page: 'Platforms & check' },
  'staff-submissions': { section: 'Staff', page: 'My submissions' },
  'head-queue': { section: 'Head', page: 'Review queue' },
  published: { section: 'Head', page: 'Published' },
  'head-calendar': { section: 'Head', page: 'Content calendar' },
  'head-team': { section: 'Head', page: 'Team' },
  'admin-dashboard': { section: 'Admin', page: 'Dashboard' },
  'admin-users': { section: 'Admin', page: 'Users & roles' },
  'admin-connected': { section: 'Admin', page: 'Connected accounts' },
  'admin-activity': { section: 'Admin', page: 'Activity log' },
  'brand-guidelines': { section: 'Workspace', page: 'Brand guidelines' },
};

export const ALL_SCREENS_LIST: { id: ScreenId; num: number; label: string; role: Role }[] = [
  { id: 'login', num: 1, label: '1. Login & role picker', role: 'Staff' },
  { id: 'staff-upload', num: 2, label: '2. Staff – Upload & AI draft', role: 'Staff' },
  { id: 'staff-platforms', num: 3, label: '3. Staff – Platforms & check', role: 'Staff' },
  { id: 'head-queue', num: 4, label: '4. Head – Review queue', role: 'Head' },
  { id: 'published', num: 5, label: '5. Published', role: 'Head' },
  { id: 'admin-dashboard', num: 6, label: '6. Admin – Dashboard', role: 'Admin' },
  { id: 'staff-submissions', num: 7, label: '7. Staff – My submissions', role: 'Staff' },
  { id: 'brand-guidelines', num: 8, label: '8. Brand guidelines', role: 'Staff' },
  { id: 'head-calendar', num: 9, label: '9. Head – Content calendar', role: 'Head' },
  { id: 'head-team', num: 10, label: '10. Head – Team', role: 'Head' },
  { id: 'admin-users', num: 11, label: '11. Admin – Users & roles', role: 'Admin' },
  { id: 'admin-connected', num: 12, label: '12. Admin – Connected accounts', role: 'Admin' },
  { id: 'admin-activity', num: 13, label: '13. Admin – Activity log', role: 'Admin' },
];

export const LayoutShell: React.FC<LayoutShellProps> = ({
  currentRole,
  currentScreen,
  onSelectRole,
  onNavigate,
  customLogoUrl,
  onUploadLogo,
  activeStaffTab,
  children,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [jumperOpen, setJumperOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const profile = ROLE_PROFILES[currentRole];
  const crumb = SCREEN_BREADCRUMBS[currentScreen] || {
    section: currentRole,
    page: 'Workspace',
  };

  const roleMenus: Record<Role, NavItem[]> = {
    Staff: [
      {
        id: 'new-sub',
        label: 'New submission',
        screen: 'staff-upload',
        icon: UploadCloud,
      },
      {
        id: 'my-sub',
        label: 'My submissions',
        screen: 'staff-submissions',
        icon: FolderKanban,
        badge: 12,
        subAction: () => onNavigate('staff-submissions', { staffTab: 'All' }),
      },
      {
        id: 'drafts',
        label: 'Drafts',
        screen: 'staff-submissions',
        icon: FileEdit,
        badge: 3,
        subAction: () => onNavigate('staff-submissions', { staffTab: 'Drafts' }),
      },
      {
        id: 'brand',
        label: 'Brand guidelines',
        screen: 'brand-guidelines',
        icon: BookOpen,
      },
    ],
    Head: [
      {
        id: 'queue',
        label: 'Review queue',
        screen: 'head-queue',
        icon: CheckSquare,
        badge: 5,
      },
      {
        id: 'published',
        label: 'Published',
        screen: 'published',
        icon: Send,
      },
      {
        id: 'calendar',
        label: 'Content calendar',
        screen: 'head-calendar',
        icon: Calendar,
      },
      {
        id: 'team',
        label: 'Team',
        screen: 'head-team',
        icon: Users,
      },
    ],
    Admin: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        screen: 'admin-dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'users',
        label: 'Users & roles',
        screen: 'admin-users',
        icon: UserCog,
      },
      {
        id: 'connected',
        label: 'Connected accounts',
        screen: 'admin-connected',
        icon: Link2,
      },
      {
        id: 'brand',
        label: 'Brand guidelines',
        screen: 'brand-guidelines',
        icon: BookOpen,
      },
      {
        id: 'activity',
        label: 'Activity log',
        screen: 'admin-activity',
        icon: Activity,
      },
    ],
  };

  const navItems = roleMenus[currentRole];

  const isNavItemActive = (item: NavItem) => {
    if (item.id === 'new-sub') {
      return currentScreen === 'staff-upload' || currentScreen === 'staff-platforms';
    }
    if (item.id === 'drafts') {
      return currentScreen === 'staff-submissions' && activeStaffTab === 'Drafts';
    }
    if (item.id === 'my-sub') {
      return currentScreen === 'staff-submissions' && activeStaffTab !== 'Drafts';
    }
    return currentScreen === item.screen;
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F7FC] text-[#0B1F4D]">
      {/* Left Sidebar: 248px on desktop, stacked on mobile */}
      <aside className="w-full lg:w-[248px] shrink-0 bg-[#0B1F4D] text-white flex flex-col justify-between p-4 lg:min-h-screen select-none">
        <div className="space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div
              onClick={() => onNavigate(profile.homeScreen)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <GaskeunLogo size={34} customLogoUrl={customLogoUrl} />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block leading-none">
                  Gaskeun
                </span>
                <span className="text-[10px] font-semibold text-[#08D9F0] tracking-wide">
                  Approve. Gaskeun.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              title="Upload custom logo image"
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ImagePlus size={15} />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              className="hidden"
            />
          </div>

          {/* Workspace Card */}
          <div className="rounded-xl bg-[#132C68] border border-white/10 px-3.5 py-2.5">
            <p className="text-xs font-bold text-white leading-snug">Lumbung Studio</p>
            <p className="text-[11px] font-medium text-white/70">Design team workspace</p>
          </div>

          {/* Role Switcher inside Sidebar for rapid exploration */}
          <div className="px-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5 px-1">
              ACTIVE ROLE VIEW
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#071536] border border-white/10">
              {(['Staff', 'Head', 'Admin'] as Role[]).map((r) => {
                const active = currentRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onSelectRole(r)}
                    className={`min-h-[34px] rounded-lg text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-[#1450E0] text-white shadow-xs'
                        : 'text-white/65 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MENU Label & Nav Items */}
          <div className="space-y-1">
            <div className="px-2.5 pb-1 text-[11px] font-extrabold tracking-wider text-white/50 uppercase">
              MENU
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isNavItemActive(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.subAction) {
                        item.subAction();
                      } else {
                        onNavigate(item.screen);
                      }
                    }}
                    className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center justify-between text-left text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-[#17357A] text-white shadow-xs border border-white/10'
                        : 'text-white/75 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <IconComponent
                        size={17}
                        className={active ? 'text-[#BBFB52] shrink-0' : 'text-white/65 shrink-0'}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {typeof item.badge === 'number' && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                          active
                            ? 'bg-[#BBFB52] text-[#0B1F4D]'
                            : 'bg-white/15 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Gemini Card + User Card */}
        <div className="space-y-3 pt-6">
          {/* Gemini is on card */}
          <div className="rounded-xl bg-gradient-to-br from-[#132C68] to-[#0F2456] border border-[#08D9F0]/30 p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #1450E0 0%, #08D9F0 100%)' }}
              >
                <Sparkles size={13} />
              </div>
              <span className="text-xs font-extrabold text-white">Gemini is on</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-[#BBFB52]" />
            </div>
            <p className="text-[11px] leading-relaxed text-white/80">
              Gemini is on – drafts captions, checks your brand rules and summarizes every submission
            </p>
          </div>

          {/* User Card with Sign-out link to Login */}
          <div className="rounded-xl bg-[#071638] border border-white/10 p-3">
            <div className="flex items-center gap-2.5">
              <div
                style={{ background: profile.avatarBg }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
              >
                {profile.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{profile.name}</p>
                <p className="text-[11px] text-white/65 truncate">{profile.roleLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="mt-2.5 w-full min-h-[38px] px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E6ECF5] px-4 sm:px-10 py-3.5 sticky top-0 z-30">
          <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-[#52607E]">
                { currentScreen === 'brand-guidelines' ? currentRole : crumb.section }
              </span>
              <span className="text-[#52607E]">/</span>
              <span className="font-extrabold text-[#0B1F4D]">{crumb.page}</span>
            </div>

            {/* Right Top Bar Controls */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Screen Jumper for fast testing of all 13 screens */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setJumperOpen(!jumperOpen)}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#F5F7FC] hover:bg-[#E6EFFF] border border-[#D5DEEE] text-xs font-bold text-[#0B1F4D] inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Layers size={14} className="text-[#1450E0]" />
                  <span className="hidden md:inline">All 13 screens</span>
                  <ChevronRight
                    size={13}
                    className={`transition-transform ${jumperOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {jumperOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#E6ECF5] shadow-xl p-2 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#52607E] border-b border-[#E6ECF5] mb-1">
                      Jump to Screen (1–13)
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-0.5">
                      {ALL_SCREENS_LIST.map((scr) => {
                        const isCurrent = currentScreen === scr.id;
                        return (
                          <button
                            key={scr.id}
                            type="button"
                            onClick={() => {
                              setJumperOpen(false);
                              if (scr.id !== 'login' && scr.id !== 'brand-guidelines') {
                                onSelectRole(scr.role);
                              }
                              onNavigate(scr.id);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                              isCurrent
                                ? 'bg-[#E6EFFF] text-[#0E3AAE] font-bold'
                                : 'text-[#0B1F4D] hover:bg-[#F5F7FC]'
                            }`}
                          >
                            <span>{scr.label}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F7FC] text-[#52607E]">
                              {scr.role}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Green Pill: Instagram & LinkedIn connected */}
              <button
                type="button"
                onClick={() => {
                  onSelectRole('Admin');
                  onNavigate('admin-connected');
                }}
                className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-[#E5F5EC] text-[#146C3C] border border-[#146C3C]/15 text-xs font-bold inline-flex items-center gap-2 hover:bg-[#d4f0e0] transition cursor-pointer"
              >
                <CheckCircle2 size={14} className="text-[#146C3C] shrink-0" />
                <span>Instagram &amp; LinkedIn connected</span>
              </button>

              {/* Notification Bell with a Dot */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                  className="w-[44px] h-[44px] rounded-xl border border-[#E6ECF5] bg-white hover:bg-[#F5F7FC] flex items-center justify-center text-[#0B1F4D] relative transition cursor-pointer"
                >
                  <Bell size={18} />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#1450E0] ring-2 ring-white" />
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#E6ECF5] shadow-xl p-3 z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E6ECF5]">
                      <span className="text-xs font-extrabold text-[#0B1F4D]">Notifications</span>
                      <span className="text-[11px] font-bold text-[#1450E0]">3 unread</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div
                        onClick={() => {
                          setNotifOpen(false);
                          onSelectRole('Head');
                          onNavigate('head-queue');
                        }}
                        className="p-2.5 rounded-xl bg-[#F2F6FF] hover:bg-[#E6EFFF] cursor-pointer transition"
                      >
                        <p className="font-bold text-[#0B1F4D]">
                          Rina Putri submitted &ldquo;We&apos;re hiring: UI/UX Designer&rdquo;
                        </p>
                        <p className="text-[11px] text-[#52607E] mt-0.5">
                          Gemini pre-check: LOW RISK · 10 mins ago
                        </p>
                      </div>
                      <div
                        onClick={() => {
                          setNotifOpen(false);
                          onSelectRole('Staff');
                          onNavigate('staff-submissions');
                        }}
                        className="p-2.5 rounded-xl bg-[#FFF4D6]/60 hover:bg-[#FFF4D6] cursor-pointer transition"
                      >
                        <p className="font-bold text-[#7A5300]">
                          Revision requested on &ldquo;11.11 promo teaser&rdquo;
                        </p>
                        <p className="text-[11px] text-[#52607E] mt-0.5">
                          Note from Bima Santoso · 1 hour ago
                        </p>
                      </div>
                      <div
                        onClick={() => {
                          setNotifOpen(false);
                          onSelectRole('Head');
                          onNavigate('published');
                        }}
                        className="p-2.5 rounded-xl hover:bg-[#F5F7FC] cursor-pointer transition"
                      >
                        <p className="font-bold text-[#0B1F4D]">
                          &ldquo;National Batik Day greeting&rdquo; published live
                        </p>
                        <p className="text-[11px] text-[#52607E] mt-0.5">
                          Instagram, LinkedIn &amp; TikTok · 12 Oct 2026
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div
                style={{ background: profile.avatarBg }}
                title={`${profile.name} (${profile.roleLabel})`}
                className="w-[44px] h-[44px] rounded-xl flex items-center justify-center text-xs font-extrabold text-white shadow-xs shrink-0"
              >
                {profile.initials}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Container: max-width 1280px, padding 32px 40px */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-6 sm:px-[40px] sm:py-[32px]">
          {children}
        </main>
      </div>
    </div>
  );
};
