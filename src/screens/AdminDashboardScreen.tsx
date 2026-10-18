import React, { useState, useMemo } from 'react';
import {
  Search,
  FileStack,
  Clock,
  RotateCcw,
  Send,
  CheckCircle2,
  Video,
  ArrowRight,
  BarChart3,
  Link2,
} from 'lucide-react';
import { ActivityLogEntry, MemberUserItem, PlatformName, ScreenId } from '../types';
import { EmptyFilterState, Instagram, Linkedin, StatusChip } from '../components/SharedUI';

interface AdminDashboardScreenProps {
  users: MemberUserItem[];
  activities: ActivityLogEntry[];
  connectedPlatforms: Record<PlatformName, boolean>;
  onToggleConnect: (platform: PlatformName) => void;
  onNavigate: (screen: ScreenId) => void;
}

export default function AdminDashboardScreen({
  users,
  activities,
  connectedPlatforms,
  onToggleConnect,
  onNavigate,
}: AdminDashboardScreenProps) {
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    const list = users.filter((u) => {
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
    return list.slice(0, 5);
  }, [users, q]);

  const filteredActivities = useMemo(() => {
    const list = activities.filter((act) => {
      if (!q) return true;
      return (
        act.person.toLowerCase().includes(q) ||
        act.actionLabel.toLowerCase().includes(q) ||
        act.targetTitle.toLowerCase().includes(q) ||
        act.detail.toLowerCase().includes(q)
      );
    });
    return list.slice(0, 5);
  }, [activities, q]);

  const kpis = [
    {
      label: 'Submissions',
      value: '24',
      sub: 'This month · Sample data',
      icon: FileStack,
      iconBg: '#E6EFFF',
      iconColor: '#1450E0',
    },
    {
      label: 'Avg. approval time',
      value: '18 min',
      sub: 'Down from 4.2 hrs · Sample data',
      icon: Clock,
      iconBg: '#E5F5EC',
      iconColor: '#146C3C',
    },
    {
      label: 'Revision rate',
      value: '21%',
      sub: 'Pre-checked by AI · Sample data',
      icon: RotateCcw,
      iconBg: '#FFF4D6',
      iconColor: '#7A5300',
    },
    {
      label: 'Published',
      value: '19',
      sub: 'Auto-published live · Sample data',
      icon: Send,
      iconBg: '#EDE7FA',
      iconColor: '#4C3D7A',
    },
  ];

  const pipelineStages = [
    { status: 'Draft', count: 3, pct: 16, bg: '#52607E' },
    { status: 'Submitted', count: 3, pct: 16, bg: '#1450E0' },
    { status: 'In review', count: 2, pct: 12, bg: '#6D28D9' },
    { status: 'Revision', count: 2, pct: 12, bg: '#D97706' },
    { status: 'Published', count: 19, pct: 100, bg: '#146C3C' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Global Filter Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="gaskeun-h1">Workspace admin dashboard</h1>
            <span className="px-2.5 py-1 rounded-full bg-[#EEF2F9] text-[#52607E] text-xs font-extrabold">
              Sample data
            </span>
          </div>
          <p className="text-sm text-[#52607E] mt-1">
            Overview of Lumbung Studio approval velocity, pipeline health, connected channels, and team activity.
          </p>
        </div>

        {/* Live search that filters users and activity sections */}
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52607E]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter users & recent activity..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D5DEEE] bg-white text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] shadow-2xs"
          />
        </div>
      </div>

      {/* 4 KPI Cards with Icons (Sample data label) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const IconComp = kpi.icon;
          return (
            <div key={kpi.label} className="gaskeun-card p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#52607E]">
                    {kpi.label}
                  </p>
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F4D] mt-1.5">{kpi.value}</p>
                <p className="text-[11px] font-semibold text-[#52607E] mt-1">{kpi.sub}</p>
              </div>
              <div
                style={{ backgroundColor: kpi.iconBg, color: kpi.iconColor }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              >
                <IconComp size={21} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Bar Chart by Status + Connected Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Bar Chart by Status */}
        <div className="lg:col-span-7 gaskeun-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[#1450E0]" />
              <h2 className="text-base font-extrabold text-[#0B1F4D]">Pipeline by status</h2>
            </div>
            <span className="text-[11px] font-bold text-[#52607E] bg-[#F5F7FC] px-2.5 py-1 rounded-lg border border-[#E6ECF5]">
              Sample data
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {pipelineStages.map((stage) => (
              <div key={stage.status} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <StatusChip status={stage.status} />
                  <span className="font-extrabold text-[#0B1F4D]">{stage.count} posts</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#EEF2F9] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${stage.pct}%`, backgroundColor: stage.bg }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Accounts (Instagram ✓, LinkedIn ✓, TikTok "Connect") */}
        <div className="lg:col-span-5 gaskeun-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 size={18} className="text-[#1450E0]" />
              <h2 className="text-base font-extrabold text-[#0B1F4D]">Connected accounts</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin-connected')}
              className="text-xs font-bold text-[#1450E0] hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {(
              [
                {
                  name: 'Instagram' as PlatformName,
                  handle: '@lumbung.studio',
                  icon: <Instagram size={18} className="text-[#E1306C]" />,
                },
                {
                  name: 'LinkedIn' as PlatformName,
                  handle: 'Lumbung Studio Official',
                  icon: <Linkedin size={18} className="text-[#0A66C2]" />,
                },
                {
                  name: 'TikTok' as PlatformName,
                  handle: '@lumbungstudio.id',
                  icon: <Video size={18} className="text-[#0B1F4D]" />,
                },
              ] as const
            ).map((acc) => {
              const isConnected = connectedPlatforms[acc.name];
              return (
                <div
                  key={acc.name}
                  className="p-3.5 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E6ECF5] flex items-center justify-center shrink-0">
                      {acc.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[#0B1F4D]">{acc.name}</p>
                      <p className="text-[11px] text-[#52607E] truncate">{acc.handle}</p>
                    </div>
                  </div>

                  {isConnected ? (
                    <button
                      type="button"
                      onClick={() => onToggleConnect(acc.name)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#E5F5EC] text-[#146C3C] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Connected ✓</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleConnect(acc.name)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#1450E0] text-white text-xs font-extrabold hover:bg-[#1044C4] transition cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Users Grid (Top 5 + "View all") */}
      <div className="gaskeun-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#0B1F4D]">Workspace members (Top 5)</h2>
            <p className="text-xs text-[#52607E]">
              Active designers, reviewers, and admins in Lumbung Studio
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin-users')}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F2F6FF] hover:bg-[#E6EFFF] text-xs font-extrabold text-[#1450E0] inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyFilterState
            message="No users match your search query."
            onReset={() => setSearch('')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ backgroundColor: u.avatarBg }}
                    className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-extrabold shrink-0"
                  >
                    {u.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#0B1F4D] truncate">{u.name}</p>
                    <p className="text-[11px] text-[#52607E] truncate">{u.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6ECF5] text-[11px]">
                  <StatusChip status={u.status} />
                  <span className="font-bold text-[#52607E]">{u.submissionsCount} posts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Table (Top 5 + "View all activity") */}
      <div className="gaskeun-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#0B1F4D]">Recent activity (Top 5)</h2>
            <p className="text-xs text-[#52607E]">
              Latest submissions, AI checks, approvals, and workspace updates
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin-activity')}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F2F6FF] hover:bg-[#E6EFFF] text-xs font-extrabold text-[#1450E0] inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>View all activity</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {filteredActivities.length === 0 ? (
          <EmptyFilterState
            message="No recent activity entries match your search query."
            onReset={() => setSearch('')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#E6ECF5] text-[11px] font-extrabold uppercase tracking-wider text-[#52607E]">
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Person</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Content / Target</th>
                  <th className="py-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF5] text-xs">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#F5F7FC]/70 transition">
                    <td className="py-3.5 px-3 text-[#52607E] font-medium whitespace-nowrap">
                      {act.timestamp}
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-[#0B1F4D] whitespace-nowrap">
                      {act.person}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusChip
                        status={
                          act.actionCategory === 'Approved'
                            ? 'Published'
                            : act.actionCategory === 'AI check'
                            ? 'In review'
                            : act.actionCategory
                        }
                      />
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#0B1F4D]">{act.targetTitle}</td>
                    <td className="py-3.5 px-3 text-[#52607E]">{act.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
