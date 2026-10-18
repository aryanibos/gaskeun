import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Minus,
  Shield,
} from 'lucide-react';
import { MemberUserItem, Role } from '../types';
import { EmptyFilterState, PaginationBar, StatusChip } from '../components/SharedUI';

interface AdminUsersScreenProps {
  users: MemberUserItem[];
  onChangeUserRole: (id: string, newRole: Role) => void;
  onInviteUser: (email: string, role: Role) => void;
}

export default function AdminUsersScreen({
  users,
  onChangeUserRole,
  onInviteUser,
}: AdminUsersScreenProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Staff');
  const [inviteSentMsg, setInviteSentMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | Role>('All');
  const [statusFilter, setStatusFilter] = useState<
    'All statuses' | 'Active' | 'Invite pending' | 'Deactivated'
  >('All statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const roleCounts = useMemo(() => {
    return {
      All: users.length,
      Staff: users.filter((u) => u.role === 'Staff').length,
      Head: users.filter((u) => u.role === 'Head').length,
      Admin: users.filter((u) => u.role === 'Admin').length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All statuses' || u.status === statusFilter;
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, roleFilter, statusFilter, search]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onInviteUser(inviteEmail.trim(), inviteRole);
    setInviteSentMsg(`Invitation sent to ${inviteEmail.trim()} as ${inviteRole}`);
    setInviteEmail('');
    setTimeout(() => setInviteSentMsg(null), 3500);
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('All');
    setStatusFilter('All statuses');
    setCurrentPage(1);
  };

  const permissions = [
    {
      capability: 'Upload artwork & generate Gemini captions',
      Staff: true,
      Head: true,
      Admin: true,
    },
    {
      capability: 'Run Brand Guardian pre-check & fix typos',
      Staff: true,
      Head: true,
      Admin: true,
    },
    {
      capability: 'Approve, request revision, or reject submissions',
      Staff: false,
      Head: true,
      Admin: true,
    },
    {
      capability: 'Trigger instant or scheduled auto-publish to social APIs',
      Staff: false,
      Head: true,
      Admin: true,
    },
    {
      capability: 'Edit Brand Guardian rules, palette tokens & banned words',
      Staff: false,
      Head: false,
      Admin: true,
    },
    {
      capability: 'Manage workspace members, roles, OAuth tokens & CSV logs',
      Staff: false,
      Head: false,
      Admin: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="gaskeun-h1">Users &amp; roles</h1>
        <p className="text-sm text-[#52607E] mt-1">
          Manage Lumbung Studio workspace members, assign approval permissions, and invite new designers.
        </p>
      </div>

      {/* Invite Member Panel (email + role) */}
      <div className="gaskeun-card p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E6EFFF] text-[#1450E0] flex items-center justify-center">
            <UserPlus size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0B1F4D]">Invite member</h2>
            <p className="text-xs text-[#52607E]">
              Send a workspace invite link with pre-assigned role permissions
            </p>
          </div>
        </div>

        <form
          onSubmit={handleInviteSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
        >
          <div className="sm:col-span-6">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@lumbung.studio"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
            />
          </div>
          <div className="sm:col-span-3">
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              aria-label="Select role for invitee"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-[#D5DEEE] bg-white text-xs font-bold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
            >
              <option value="Staff">Staff (Designer)</option>
              <option value="Head">Head (Reviewer)</option>
              <option value="Admin">Admin (Workspace)</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="gaskeun-btn-primary w-full px-5 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Send invite</span>
            </button>
          </div>
        </form>

        {inviteSentMsg && (
          <div className="rounded-xl bg-[#E5F5EC] text-[#146C3C] px-4 py-2.5 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{inviteSentMsg}</span>
          </div>
        )}
      </div>

      {/* 12-Member Table with Role Select per Row, 6 per Page */}
      <div className="gaskeun-card p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#E6ECF5]">
          {/* Role Chips */}
          <div className="flex flex-wrap gap-1.5">
            {(['All', 'Staff', 'Head', 'Admin'] as const).map((r) => {
              const active = roleFilter === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRoleFilter(r);
                    setCurrentPage(1);
                  }}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
                    active
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-[#F5F7FC] text-[#52607E] hover:text-[#0B1F4D] border border-[#E6ECF5]'
                  }`}
                >
                  <span>{r}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-[#BBFB52] text-[#0B1F4D]' : 'bg-white text-[#0B1F4D]'
                    }`}
                  >
                    {roleCounts[r]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + Status Dropdown */}
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
                placeholder="Search name or email..."
                className="min-h-[42px] pl-9 pr-4 py-2 rounded-xl border border-[#D5DEEE] bg-[#F5F7FC]/60 text-xs font-semibold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0] focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value as 'All statuses' | 'Active' | 'Invite pending' | 'Deactivated'
                );
                setCurrentPage(1);
              }}
              aria-label="Filter members by status"
              className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#D5DEEE] bg-white text-xs font-bold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
            >
              <option value="All statuses">All statuses</option>
              <option value="Active">Active</option>
              <option value="Invite pending">Invite pending</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyFilterState onReset={handleResetFilters} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#E6ECF5] text-[11px] font-extrabold uppercase tracking-wider text-[#52607E]">
                    <th className="py-3 px-3">Member</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Submissions</th>
                    <th className="py-3 px-3">Last active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECF5] text-xs">
                  {paginatedUsers.map((member) => (
                    <tr key={member.id} className="hover:bg-[#F5F7FC]/70 transition">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            style={{ backgroundColor: member.avatarBg }}
                            className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-extrabold shrink-0"
                          >
                            {member.initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#0B1F4D]">{member.name}</p>
                            <p className="text-[11px] text-[#52607E]">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            onChangeUserRole(member.id, e.target.value as Role)
                          }
                          aria-label={`Role for ${member.name}`}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#D5DEEE] bg-white text-xs font-extrabold text-[#0B1F4D] focus:outline-none focus:border-[#1450E0]"
                        >
                          <option value="Staff">Staff</option>
                          <option value="Head">Head</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusChip status={member.status} />
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#0B1F4D]">
                        {member.submissionsCount}
                      </td>
                      <td className="py-3.5 px-3 text-[#52607E] font-medium">
                        {member.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Permission Matrix (Staff / Head / Admin) */}
      <div className="gaskeun-card p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E6EFFF] text-[#1450E0] flex items-center justify-center">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0B1F4D]">
              Role permission matrix
            </h2>
            <p className="text-xs text-[#52607E]">
              Access control levels across Staff, Head Designer, and Workspace Admin roles
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-[#E6ECF5] text-[11px] font-extrabold uppercase tracking-wider text-[#52607E]">
                <th className="py-3 px-3">Workspace capability</th>
                <th className="py-3 px-3 text-center">Staff</th>
                <th className="py-3 px-3 text-center">Head</th>
                <th className="py-3 px-3 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF5] text-xs">
              {permissions.map((perm) => (
                <tr key={perm.capability} className="hover:bg-[#F5F7FC]/60">
                  <td className="py-3 px-3 font-bold text-[#0B1F4D]">{perm.capability}</td>
                  {(['Staff', 'Head', 'Admin'] as const).map((r) => (
                    <td key={r} className="py-3 px-3 text-center">
                      {perm[r] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E5F5EC] text-[#146C3C]">
                          <CheckCircle2 size={14} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EEF2F9] text-[#52607E]">
                          <Minus size={14} />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
