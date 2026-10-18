import React, { useState } from 'react';
import {
  ActivityLogEntry,
  CalendarPostItem,
  MemberUserItem,
  PlatformDraft,
  PlatformName,
  PublishedPostItem,
  QueueItem,
  Role,
  ScreenId,
  StaffSubmissionItem,
  TeamDesignerItem,
} from './types';
import {
  INITIAL_ACTIVITY_LOG,
  INITIAL_AI_DRAFTS,
  INITIAL_CALENDAR_POSTS,
  INITIAL_PUBLISHED_POSTS,
  INITIAL_QUEUE_ITEMS,
  INITIAL_STAFF_SUBMISSIONS,
  INITIAL_TEAM_DESIGNERS,
  INITIAL_USERS_LIST,
  ROLE_PROFILES,
} from './data/mockData';
import {
  BrandCheckResult,
  CaptionResult,
  UploadedImage,
  checkBrand,
  describeAIError,
  generateCaptions,
  readImageFile,
} from './lib/ai';
import { LayoutShell } from './components/LayoutShell';
import LoginScreen from './screens/LoginScreen';
import StaffUploadScreen from './screens/StaffUploadScreen';
import StaffPlatformsScreen from './screens/StaffPlatformsScreen';
import HeadReviewQueueScreen from './screens/HeadReviewQueueScreen';
import PublishedScreen from './screens/PublishedScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import StaffSubmissionsScreen from './screens/StaffSubmissionsScreen';
import BrandGuidelinesScreen from './screens/BrandGuidelinesScreen';
import HeadCalendarScreen from './screens/HeadCalendarScreen';
import HeadTeamScreen from './screens/HeadTeamScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';
import AdminConnectedScreen from './screens/AdminConnectedScreen';
import AdminActivityLogScreen from './screens/AdminActivityLogScreen';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('Staff');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  // Screen 2 & 3 State (Staff Upload & Platforms)
  const [drafts, setDrafts] = useState<Record<PlatformName, PlatformDraft>>(INITIAL_AI_DRAFTS);
  // Real AI state (Gemini via Firebase AI Logic)
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [draftSource, setDraftSource] = useState<'sample' | 'gemini'>('sample');
  const [detected, setDetected] = useState<CaptionResult['detected'] | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [brandCheck, setBrandCheck] = useState<BrandCheckResult | null>(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [typoFixed, setTypoFixed] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformName[]>([
    'Instagram',
    'LinkedIn',
  ]);

  // Screen 4 & 5 State (Head Review Queue & Published)
  const [queueItems, setQueueItems] = useState<QueueItem[]>(INITIAL_QUEUE_ITEMS);
  const [publishedPosts, setPublishedPosts] =
    useState<PublishedPostItem[]>(INITIAL_PUBLISHED_POSTS);
  const [latestApprovedItem, setLatestApprovedItem] = useState<QueueItem>(
    INITIAL_QUEUE_ITEMS[0]
  );

  // Screen 7 State (Staff My Submissions)
  const [staffSubmissions, setStaffSubmissions] = useState<StaffSubmissionItem[]>(
    INITIAL_STAFF_SUBMISSIONS
  );
  const [activeStaffTab, setActiveStaffTab] = useState<string>('All');

  // Screen 9 State (Head Calendar)
  const [calendarPosts, setCalendarPosts] =
    useState<CalendarPostItem[]>(INITIAL_CALENDAR_POSTS);

  // Screen 10 State (Head Team)
  const [teamDesigners] = useState<TeamDesignerItem[]>(INITIAL_TEAM_DESIGNERS);

  // Screen 11, 12, 13 State (Admin Users, Connected Accounts, Activity Log)
  const [usersList, setUsersList] = useState<MemberUserItem[]>(INITIAL_USERS_LIST);
  const [connectedPlatforms, setConnectedPlatforms] = useState<
    Record<PlatformName, boolean>
  >({
    Instagram: true,
    LinkedIn: true,
    TikTok: false,
  });
  const [activityLogs, setActivityLogs] =
    useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOG);

  const handleSelectRole = (role: Role) => {
    setCurrentRole(role);
    if (currentScreen !== 'login') {
      setCurrentScreen(ROLE_PROFILES[role].homeScreen);
    }
  };

  const handleNavigate = (screen: ScreenId, options?: { staffTab?: string }) => {
    if (options?.staffTab) {
      setActiveStaffTab(options.staffTab);
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignIn = (role: Role, targetScreen: ScreenId) => {
    setCurrentRole(role);
    setCurrentScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateDraft = (platform: PlatformName, updated: Partial<PlatformDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        ...updated,
      },
    }));
  };

  const runGenerateCaptions = async (image: UploadedImage, isRegenerate: boolean) => {
    setCaptionLoading(true);
    setCaptionError(null);
    try {
      const result = await generateCaptions(image, {
        previous: isRegenerate
          ? (['Instagram', 'LinkedIn', 'TikTok'] as PlatformName[]).map((p) => drafts[p].caption)
          : undefined,
      });
      setDetected(result.detected);
      setDrafts((prev) => {
        const next = { ...prev };
        (['Instagram', 'LinkedIn', 'TikTok'] as PlatformName[]).forEach((p) => {
          next[p] = { ...prev[p], ...result.platforms[p], tone: result.platforms[p].tone || prev[p].tone };
        });
        return next;
      });
      setDraftSource('gemini');
      setBrandCheck(null); // captions changed -> previous check is stale
      return true;
    } catch (err) {
      setCaptionError(describeAIError(err));
      return false;
    } finally {
      setCaptionLoading(false);
    }
  };

  const handleSelectFile = async (file: File) => {
    setCaptionError(null);
    try {
      const img = await readImageFile(file);
      setUploadedImage(img);
      setDetected(null);
      setBrandCheck(null);
      await runGenerateCaptions(img, false);
    } catch (err) {
      setCaptionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRegenerateDraft = async () => {
    if (!uploadedImage) {
      setCaptionError('Upload an artwork image first so Gemini can generate captions.');
      return false;
    }
    return runGenerateCaptions(uploadedImage, true);
  };

  const handleRunBrandCheck = async () => {
    setBrandLoading(true);
    setBrandError(null);
    try {
      const captions: Partial<Record<PlatformName, string>> = {};
      (selectedPlatforms.length ? selectedPlatforms : (['Instagram', 'LinkedIn', 'TikTok'] as PlatformName[])).forEach(
        (p) => {
          captions[p] = `${drafts[p].caption}\n${drafts[p].hashtags.join(' ')}`;
        }
      );
      const res = await checkBrand(uploadedImage, captions);
      setBrandCheck(res);
    } catch (err) {
      setBrandError(describeAIError(err));
    } finally {
      setBrandLoading(false);
    }
  };

  const handleTogglePlatform = (plat: PlatformName) => {
    setSelectedPlatforms((prev) =>
      prev.includes(plat) ? prev.filter((p) => p !== plat) : [...prev, plat]
    );
  };

  const handleSubmitForApproval = (note: string, timing: 'immediate' | 'schedule') => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === 'SUB-1042'
          ? {
              ...item,
              status: 'Submitted',
              submittedAt: 'Just now',
              platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['Instagram', 'LinkedIn'],
              captions: {
                Instagram: drafts.Instagram.caption,
                LinkedIn: drafts.LinkedIn.caption,
                TikTok: drafts.TikTok.caption,
              },
              revisionNote: note || undefined,
              ...(uploadedImage
                ? {
                    title: drafts.Instagram.title || item.title,
                    imageUrl: uploadedImage.previewUrl,
                    type: 'Poster' as const,
                  }
                : {}),
              ...(brandCheck
                ? {
                    aiSource: 'gemini' as const,
                    riskScore: brandCheck.riskScore,
                    riskLevel:
                      brandCheck.riskScore < 25
                        ? ('LOW RISK' as const)
                        : brandCheck.riskScore < 60
                          ? ('MEDIUM RISK' as const)
                          : ('HIGH RISK' as const),
                    aiWhatItIs: [detected?.contentType, detected?.summary || brandCheck.summary]
                      .filter(Boolean)
                      .join(' — '),
                    aiChecks: brandCheck.issues.length
                      ? brandCheck.issues.map((i) => `[${i.severity.toUpperCase()}] ${i.text} → ${i.suggestion}`)
                      : ['No brand-rule issues found by Gemini Brand Guardian'],
                    aiIssues: brandCheck.issues,
                    aiRecommendation: `Gemini: ${brandCheck.summary}`,
                  }
                : { aiSource: 'sample' as const }),
            }
          : item
      )
    );

    const newLog: ActivityLogEntry = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      person: 'Rina Putri',
      personRole: 'Staff',
      actionCategory: 'Submitted',
      actionLabel:
        timing === 'schedule'
          ? 'Submitted for scheduled publish'
          : 'Submitted for immediate publish',
      targetTitle: drafts.Instagram.title,
      detail: `Platforms: ${selectedPlatforms.join(', ')}`,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateQueueItemStatus = (
    id: string,
    status: 'Submitted' | 'In review' | 'Revision',
    note?: string
  ) => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, revisionNote: note || item.revisionNote } : item
      )
    );
  };

  const handleApproveItem = (item: QueueItem) => {
    setLatestApprovedItem(item);
    setPublishedPosts((prev) => {
      const exists = prev.some((p) => p.title === item.title);
      if (exists) return prev;
      return [
        {
          id: `PUB-${900 + prev.length + 1}`,
          title: item.title,
          designer: item.designer,
          platforms: item.platforms,
          publishedAt: 'Just now · 14 Oct 2026',
          approvalDuration: '14 min',
          reach: '1,420',
          engagement: '6.8%',
          posterTheme: item.posterTheme,
        },
        ...prev,
      ];
    });
  };

  const handleRejectItem = (id: string) => {
    setQueueItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Revision' } : item))
    );
  };

  const handleApplyCalendarSuggestion = () => {
    setCalendarPosts((prev) =>
      prev.map((p) =>
        p.id === 'CAL-09'
          ? { ...p, dayIndex: 1, time: '19:00', status: 'Scheduled' }
          : p
      )
    );
  };

  const handleChangeUserRole = (id: string, newRole: Role) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  const handleInviteUser = (email: string, role: Role) => {
    const namePart = email
      .split('@')[0]
      .split(/[._-]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
    const initials = namePart
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newUser: MemberUserItem = {
      id: `USR-${usersList.length + 1}`,
      name: namePart || 'New Member',
      email,
      initials: initials || 'NM',
      avatarBg: '#1450E0',
      role,
      status: 'Invite pending',
      lastActive: 'Invited just now',
      submissionsCount: 0,
    };
    setUsersList((prev) => [newUser, ...prev]);
  };

  const handleToggleConnect = (platform: PlatformName) => {
    setConnectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        selectedRole={currentRole}
        onSelectRole={setCurrentRole}
        onSignIn={handleSignIn}
        customLogoUrl={customLogoUrl}
        onUploadLogo={setCustomLogoUrl}
      />
    );
  }

  return (
    <LayoutShell
      currentRole={currentRole}
      currentScreen={currentScreen}
      onSelectRole={handleSelectRole}
      onNavigate={handleNavigate}
      customLogoUrl={customLogoUrl}
      onUploadLogo={setCustomLogoUrl}
      activeStaffTab={activeStaffTab}
    >
      {currentScreen === 'staff-upload' && (
        <StaffUploadScreen
          drafts={drafts}
          onUpdateDraft={handleUpdateDraft}
          onRegenerateDraft={handleRegenerateDraft}
          typoFixed={typoFixed}
          uploadedImage={uploadedImage}
          onSelectFile={handleSelectFile}
          draftSource={draftSource}
          detected={detected}
          captionLoading={captionLoading}
          captionError={captionError}
          onSaveDraft={() => {
            setStaffSubmissions((prev) => [...prev]);
          }}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'staff-platforms' && (
        <StaffPlatformsScreen
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={handleTogglePlatform}
          typoFixed={typoFixed}
          onFixTypo={() => setTypoFixed(true)}
          uploadedImage={uploadedImage}
          brandCheck={brandCheck}
          brandLoading={brandLoading}
          brandError={brandError}
          onRunBrandCheck={handleRunBrandCheck}
          onSubmitForApproval={handleSubmitForApproval}
          onNavigate={handleNavigate}
          onSelectRole={setCurrentRole}
        />
      )}

      {currentScreen === 'head-queue' && (
        <HeadReviewQueueScreen
          items={queueItems}
          onUpdateItemStatus={handleUpdateQueueItemStatus}
          onApproveItem={handleApproveItem}
          onRejectItem={handleRejectItem}
          onNavigate={handleNavigate}
          typoFixed={typoFixed}
        />
      )}

      {currentScreen === 'published' && (
        <PublishedScreen
          publishedPosts={publishedPosts}
          latestApprovedItem={latestApprovedItem}
          typoFixed={typoFixed}
        />
      )}

      {currentScreen === 'admin-dashboard' && (
        <AdminDashboardScreen
          users={usersList}
          activities={activityLogs}
          connectedPlatforms={connectedPlatforms}
          onToggleConnect={handleToggleConnect}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'staff-submissions' && (
        <StaffSubmissionsScreen
          submissions={staffSubmissions}
          initialTab={activeStaffTab}
          onTabChange={setActiveStaffTab}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'brand-guidelines' && <BrandGuidelinesScreen />}

      {currentScreen === 'head-calendar' && (
        <HeadCalendarScreen
          posts={calendarPosts}
          onApplySuggestion={handleApplyCalendarSuggestion}
        />
      )}

      {currentScreen === 'head-team' && (
        <HeadTeamScreen designers={teamDesigners} onNavigate={handleNavigate} />
      )}

      {currentScreen === 'admin-users' && (
        <AdminUsersScreen
          users={usersList}
          onChangeUserRole={handleChangeUserRole}
          onInviteUser={handleInviteUser}
        />
      )}

      {currentScreen === 'admin-connected' && (
        <AdminConnectedScreen
          connectedPlatforms={connectedPlatforms}
          onToggleConnect={handleToggleConnect}
        />
      )}

      {currentScreen === 'admin-activity' && (
        <AdminActivityLogScreen logs={activityLogs} />
      )}
    </LayoutShell>
  );
}
