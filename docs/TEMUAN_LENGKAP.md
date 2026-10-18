# Daftar Temuan Lengkap (terverifikasi)

Dibuat otomatis dari analisis multi-agen pada 2026-10-18 (6 pembaca area + 6 verifikator adversarial). Temuan yang **dibantah** verifikator sudah dibuang. Kolom *Status*: confirmed = dicek ulang di kode; partially-true = nyata tapi deskripsi/severity dikoreksi. Isi teknis dibiarkan dalam bahasa Inggris agar file:line dan kutipan kode tetap presisi.

Severity: **P0** build rusak/crash · **P1** bug fungsional · **P2** inkonsistensi/UX · **P3** cleanup.

Nomor baris adalah posisi saat analisis; selalu cari ulang dengan Grep sebelum mengedit.

Total: **187** temuan.

## Shell & state (App, LayoutShell, types) (37)

### [P1] shell-save-draft-noop
- **Lokasi:** `src/App.tsx:294-296`
- **Status:** confirmed
- **Masalah:** onSaveDraft is a stub that tells the user it worked. It only copies the array, while StaffUploadScreen shows a 'Saved to Drafts' toast, so no draft ever appears in My submissions or Drafts. setStaffSubmissions is never used meaningfully anywhere else.
- **Saran perbaikan:** Add a handleSaveDraft in App that prepends (or updates by a stable id such as 'MY-DRAFT-1') a StaffSubmissionItem {status:'Draft', title: drafts.Instagram.title, type:'Poster', platforms: selectedPlatforms, updatedAt:'Just now', reviewer:'—'}.

### [P1] shell-approve-leaves-item-in-queue
- **Lokasi:** `src/App.tsx:188-208`
- **Status:** confirmed
- **Masalah:** An approved item stays in the review queue with its old status. QueueItem.status has no 'Approved' or 'Published' value, so the queue cannot show approval, and the item can be approved again.
- **Saran perbaikan:** Remove the item from queueItems on approve (setQueueItems(prev => prev.filter(i => i.id !== item.id))), or widen the status union and filter it out in HeadReviewQueueScreen. Also add an 'Approved' ActivityLogEntry.

### [P1] shell-approve-dedupe-by-title
- **Lokasi:** `src/App.tsx:191-192`
- **Status:** confirmed
- **Masalah:** The duplicate check compares titles, and seed data reuses titles. Approving SUB-1040 '11.11 promo teaser' adds nothing because PUB-894 has the same title, yet latestApprovedItem still changes, so the Published screen shows a success banner for a post missing from the list.
- **Saran perbaikan:** Compare a source id instead: add `sourceQueueId?: string` to PublishedPostItem and check `p.sourceQueueId === item.id`.

### [P2] shell-submit-not-in-staff-submissions
- **Lokasi:** `src/App.tsx:140-174`
- **Status:** partially-true
- **Masalah:** Submitting for approval only edits the hard-coded queue item SUB-1042 and the activity log. The Staff 'My submissions' list (staffSubmissions) never shows the new submission, so the Staff and Head views fall out of sync.
- **Saran perbaikan:** In handleSubmitForApproval, also upsert a StaffSubmissionItem with status 'Submitted' and reviewer 'Bima Santoso'. Consider a constant CURRENT_SUBMISSION_ID = 'SUB-1042' shared with HeadReviewQueueScreen.
- **Koreksi verifikator:** There is indeed no setStaffSubmissions call in handleSubmitForApproval. The claim that 'My submissions' never shows the submission is wrong, though: seed row MY-201 "We're hiring: UI/UX Designer" (mockData.ts:428-435, status 'In review', reviewer Bima Santoso) already represents this flow. What is real is that the row is never updated (updatedAt, platforms and title stay as seeded, and the status does not reflect a new submission or later Head actions). That is a sync inconsistency, not a missing item.

### [P2] shell-submit-platform-mismatch
- **Lokasi:** `src/App.tsx:148,171`
- **Status:** confirmed
- **Masalah:** When no platform is selected, the queue item falls back to ['Instagram','LinkedIn'], but the log detail uses the empty selectedPlatforms and reads 'Platforms: '. Captions are also always written for all three platforms, whatever was selected.
- **Saran perbaikan:** Compute `const platforms = selectedPlatforms.length ? selectedPlatforms : ['Instagram','LinkedIn']` once and use it in both places. Better, block submit when nothing is selected.

### [P2] shell-submit-captions-drop-hashtags
- **Lokasi:** `src/App.tsx:149-153`
- **Status:** confirmed
- **Masalah:** Captions sent to the queue leave out the draft hashtags. The initial mock captions (mockData.ts:143-146) include hashtags inline, so a submitted item looks different from the seed data.
- **Saran perbaikan:** Use `${d.caption} ${d.hashtags.join(' ')}`, or add a hashtags field to QueueItem.

### [P2] shell-reject-equals-revision
- **Lokasi:** `src/App.tsx:210-214`
- **Status:** confirmed
- **Masalah:** Reject gives the same result as Request revision: status 'Revision', with no note and nothing removed. The UI banner says 'Rejected submission'.
- **Saran perbaikan:** Remove the item from queueItems, or add a 'Rejected' status, and log an ActivityLogEntry.

### [P2] shell-activity-log-only-on-submit
- **Lokasi:** `src/App.tsx:160-173`
- **Status:** confirmed
- **Masalah:** Only submit writes to activityLogs. Approve, reject, revision, invite, role change, connect toggle and calendar apply leave no trace in the Admin activity log or dashboard, even though the product claims a complete audit log (LoginScreen.tsx:75).
- **Saran perbaikan:** Add a helper `logActivity(entry: Omit<ActivityLogEntry,'id'|'timestamp'>)` that prepends `{id:`ACT-${Date.now()}`, timestamp:'Just now', ...entry}`, and call it in each handler.

### [P2] shell-latest-approved-default
- **Lokasi:** `src/App.tsx:64-66`
- **Status:** confirmed
- **Masalah:** latestApprovedItem starts as INITIAL_QUEUE_ITEMS[0] (SUB-1042, still 'Submitted'). Opening Published from the sidebar, jumper or notification shows that item as just approved before anything has been approved.
- **Saran perbaikan:** Type it as QueueItem | null with initial null, and have PublishedScreen hide the 'just approved' banner when it is null (this needs a PublishedScreen prop type change).

### [P2] shell-staff-upload-head-link-no-role
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:134-136`
- **Status:** confirmed
- **Masalah:** StaffUpload step 3 goes to 'head-queue' without switching role, so the Head screen appears with the Staff sidebar menu, no active nav item and the Staff profile. StaffPlatformsScreen does the same jump correctly by calling onSelectRole('Head') first. StaffUploadScreen has no onSelectRole prop.
- **Saran perbaikan:** Add an onSelectRole prop to StaffUploadScreen (wire setCurrentRole in App.tsx:289-298) and call it before navigating, or make step 3 non-clickable.

### [P2] shell-logout-no-reset
- **Lokasi:** `src/components/LayoutShell.tsx:374-381`
- **Status:** confirmed
- **Masalah:** Sign out is just navigation to 'login'. Every piece of App state (drafts, typoFixed, queue changes, activeStaffTab, role) survives, so signing in as another role still shows the previous session's data. No handleSignOut exists.
- **Saran perbaikan:** Add handleSignOut in App that resets state to its initial values (or remounts by bumping a key) and pass it to LayoutShell as an onSignOut prop.

### [P2] shell-hardcoded-badges
- **Lokasi:** `src/components/LayoutShell.tsx:112,120,136`
- **Status:** confirmed
- **Masalah:** Nav badge counts are fixed literals. They match the seed data at load (12 submissions, 3 drafts, 5 Submitted + In review) but drift once state changes. LayoutShell receives none of the data needed to compute them.
- **Saran perbaikan:** Pass a counts prop from App, e.g. {mySubmissions: staffSubmissions.length, drafts: staffSubmissions.filter(s=>s.status==='Draft').length, queue: queueItems.filter(i=>i.status!=='Revision').length}.

### [P2] shell-connected-pill-static
- **Lokasi:** `src/components/LayoutShell.tsx:455-465`
- **Status:** confirmed
- **Masalah:** The topbar pill always reads 'Instagram & LinkedIn connected' and is always green. It ignores App.connectedPlatforms, so it is wrong once an admin disconnects Instagram or connects TikTok.
- **Saran perbaikan:** Add a connectedPlatforms: Record<PlatformName, boolean> prop. Build the label from the platforms that are true, and use amber styling when none are.

### [P2] shell-a11y-clickable-divs
- **Lokasi:** `src/components/LayoutShell.tsx:226,486,501,516`
- **Status:** confirmed
- **Masalah:** The brand area and the notification rows are <div onClick> with no role, tabIndex or key handler, so keyboard and screen-reader users cannot reach them.
- **Saran perbaikan:** Change them to <button type="button"> with the same classes plus `w-full text-left`.

### [P2] shell-a11y-dropdowns
- **Lokasi:** `src/components/LayoutShell.tsx:404-418,469-480`
- **Status:** confirmed
- **Masalah:** The jumper and notification dropdowns have no aria-expanded or aria-haspopup, no outside-click or Escape close, and both can be open at once. Below md the jumper button is icon-only with no aria-label, and the logo-upload button relies on title instead of aria-label.
- **Saran perbaikan:** Add aria-expanded={jumperOpen} and aria-label. Close one dropdown when the other opens. Add a document mousedown/keydown listener in a useEffect to close on outside click or Escape.

### [P2] shell-mock-designer-mismatch
- **Lokasi:** `src/data/mockData.ts:179-180,403-404,438`
- **Status:** confirmed
- **Masalah:** '11.11 promo teaser' has three owners and states. The queue says Sari Wulandari in 'Revision'. Published (PUB-894) says Rina Putri, published 01 Oct. Rina's own submissions list it as Revision. The shell notification (LayoutShell.tsx:510-513) tells Staff (Rina) a revision was requested on it.
- **Saran perbaikan:** Pick one designer and one state, align queue, published, staff submissions and calendar, and rename the already-published entry (e.g. '11.11 promo teaser v1').

### [P2] shell-mobile-sidebar
- **Lokasi:** `src/components/LayoutShell.tsx:222`
- **Status:** confirmed
- **Masalah:** Below lg the sidebar becomes a full-width block above the content with no collapse or drawer. On phones the user scrolls past the logo, workspace card, role switcher, nav, Gemini card and user card before reaching any content.
- **Saran perbaikan:** Add a mobileNavOpen state with a hamburger button in the header (lg:hidden), and hide the aside below lg unless it is open.

### [P2] shell-staff-note-stored-as-revision-note
- **Lokasi:** `src/App.tsx:154`
- **Status:** found-by-verifier
- **Masalah:** The Staff reviewer note typed in StaffPlatformsScreen (onSubmitForApproval(reviewerNote, timing)) is written into QueueItem.revisionNote, which is meant for the Head's revision feedback. HeadReviewQueueScreen never renders item.revisionNote (it only uses its local revisionNoteInput), so the Head never sees the Staff note, and Head revision notes on queue items are never shown either.
- **Saran perbaikan:** Add a `staffNote?: string` field to QueueItem, set it on submit, and render it in the HeadReviewQueueScreen detail panel. Keep revisionNote for Head feedback only.

### [P3] shell-approve-hardcoded-metrics
- **Lokasi:** `src/App.tsx:195-202`
- **Status:** confirmed
- **Masalah:** New published posts get fixed fake metrics and date, and the id depends on array length.
- **Saran perbaikan:** Move these into a named constant (e.g. NEW_PUBLISH_DEFAULTS in mockData.ts) and use `PUB-${Date.now()}` for ids.

### [P3] shell-revision-note-cannot-clear
- **Lokasi:** `src/App.tsx:183`
- **Status:** partially-true
- **Masalah:** `note || item.revisionNote` means an existing note can never be cleared or replaced with an empty value, and moving status back to 'In review' keeps the stale note.
- **Saran perbaikan:** Use `revisionNote: note !== undefined ? note : item.revisionNote`, and clear it when the status is not 'Revision'.
- **Koreksi verifikator:** The `note || item.revisionNote` pattern is real, but the only caller (HeadReviewQueueScreen.tsx:116) always passes a non-empty note with status 'Revision'. No UI path sets 'In review' or clears a note, so the stale-note scenario cannot currently be reached. Also, HeadReviewQueueScreen never renders item.revisionNote at all. It is a latent issue only.

### [P3] shell-hardcoded-actor
- **Lokasi:** `src/App.tsx:163-164`
- **Status:** confirmed
- **Masalah:** The log actor is a hard-coded string, not taken from ROLE_PROFILES, so it drifts if the profile changes.
- **Saran perbaikan:** person: ROLE_PROFILES.Staff.name (or ROLE_PROFILES[currentRole].name), personRole: currentRole.

### [P3] shell-invite-id-format
- **Lokasi:** `src/App.tsx:246`
- **Status:** confirmed
- **Masalah:** Invited user ids are not zero-padded ('USR-13' while seeds are 'USR-01'…'USR-12'). The id depends on list length, which only works because users are never deleted.
- **Saran perbaikan:** Use `USR-${Date.now()}` or String(n).padStart(2,'0'), and use the functional updater for the length.

### [P3] shell-team-designers-state
- **Lokasi:** `src/App.tsx:79`
- **Status:** confirmed
- **Masalah:** teamDesigners is read-only state with no setter, so useState adds nothing.
- **Saran perbaikan:** Pass INITIAL_TEAM_DESIGNERS directly, or keep it as is. Harmless either way.

### [P3] shell-no-role-screen-guard
- **Lokasi:** `src/App.tsx:288-381`
- **Status:** partially-true
- **Masalah:** Nothing checks role against screen. Any currentRole can render any screen, and in-screen links can leave role and screen mismatched; the breadcrumb then shows another role's section while the sidebar shows the current role's menu. This is acceptable for a demo but not enforced anywhere.
- **Saran perbaikan:** Optional: derive the required role from ALL_SCREENS_LIST in handleNavigate and auto-switch currentRole, e.g. `const req = ALL_SCREENS_LIST.find(s=>s.id===screen)?.role; if (req && screen!=='brand-guidelines') setCurrentRole(req)`. That would also make the separate onSelectRole calls unnecessary.
- **Koreksi verifikator:** It is true that App renders by currentScreen only, with no role check. Most entry points (jumper, pill, notifications, StaffPlatforms) switch role explicitly, though, and the only concrete mismatch path found is the StaffUpload step-3 link, which is already covered by its own finding. For a demo this is more a design note than a P2 bug.

### [P3] shell-select-role-inconsistent-wiring
- **Lokasi:** `src/App.tsx:270,282,309`
- **Status:** partially-true
- **Masalah:** onSelectRole means different things in different places. LayoutShell gets handleSelectRole, which also jumps to the role's home screen. LoginScreen and StaffPlatformsScreen get the raw setCurrentRole. In LayoutShell, `onSelectRole(x); onNavigate(y)` only works because React batches the two setCurrentScreen calls and the last one wins.
- **Saran perbaikan:** Split it into two explicit props, e.g. onSwitchRoleHome (handleSelectRole) and onSetRole (setCurrentRole), or document the batching dependency. Always call onSelectRole before onNavigate, never after.
- **Koreksi verifikator:** The inconsistency is real: LayoutShell gets handleSelectRole, which also jumps to the role's home screen, while LoginScreen and StaffPlatformsScreen get raw setCurrentRole. The batching claim is wrong, however. Two sequential setCurrentScreen calls apply in enqueue order whether or not they are batched, so `onSelectRole(x); onNavigate(y)` ends on y regardless. It only breaks if the call order is reversed. This is a maintainability hazard, not a P2 UX bug.

### [P3] shell-notifications-static
- **Lokasi:** `src/components/LayoutShell.tsx:476,483,486-530`
- **Status:** confirmed
- **Masalah:** Notifications are hard-coded JSX. '3 unread' and the dot never change, and opening the panel does not mark anything read. Row 2 navigates to staff-submissions without staffTab:'Revision', so it lands on whichever tab was last active (possibly Drafts).
- **Saran perbaikan:** Use onNavigate('staff-submissions', { staffTab: 'Revision' }). Optionally drive the rows from activityLogs.

### [P3] shell-a11y-active-nav
- **Lokasi:** `src/components/LayoutShell.tsx:300-315`
- **Status:** confirmed
- **Masalah:** The active nav item is shown by color only, with no aria-current.
- **Saran perbaikan:** Add aria-current={active ? 'page' : undefined}.

### [P3] shell-logo-upload-duplicated
- **Lokasi:** `src/components/LayoutShell.tsx:206-217`
- **Status:** confirmed
- **Masalah:** handleLogoFileChange is copied exactly in LoginScreen.tsx:46-57. Both copies skip validating file size and type beyond the accept attribute, and never reset input.value, so picking the same file twice does nothing. Nothing can reset the logo to the default, and it is lost on reload because it is not persisted.
- **Saran perbaikan:** Move this into a shared helper or hook in SharedUI (e.g. readImageAsDataUrl). Add `e.target.value = ''` after reading and an optional size limit. Optionally persist to localStorage inside try/catch.

### [P3] shell-gaskeunlogo-dead-props
- **Lokasi:** `src/components/SharedUI.tsx:59-60`
- **Status:** confirmed
- **Masalah:** GaskeunLogoProps declares onUploadLogo and allowUploadHint, but the component never destructures or uses them.
- **Saran perbaikan:** Remove the unused props.

### [P3] shell-breadcrumb-dead-entries
- **Lokasi:** `src/components/LayoutShell.tsx:48,94-97`
- **Status:** confirmed
- **Masalah:** SCREEN_BREADCRUMBS.login can never be reached, because LayoutShell is not rendered on login. The `|| {section, page:'Workspace'}` fallback can never run, because the Record covers every ScreenId. The brand-guidelines entry's section 'Workspace' is overridden by currentRole at line 394.
- **Saran perbaikan:** Leave as is, or simplify. If a new ScreenId is added, TypeScript will force a new entry here, which is intended.

### [P3] shell-head-no-brand-nav
- **Lokasi:** `src/components/LayoutShell.tsx:130-156`
- **Status:** confirmed
- **Masalah:** Staff and Admin menus have Brand guidelines but Head does not. Head can only reach brand-guidelines through the jumper (which lists its role as 'Staff' but keeps the current role).
- **Saran perbaikan:** Add `{ id:'brand', label:'Brand guidelines', screen:'brand-guidelines', icon: BookOpen }` to the Head menu if that is intended.

### [P3] shell-static-workspace-gemini
- **Lokasi:** `src/components/LayoutShell.tsx:259-262,344-358`
- **Status:** confirmed
- **Masalah:** The workspace name 'Lumbung Studio' and the Gemini card text are hard-coded in the shell, and repeated in LoginScreen and mockData. The Gemini card also says 'Gemini is on' twice: once in the title and again at the start of its body text.
- **Saran perbaikan:** Move WORKSPACE_NAME into mockData.ts and remove the repeated phrase from the body text.

### [P3] shell-no-default-export
- **Lokasi:** `src/components/LayoutShell.tsx:79`
- **Status:** confirmed
- **Masalah:** LayoutShell is a named export (and so is GaskeunLogo in SharedUI), which breaks the AGENTS.md rule 'Export components as default exports'. App imports it as `{ LayoutShell }`.
- **Saran perbaikan:** Leave it, to avoid churn, or add `export default LayoutShell` and keep the named export for compatibility.

### [P3] shell-no-typecheck-script
- **Lokasi:** `package.json:6-11`
- **Status:** confirmed
- **Masalah:** The scripts are dev, build (vite build), preview and format, with no typecheck. Vite strips types without checking them, so type errors will not fail the build. `tsc --noEmit` passes today.
- **Saran perbaikan:** Add "typecheck": "tsc --noEmit -p ." and run it after every edit.

### [P3] shell-submit-timing-ignored
- **Lokasi:** `src/App.tsx:140-172`
- **Status:** found-by-verifier
- **Masalah:** The 'schedule' timing choice changes only the activity-log label. The queue item, calendar and the published post created on approve all treat it as immediate (publishedAt 'Just now').
- **Saran perbaikan:** Store timing on the queue item and, on approve, add a CalendarPostItem (status 'Scheduled') instead of a PublishedPostItem when timing === 'schedule'.

### [P3] shell-submit-title-not-synced
- **Lokasi:** `src/App.tsx:143-170`
- **Status:** found-by-verifier
- **Masalah:** The queue item keeps its seeded title while the log uses drafts.Instagram.title. After Regenerate (ALTERNATE_AI_DRAFTS title "We're hiring a UI/UX Designer in [CITY]!") or a manual title edit, the log's targetTitle differs from the queue, published and staff-submission titles.
- **Saran perbaikan:** Either set `title: drafts.Instagram.title` on the queue item, or log item.title, so both use the same source.

### [P3] shell-regenerate-discards-edits
- **Lokasi:** `src/App.tsx:124-132`
- **Status:** found-by-verifier
- **Masalah:** handleRegenerateDraft replaces the whole platform draft with a fixed alternate or initial source, silently discarding user caption and hashtag edits, and toggles between only two canned variants.
- **Saran perbaikan:** Acceptable for a mock. If kept, show the user that edits will be replaced, or preserve user-added hashtags.

## Shared UI & styling (24)

### [P2] shared-ui-unlayered-css-overrides-utilities
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:132`
- **Status:** partially-true
- **Masalah:** The gaskeun-* classes in index.css are unlayered, but Tailwind v4 puts utilities inside @layer utilities. Per the CSS cascade-layers spec, unlayered rules beat layered rules whatever their specificity. So any Tailwind utility that sets the same property as a gaskeun-* class is silently ignored. Here, the 'submitted' success banner is meant to be light blue with a blue border, but it renders white with the default #E6ECF5 border.
- **Saran perbaikan:** Wrap the custom classes in `@layer components { ... }` in index.css, so utilities win as Tailwind intends. Or drop gaskeun-card from that element and write the utilities out in full (rounded-2xl border shadow-...).
- **Koreksi verifikator:** The mechanism checks out. index.css:13-61 declares .gaskeun-* outside any @layer, while `@import 'tailwindcss'` puts utilities inside @layer utilities, and unlayered rules beat layered ones. StaffPlatformsScreen.tsx:132 `gaskeun-card p-5 bg-[#E6EFFF] border-[#1450E0]` therefore renders with a #FFFFFF background and a #E6ECF5 border. HeadReviewQueueScreen.tsx:524 `gaskeun-btn-secondary min-h-[48px]` renders at the 44px from index.css:40. I found only these two conflicting usages. The impact is visual (a banner loses its tint, a button is 4px shorter), not functional, so P2 rather than P1. It is still a real trap for future edits, and wrapping the classes in @layer components is the right fix.

### [P2] shared-ui-activitylog-chip-mislabel
- **Lokasi:** `src/screens/AdminActivityLogScreen.tsx:91-96`
- **Status:** confirmed
- **Masalah:** StatusChip renders the status string as its label, so the activity log's category mapping changes the TEXT shown, not just the color. 'Approved' entries display 'Published', 'AI check' entries display 'In review', and 'Admin' entries display 'Draft'.
- **Saran perbaikan:** Give StatusChip an optional `label` (or `tone`) prop, e.g. `<StatusChip status="Published" label="Approved" />`, or add 'Approved', 'AI check' and 'Admin' entries to the styles map in SharedUI.tsx:143-153 and pass the category directly.

### [P2] shared-ui-labels-not-associated
- **Lokasi:** `src/screens/LoginScreen.tsx:233`
- **Status:** confirmed
- **Masalah:** No <label> in the app is programmatically tied to its control (0 uses of htmlFor, and no label wraps its input). Screen readers therefore announce the inputs without a name, and clicking a label does not focus its field.
- **Saran perbaikan:** Use React `useId()` and set `<label htmlFor={id}>` and `<input id={id}>` on each pair.

### [P2] shared-ui-clickable-divs
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:283-289`
- **Status:** confirmed
- **Masalah:** Several interactive elements are <div onClick> with no role, tabIndex or key handler, so keyboard users cannot reach them.
- **Saran perbaikan:** Change them to `<button type="button" className="w-full text-left ...">` (keeping the classes) and add aria-pressed or aria-current to the selected queue item.

### [P2] shared-ui-html-shell-branding
- **Lokasi:** `index.html:7`
- **Status:** confirmed
- **Masalah:** The browser tab shows 'Figma Make App' and the generic Figma Make favicon, because .figma/make/site.json has no title or icons entry. The GasKeun brand mark is not used as the favicon.
- **Saran perbaikan:** Add `"title": "GasKeun"` to .figma/make/site.json (do NOT hard-code a <title> in index.html, because the comment slots are Figma-managed). Replace public/favicon.svg with an SVG of the GasKeun G mark (gradient #1450E0->#08D9F0, white G, lime #BBFB52 check).

### [P2] shared-ui-statuschip-loose-typing-silent-fallback
- **Lokasi:** `src/components/SharedUI.tsx:142,155 (call site src/screens/AdminDashboardScreen.tsx:370-378)`
- **Status:** found-by-verifier
- **Masalah:** StatusChip's prop is typed `SubmissionStatus | string`, and unknown keys fall back silently to the Draft style. AdminDashboard's recent-activity table passes actionCategory 'Admin' (and 'Submitted'/'Revision') through unchanged, so 'Admin' renders as a grey Draft-styled chip labelled 'Admin'. AdminActivityLog shows the same category as 'Draft'. The two screens map ActivityLogEntry categories differently, and the type system does not catch it.
- **Saran perbaikan:** Type the prop as `SubmissionStatus | MemberStatus | ActivityCategory` and add explicit style entries for 'Approved', 'AI check' and 'Admin' (or a separate `tone` prop). Delete both ad-hoc mapping functions and pass actionCategory directly.

### [P3] shared-ui-no-design-tokens
- **Lokasi:** `src/index.css:1-61`
- **Status:** partially-true
- **Masalah:** There is no @theme or CSS-variable token layer, so every color in the app is an arbitrary hex literal: 989 occurrences across 15 TSX files, plus 43 in mockData.ts. Changing the brand palette means find-and-replace across every file, and near-duplicate shades have already drifted.
- **Saran perbaikan:** Add `@theme { --color-ink: #0B1F4D; --color-slate: #52607E; --color-primary: #1450E0; --color-primary-hover: #1044C4; --color-line: #E6ECF5; --color-line-strong: #D5DEEE; --color-canvas: #F5F7FC; ... }` to index.css, then migrate classes like text-[#0B1F4D] to text-ink gradually. Export the StatusChip color map so other screens can import it instead of copying hex values.
- **Koreksi verifikator:** Verified: index.css has no @theme and no CSS variables. The total of 989 hex literals across the TSX files is exact, and the 43 in mockData is exact. Some per-color counts are slightly high: #0B1F4D is 194 (not 198), #1450E0 is 115 (not 120), #146C3C is 42 (not 46). The drift example is real: AdminDashboardScreen.tsx:96-102 pipelineStages uses bg '#146C3C' for Published, where StatusChip's dot is '#16A34A'. This is a maintainability problem, not a UX defect, so P3.

### [P3] shared-ui-postergraphic-title-mismatch
- **Lokasi:** `src/components/SharedUI.tsx:405-411`
- **Status:** partially-true
- **Masalah:** PosterGraphic takes no title prop: every theme's copy is hard-coded. Queue items whose title differs from their theme's hard-coded title therefore show the wrong poster in HeadReviewQueue and Published. 'Studio open house invite' (theme 'batik') renders 'Heritage & Craft Series'. Every 'hiring' item renders 'UI/UX Designer'. The published post 'Year-end greeting card' (theme 'product') would render 'Product launch carousel'.
- **Saran perbaikan:** Add optional `title?: string` and `subtitle?: string` props to PosterGraphic that override cfg.title/cfg.subtitle, and pass selectedItem.title from the callers.
- **Koreksi verifikator:** PosterGraphic does hard-code its copy (SharedUI.tsx:313-319, 366-412), and SUB-1036 'Studio open house invite' (mockData.ts:294/311, theme 'batik') would show 'Heritage & Craft Series'. Two parts of the claim are wrong. (1) The only hiring queue item, SUB-1042 "We're hiring: UI/UX Designer", matches the poster, so 'every hiring item renders the wrong poster' is not a mismatch. (2) PublishedPostItem.posterTheme is never passed to PosterGraphic: PublishedScreen.tsx:208/256 only renders latestApprovedItem, which is a QueueItem. So 'Year-end greeting card' is never rendered this way. The real impact is one mock item.

### [P3] shared-ui-postertheme-typing
- **Lokasi:** `src/types.ts:71`
- **Status:** confirmed
- **Masalah:** Poster theme typing is inconsistent. QueueItem.posterTheme is a 7-value union (types.ts:53), but PublishedPostItem.posterTheme is a plain string and PosterGraphic's theme prop is a plain string. An unknown theme silently falls back to 'product'.
- **Saran perbaikan:** Export `type PosterTheme = QueueItem['posterTheme']` (or a standalone union) from types.ts and use it in PublishedPostItem, PosterGraphicProps and the themeConfigs Record key.

### [P3] shared-ui-logo-dead-props
- **Lokasi:** `src/components/SharedUI.tsx:56-66`
- **Status:** confirmed
- **Masalah:** GaskeunLogoProps declares onUploadLogo and allowUploadHint, but the component never reads them. The upload logic is duplicated in LayoutShell and LoginScreen instead. The `34 | 48 | number` union collapses to plain number, and the radius only special-cases 48.
- **Saran perbaikan:** Remove the two unused props (or implement them). Extract a shared `readFileAsDataUrl(file): Promise<string>` helper or a `<LogoUploadButton onUpload>` component into SharedUI and use it from both files.

### [P3] shared-ui-platform-icon-duplication
- **Lokasi:** `src/screens/AdminConnectedScreen.tsx:42-58`
- **Status:** confirmed
- **Masalah:** The platform icon plus brand-color mapping (Instagram #E1306C, LinkedIn #0A66C2, TikTok = lucide Video #0B1F4D) is re-declared in 6 screens, although PlatformBadge already holds it internally (SharedUI.tsx:175-179).
- **Saran perbaikan:** Export `PlatformIcon: React.FC<{ platform: PlatformName; size?: number; colored?: boolean }>` from SharedUI, reuse it inside PlatformBadge, and replace the inline maps.

### [P3] shared-ui-search-input-duplication
- **Lokasi:** `src/screens/HeadTeamScreen.tsx:118-134`
- **Status:** confirmed
- **Masalah:** The search field (absolutely positioned lucide Search icon plus a rounded input with focus:border-[#1450E0]) is copy-pasted in 8 screens with drifting min-heights (40/42/44px) and paddings. None of the copies has an accessible name.
- **Saran perbaikan:** Add `SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string; label: string; className?: string }>` to SharedUI, rendering `aria-label={label}`, and replace the copies one screen at a time.

### [P3] shared-ui-pagination-state-duplication
- **Lokasi:** `src/components/SharedUI.tsx:196-206`
- **Status:** partially-true
- **Masalah:** PaginationBar does not clamp currentPage. Each of the 6 screens re-implements currentPage state, slicing, and a manual setCurrentPage(1) in every filter onChange (StaffSubmissions has 7 such calls). If the list shrinks while on a later page (for example, the item leaves the active status filter after a review action), the bar shows 'Showing 5–4 of 4' and the list is empty. All pages are rendered with no windowing, which breaks the layout for long lists.
- **Saran perbaikan:** Add a `usePagination(items, pageSize, resetDeps)` hook to SharedUI that clamps the page with useEffect and returns { page, setPage, pageItems }. Inside PaginationBar, compute `const safePage = Math.min(currentPage, totalPages)`.
- **Koreksi verifikator:** PaginationBar (SharedUI.tsx:202-206) does not clamp, and the same page state is copied into 6 screens with pageSizes 8/6/6/4/4/5. The concrete failure is not reachable with the current data, though. In HeadReviewQueue, approving does not remove items (App.tsx:188 only sets latestApprovedItem and the published list), and every status bucket holds at most 4 items. That is ≤ pageSize 4, so a filtered view never has a page 2. Every filter change already calls setCurrentPage(1). The claim that rendering all pages 'breaks the layout' is also overstated: the wrapper is flex-wrap and the data yields only 1-3 pages. This is a latent robustness gap, not a live bug.

### [P3] shared-ui-stepper-duplication
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:106-145`
- **Status:** confirmed
- **Masalah:** The 3-step workflow stepper (Upload & AI draft -> Platforms & check -> Head approval) is hand-built twice with slightly different active styling, so changing the steps means editing both files.
- **Saran perbaikan:** Create `WorkflowStepper: React.FC<{ activeStep: 1|2|3; onNavigate: (s: ScreenId) => void }>` in SharedUI and use it in both screens.

### [P3] shared-ui-avatar-duplication
- **Lokasi:** `src/screens/AdminDashboardScreen.tsx:302-308`
- **Status:** confirmed
- **Masalah:** The initials avatar (a circle with style backgroundColor=avatarBg, white bold initials) is re-implemented in 5 places with different sizes.
- **Saran perbaikan:** Add `Avatar: React.FC<{ initials: string; bg: string; size?: 'sm'|'md'|'lg' }>` to SharedUI.

### [P3] shared-ui-pagination-a11y
- **Lokasi:** `src/components/SharedUI.tsx:227-237`
- **Status:** confirmed
- **Masalah:** The page-number buttons have no accessible context: no aria-current on the active page, no aria-label like 'Page 2', and no <nav aria-label> wrapper.
- **Saran perbaikan:** Wrap the buttons in `<nav aria-label="Pagination">`; on each button add `aria-label={`Page ${page}`}` and `aria-current={active ? 'page' : undefined}`.

### [P3] shared-ui-no-focus-visible
- **Lokasi:** `src/index.css:20-47`
- **Status:** confirmed
- **Masalah:** There are no focus-visible styles anywhere (0 'focus-visible' matches in src/). Buttons fall back to the browser default outline. Inputs use `focus:outline-none` and replace it only with a border-color change, which is a weak focus indicator. gaskeun-btn-primary animates `transition: all` with a hover translateY and has no prefers-reduced-motion guard.
- **Saran perbaikan:** Add `.gaskeun-btn-primary:focus-visible, .gaskeun-btn-secondary:focus-visible { outline: 2px solid #1450E0; outline-offset: 2px; }` and a `@media (prefers-reduced-motion: reduce)` override. On inputs, add `focus-visible:ring-2 focus-visible:ring-[#1450E0]/30`.

### [P3] shared-ui-search-no-accessible-name
- **Lokasi:** `src/screens/PublishedScreen.tsx:295-301`
- **Status:** confirmed
- **Masalah:** Every free-text search input relies only on its placeholder for a name. The selects do have aria-labels (e.g. AdminActivityLog:180), but the text inputs at AdminActivityLog:167, AdminDashboard:130, AdminUsers:235, HeadCalendar:225, HeadReviewQueue:219, HeadTeam:131, Published:299 and StaffSubmissions:217 have none.
- **Saran perbaikan:** Add aria-label to each search input (or adopt the shared SearchInput component proposed above).

### [P3] shared-ui-decorative-svg-a11y
- **Lokasi:** `src/components/SharedUI.tsx:81-91`
- **Status:** confirmed
- **Masalah:** The fallback GaskeunLogo is a <div aria-label> with no role, so most assistive tech ignores the label. The brand SVGs (Instagram, Linkedin) and GeminiSparkleTile have neither aria-hidden nor role=img. Where they sit next to visible text they should be hidden from AT; standalone they need a name (e.g. PlatformBadge compact mode at SharedUI.tsx:184 shows only an icon, so the platform name is lost).
- **Saran perbaikan:** Add `role="img"` to the logo div. Add `aria-hidden="true"` to the Instagram/Linkedin/GeminiSparkleTile SVGs by default. In PlatformBadge compact mode, render `<span className="sr-only">{platform}</span>` or add `title`/`aria-label` on the outer span.

### [P3] shared-ui-emptystate-copy-fixed
- **Lokasi:** `src/components/SharedUI.tsx:264-272`
- **Status:** confirmed
- **Masalah:** EmptyFilterState's heading 'Nothing matches these filters' and button 'Clear search and filters' cannot be changed. AdminDashboard uses it for a search-only box whose onReset only clears the search, so the copy promises more than the button does.
- **Saran perbaikan:** Add optional `title?: string` and `resetLabel?: string` props with the current strings as defaults.

### [P3] shared-ui-two-palettes-mixed
- **Lokasi:** `src/components/SharedUI.tsx:366-412`
- **Status:** confirmed
- **Masalah:** PosterGraphic is supposed to depict the CLIENT brand (Lumbung Studio palette, defined in BrandGuidelinesScreen.tsx:64-83: Sun #FFE14D, Ink #1F1A2E, Berry #F0307A, Paper #FFFFFF). Yet 4 of the 6 non-hiring themes use GasKeun app colors (#0B1F4D, #1450E0, #0E3AAE, #08D9F0, #BBFB52), which contradicts the brand guidelines the AI check supposedly enforces.
- **Saran perbaikan:** Decide whether posters must follow the Lumbung palette. If they must, restrict themeConfigs to #FFE14D, #1F1A2E, #F0307A and #FFFFFF. Either way, document that the app UI palette and the client brand palette are separate.

### [P3] shared-ui-poster-low-contrast-text
- **Lokasi:** `src/components/SharedUI.tsx:342, 378-382, 435-438`
- **Status:** found-by-verifier
- **Masalah:** White text on Berry #F0307A has a contrast ratio of about 3.9:1, below WCAG AA's 4.5:1 for small text. The promo theme puts 12px subtitle text (`text-xs text-white/80`) and 11px footer text (`text-white/75`) on that background, and the opacity lowers contrast further, to roughly 3:1. The hiring CTA chip (`bg-[#F0307A] text-white text-xs`) also fails.
- **Saran perbaikan:** Use Ink #1F1A2E text on Berry backgrounds, or drop the opacity modifiers on small text.

### [P3] shared-ui-google-fonts-css-import
- **Lokasi:** `src/index.css:1`
- **Status:** found-by-verifier
- **Masalah:** Plus Jakarta Sans is loaded with a CSS @import of fonts.googleapis.com. This chains requests that block rendering (app CSS, then the Google CSS, then the font files), and there is no preconnect. The result is a slower first paint, and a flash of fallback text on the login screen.
- **Saran perbaikan:** Move it to `<link rel="preconnect">` + `<link rel="stylesheet">` through .figma/make/site.json customScripts.headStart, since the index.html slots are Figma-managed. Alternatively, self-host the font files with @font-face.

### [P3] shared-ui-buttons-no-disabled-style
- **Lokasi:** `src/index.css:20-47`
- **Status:** found-by-verifier
- **Masalah:** The hover rules are guarded with :not(:disabled), but neither .gaskeun-btn-primary nor .gaskeun-btn-secondary defines a :disabled state. A disabled primary button keeps its full gradient and shadow unless each call site remembers to add `disabled:opacity-40`. StaffPlatformsScreen.tsx:491 is currently the only place that does.
- **Saran perbaikan:** Add `.gaskeun-btn-primary:disabled, .gaskeun-btn-secondary:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }` inside the same @layer components block proposed for the layering fix.

## Staff screens (40)

### [P1] staff-save-draft-noop
- **Lokasi:** `src/App.tsx:294-296`
- **Status:** confirmed
- **Masalah:** The 'Save draft' button shows a 'Saved to Drafts' success toast, but the App handler is a no-op. Nothing is added to staffSubmissions, so the Drafts tab count stays at 3.
- **Saran perbaikan:** Add a handleSaveDraft in App that upserts a StaffSubmissionItem (e.g. id 'MY-DRAFT-HIRING', title drafts.Instagram.title, type 'Poster', platforms selectedPlatforms, status 'Draft', updatedAt 'Just now', reviewer ROLE_PROFILES.Head.name) and prepends it. Alternatively, change the toast copy so it does not claim a save.

### [P2] staff-submit-not-in-my-submissions
- **Lokasi:** `src/App.tsx:140-174`
- **Status:** partially-true
- **Masalah:** Submitting updates queueItems and activityLogs but never staffSubmissions. The success banner offers 'View My submissions', yet that list is unchanged: MY-201 keeps status 'In review' and updatedAt '10 mins ago'.
- **Saran perbaikan:** In handleSubmitForApproval, also call setStaffSubmissions(prev => prev.map(s => s.id === 'MY-201' ? { ...s, title: drafts.Instagram.title, platforms: selectedPlatforms, status: 'Submitted', updatedAt: 'Just now' } : s)). Better, link the two records with a shared id constant.
- **Koreksi verifikator:** Correct that handleSubmitForApproval (App.tsx:140-174) only calls setQueueItems and setActivityLogs, and MY-201 is never touched. The effect is milder than described: MY-201 already shows status 'In review', which the 'In review' tab counts together with 'Submitted'. What the user actually sees wrong is a stale updatedAt ('10 mins ago') and a title or platforms that do not reflect the edits. That is a sync inconsistency, not a broken function.

### [P2] staff-schedule-date-dropped
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:37`
- **Status:** confirmed
- **Masalah:** scheduleDate is editable in the datetime-local input but is never passed to onSubmitForApproval. The onSubmitForApproval signature has no parameter for it, so scheduled posts carry no date anywhere (queue, calendar or log).
- **Saran perbaikan:** Extend the prop to (note, timing, scheduleAt?: string) in both StaffPlatformsScreenProps and App.handleSubmitForApproval, and include it in the activity log detail and/or the queue item (add an optional field to QueueItem in types.ts).

### [P2] staff-reviewer-note-invisible
- **Lokasi:** `src/App.tsx:154`
- **Status:** confirmed
- **Masalah:** The staff 'Optional note for reviewer' is stored in queueItem.revisionNote, a field that semantically means the Head's revision request. HeadReviewQueueScreen never renders item.revisionNote, so the Head never sees the note. Its pre-filled default text is also sent if the user never edits it.
- **Saran perbaikan:** Add a separate optional field `staffNote?: string` to QueueItem in src/types.ts, set it in handleSubmitForApproval, and render it in the HeadReviewQueue detail panel. Start reviewerNote as an empty string with the existing placeholder.

### [P2] staff-submit-ignores-typo
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:487-491`
- **Status:** confirmed
- **Masalah:** Submit is only disabled for 0 platforms. A user can submit with the 'Aplly' typo unfixed, even though the UI says to apply the correction before submitting. The 'Ready' badge is hard-coded, and the queue item's aiChecks still claim the typo was resolved.
- **Saran perbaikan:** Either disable Submit while !typoFixed (with helper text), or show a warning badge instead of 'Ready'. Make the 'Ready' badge conditional on typoFixed && selectedPlatforms.length > 0.

### [P2] staff-submit-repeatable-duplicate-logs
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:71-74`
- **Status:** confirmed
- **Masalah:** After a successful submit the button stays enabled. Each extra click prepends another 'Submitted for ... publish' ActivityLogEntry and re-resets SUB-1042, which overwrites any Head decision such as Revision.
- **Saran perbaikan:** Add `|| submittedModal` to the disabled condition, or return early in handleSubmit when submittedModal is true.

### [P2] staff-tiktok-caption-always-sent
- **Lokasi:** `src/App.tsx:149-153`
- **Status:** confirmed
- **Masalah:** Captions for all 3 platforms are written to the queue item regardless of selectedPlatforms, so the Head sees 'Platform captions (3)' including TikTok when TikTok was not selected. Hashtags are dropped entirely (the original mock captions had hashtags inline), and edited titles are not copied to queueItem.title.
- **Saran perbaikan:** Build captions only for selectedPlatforms and append drafts[p].hashtags.join(' '). Also set title: drafts.Instagram.title. QueueItem.captions has optional TikTok, so leave it undefined when TikTok is not selected.

### [P2] staff-upload-stepper-no-role-switch
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:134-137`
- **Status:** confirmed
- **Masalah:** Step 3 'Head approval' on the Upload screen navigates to head-queue without switching the role. The user sees the Head queue with the Staff sidebar and Rina's avatar. The same step on the Platforms screen (lines 117-120) switches the role to Head. Both steppers also let Staff skip submission and reach the Head queue.
- **Saran perbaikan:** Make the two steppers consistent. Either add an onSelectRole prop to StaffUploadScreen, or make step 3 non-clickable for Staff (it represents a future state). Consider extracting a shared <SubmissionStepper current={1|2}> component.

### [P2] staff-regenerate-destroys-edits
- **Lokasi:** `src/App.tsx:124-132`
- **Status:** confirmed
- **Masalah:** Regenerate replaces the entire platform draft with a fixed mock. Any user edits to the title, caption or hashtags are lost without confirmation. With only 2 variants, it alternates rather than generating anything new. The tone also changes to strings such as 'Bold, direct & community-driven' that contradict the Brand guidelines tone list.
- **Saran perbaikan:** Keep the platform tone fixed (copy prev[platform].tone), confirm before overwriting edited content, and disable the Regenerate button while isRegenerating is true (StaffUploadScreen.tsx:258-265).

### [P2] staff-replace-file-fake
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:55-59`
- **Status:** confirmed
- **Masalah:** 'Replace' only cycles the file name between 3 hard-coded entries and shows a success toast. The poster preview, drafts and Gemini-detected fields never change. The third file is 1:1, but the badge still says 'Poster · 4:5'.
- **Saran perbaikan:** Either derive the badge from currentFile.dims, or add a real <input type='file'> with a preview through URL.createObjectURL. At minimum, make the toast say it is a demo.

### [P2] staff-hardcoded-char-counts-wrong
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:397`
- **Status:** confirmed
- **Masalah:** The checklist claims 'Instagram (278 chars...)' and 'LinkedIn (342 chars...)', but the actual INITIAL_AI_DRAFTS captions are 286 and 326 characters. The same wrong numbers appear in mockData aiChecks, and none of them update when the user edits.
- **Saran perbaikan:** Pass drafts to StaffPlatformsScreen and render `${drafts.Instagram.caption.length} chars, ${drafts.Instagram.hashtags.length} hashtags`.

### [P2] staff-open-row-wrong-target
- **Lokasi:** `src/screens/StaffSubmissionsScreen.tsx:307-310`
- **Status:** confirmed
- **Masalah:** Every row's 'Open' button, and the banner's 'Fix in editor' (155-158), navigate to the single hiring-poster editor regardless of the row. Opening '11.11 promo teaser' or a Published item shows the 'We're hiring' draft.
- **Saran perbaikan:** Short term: label the button 'View' and disable it for non-hiring rows, or show a toast. Long term: add a selectedSubmissionId state in App and seed drafts per submission.

### [P2] staff-mock-data-contradictions
- **Lokasi:** `src/data/mockData.ts:437-473`
- **Status:** confirmed
- **Masalah:** Rina's 'My submissions' rows contradict the Head queue for the same titles. MY-202 '11.11 promo teaser' is Rina's here, but SUB-1040 is by Sari Wulandari, with a different revision note. MY-205 'Studio open house invite' is a Story on IG here, but SUB-1036 is a Poster on IG+LinkedIn by Tomi Hartono, with a different note. MY-203 'Product launch carousel' corresponds to SUB-1041 by Dimas Arya. MY-201 status is 'In review' while SUB-1042 is 'Submitted'.
- **Saran perbaikan:** Decide one source of truth. Either rename the staff rows so they don't collide with other designers' queue items, or derive Rina's submissions from INITIAL_QUEUE_ITEMS filtered by designer === 'Rina Putri'.

### [P2] staff-brand-rules-not-wired
- **Lokasi:** `src/screens/BrandGuidelinesScreen.tsx:17-60`
- **Status:** confirmed
- **Masalah:** Rule toggles and words-to-avoid live only in this component's local state. They reset on every navigation and influence nothing: the StaffPlatforms Brand Guardian checklist is static, and captions are never scanned. The header badge 'Synced with Gemini Brand Guardian' (121-124) is decorative.
- **Saran perbaikan:** Lift rules and wordsToAvoid into App state (seed constants in mockData.ts), pass them to both screens, and have StaffPlatforms compute checklist rows (e.g. flag drafts whose caption includes a word to avoid).

### [P2] staff-tiktok-not-connected
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:203-206`
- **Status:** confirmed
- **Masalah:** TikTok can be selected for auto-publish although App connectedPlatforms.TikTok is false by default (App.tsx:88) and the artwork is a static poster. The 'Needs video' badge is shown only when TikTok is OFF and disappears once it is ON. The Login copy (LoginScreen.tsx:75) promises TikTok publishing.
- **Saran perbaikan:** Pass connectedPlatforms into StaffPlatformsScreen. Disable or flag platforms that are not connected, and keep the 'Needs video' warning visible while TikTok is ON.

### [P2] staff-a11y-labels
- **Lokasi:** `src/screens/LoginScreen.tsx:233`
- **Status:** confirmed
- **Masalah:** Form labels are not associated with their inputs (no htmlFor/id), and several inputs rely on a placeholder alone, so screen readers announce unlabeled fields.
- **Saran perbaikan:** Add id/htmlFor pairs or wrap inputs in their <label>. Add aria-label to placeholder-only inputs.

### [P2] staff-a11y-toggle-state
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:189-198`
- **Status:** confirmed
- **Masalah:** Selection state is conveyed only visually. Platform cards and timing cards (241-281) lack aria-pressed or radio semantics. The Brand Guardian switches (BrandGuidelinesScreen.tsx:310-320) have role='switch' and aria-checked but no accessible name. The StaffSubmissions tabs (175-197) lack role='tab' and aria-selected. The Upload platform tabs (278-290) lack aria-selected.
- **Saran perbaikan:** Add aria-pressed={isOn} to toggle cards, role='radiogroup'/'radio' with aria-checked to the timing cards, aria-label={r.title} to the switches, and aria-selected to the tabs.

### [P2] staff-head-decisions-not-propagated
- **Lokasi:** `src/App.tsx:176-214`
- **Status:** found-by-verifier
- **Masalah:** This is the reverse of 'submit not in My submissions'. When the Head requests a revision on, rejects or approves SUB-1042, only queueItems (and publishedPosts on approve) change. staffSubmissions MY-201 is never updated, so Rina's My submissions never shows the Revision status, the Head's note or a Published state. The staff revision banner and Revision tab can never reflect a real Head action.
- **Saran perbaikan:** Link MY-201 and SUB-1042 with a shared id. In these three handlers, also update the matching staffSubmissions row (status 'Revision' with revisionNote, or 'Published').

### [P2] staff-placeholders-submitted-unresolved
- **Lokasi:** `src/data/mockData.ts:56`
- **Status:** found-by-verifier
- **Masalah:** The AI-drafted captions and the poster's detected fields contain literal placeholders ('[CITY]', '[DEADLINE]'), and the default reviewer note also contains '[CITY]'. Nothing in the staff flow flags them, and the Brand Guardian checklist shows all PASS once the typo is fixed. Yet another queue item's aiChecks (SUB-1036) treats an unresolved [DEADLINE] placeholder as a blocking issue, so the checks are applied inconsistently and an unfilled post can be sent for auto-publish.
- **Saran perbaikan:** Add a Brand Guardian checklist row that scans drafts for /\[[A-Z]+\]/ and shows FIX until the placeholders are resolved, or replace the placeholders in the mock data with real values.

### [P3] staff-platform-fallback-dead
- **Lokasi:** `src/App.tsx:148`
- **Status:** confirmed
- **Masalah:** The fallback to ['Instagram','LinkedIn'] when no platform is selected cannot run because the Submit button is disabled at 0 platforms. Meanwhile the log detail at line 171 uses selectedPlatforms without the fallback, so the two disagree.
- **Saran perbaikan:** Use selectedPlatforms directly, or keep one consistent guard.

### [P3] staff-stepper-duplicated
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:107-144`
- **Status:** partially-true
- **Masalah:** The 3-step stepper markup is copy-pasted, with divergent behaviour, in StaffUploadScreen (107-144) and StaffPlatformsScreen (88-128). Because the class strings are near-identical, Edit old_string matches are ambiguous.
- **Saran perbaikan:** Extract a SubmissionStepper into src/components/SharedUI.tsx with props { current: 1 | 2; onNavigate; onSelectRole? }.
- **Koreksi verifikator:** The duplication is real (StaffUploadScreen 107-144 and StaffPlatformsScreen 88-128). The reason given is wrong, though: the two copies are in different files and Edit's uniqueness check is per file. Inside each file the stepper wrapper class appears once, so Edit matches are not ambiguous. The issue is plain duplicated code with diverging behaviour.

### [P3] staff-caption-limit-unenforced
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:321-331`
- **Status:** confirmed
- **Masalah:** The caption counter shows length / maxChars, but there is no visual warning, no maxLength and no submit block when over the limit. The Brand Guardian 'Caption length & hashtag policy' item on the Platforms screen always shows PASS.
- **Saran perbaikan:** Colour the counter red when caption.length > maxChars. Compute the Brand Guardian caption and hashtag item from the drafts prop (requires passing drafts to StaffPlatformsScreen).

### [P3] staff-hashtag-format-inconsistent
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:74`
- **Status:** confirmed
- **Masalah:** Spaces are stripped only when the input lacks '#'. '#foo bar' is kept with a space, and a lone '#' is accepted as a tag. The duplicate check is case-sensitive, so '#lumbungstudio' and '#LumbungStudio' can both be added. Nothing enforces the 3–7 tag rule or keeping #LumbungStudio, both of which are advertised in BrandGuidelinesScreen.tsx:39-40.
- **Saran perbaikan:** Normalize with '#' + raw.replace(/^#+/, '').replace(/\s+/g, ''), reject a bare '#', and compare duplicates with toLowerCase().

### [P3] staff-remove-tag-hint-wrong
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:340`
- **Status:** confirmed
- **Masalah:** The hint says 'Click tag to remove', but only the small X button removes a tag. The chip itself is a non-interactive <span>.
- **Saran perbaikan:** Change the copy to 'Click × to remove'.

### [P3] staff-toast-timer-leak
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:50-53`
- **Status:** confirmed
- **Masalah:** Each toast starts an uncancelled 3s timeout. A second toast inside 3s is cleared early by the first timer. The Regenerate timeout (63-67) also still fires after unmount.
- **Saran perbaikan:** Store the timer id in a useRef, clearTimeout before setting a new one, and clear it in a useEffect cleanup.

### [P3] staff-revision-banner-hardcoded
- **Lokasi:** `src/screens/StaffSubmissionsScreen.tsx:134-137`
- **Status:** partially-true
- **Masalah:** The banner hard-codes the reviewer 'Bima Santoso' instead of revisionItems[0].reviewer, and always uses plural 'submissions', so it reads '1 submissions need your revision' when there is only one.
- **Saran perbaikan:** Use {revisionItems[0].reviewer} and {revisionItems.length === 1 ? 'submission needs' : 'submissions need'}.
- **Koreksi verifikator:** 'Bima Santoso' and the plural 'submissions' are literals at :134 and :137. However staffSubmissions never changes today, since no code path mutates it, and the seed has exactly 2 Revision rows, both reviewed by Bima. The '1 submissions' text therefore cannot appear yet. It is a latent bug that would show up once submissions start changing.

### [P3] staff-sidebar-badges-hardcoded
- **Lokasi:** `src/components/LayoutShell.tsx:112`
- **Status:** confirmed
- **Masalah:** The sidebar badges 'My submissions 12' and 'Drafts 3' (line 120) are literals. They match INITIAL_STAFF_SUBMISSIONS today but will drift once submissions or drafts are added.
- **Saran perbaikan:** Pass staffSubmissions counts (total and status === 'Draft') from App into LayoutShell as props.

### [P3] staff-tone-strings-duplicated
- **Lokasi:** `src/screens/BrandGuidelinesScreen.tsx:238-259`
- **Status:** partially-true
- **Masalah:** The per-platform tone strings and guidelines are duplicated from mockData INITIAL_AI_DRAFTS.tone and already conflict with it. The TikTok guideline says 'Under 300 characters' while TikTok maxChars is 400. Instagram says '5–6 curated tags' while the rule says 3–7.
- **Saran perbaikan:** Export a PLATFORM_GUIDELINES const from mockData.ts and use it in both places. Align the numbers.
- **Koreksi verifikator:** The duplication is real: the tone strings at BrandGuidelinesScreen.tsx:242/249/256 equal mockData.ts:53/68/82. The TikTok 'Under 300 characters' versus maxChars 400 (mockData.ts:87) is a real conflict. 'Instagram 5-6 curated tags versus the 3-7 rule' is not a conflict, since 5-6 sits inside 3-7 (and LinkedIn 3-5 does too). The real tone conflict is with ALTERNATE_AI_DRAFTS, not INITIAL.

### [P3] staff-success-banner-hardcoded-title
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:139-142`
- **Status:** confirmed
- **Masalah:** The success banner hard-codes the reviewer name and the post title instead of using the edited draft title. 'Bima Santoso' is also literal at lines 39, 258, 466 and 480.
- **Saran perbaikan:** Use ROLE_PROFILES.Head.name and pass the draft title as a prop.

### [P3] staff-login-fake-auth
- **Lokasi:** `src/screens/LoginScreen.tsx:32-44`
- **Status:** confirmed
- **Masalah:** The email and password states are never read. Sign-in only uses selectedRole. The 'SSO enabled' span (251-253) looks clickable but has no handler, and 'Continue with Google' (199) bypasses the form. This is acceptable for a demo but undocumented.
- **Saran perbaikan:** Leave as-is but add a comment marking it as demo auth. Remove cursor-pointer and hover:underline from the SSO span, or turn it into a real button.

### [P3] staff-login-logo-upload-duplicated
- **Lokasi:** `src/screens/LoginScreen.tsx:46-57`
- **Status:** confirmed
- **Masalah:** The FileReader logo-upload handler is copy-pasted in LayoutShell.tsx:206-217. Neither copy validates file size, so a huge image becomes a giant data URL held in state.
- **Saran perbaikan:** Extract a readImageAsDataUrl(file, maxBytes) helper into SharedUI or a utils file and reuse it in both places.

### [P3] staff-a11y-live-regions
- **Lokasi:** `src/screens/StaffUploadScreen.tsx:147-161`
- **Status:** confirmed
- **Masalah:** The toast and the submit success banner (StaffPlatformsScreen.tsx:131-166) appear without role='status' or aria-live. The banner renders at the top of the page while Submit sits in the sticky sidebar, so it can appear off-screen with no scroll.
- **Saran perbaikan:** Add role='status' aria-live='polite' to both. Call window.scrollTo({ top: 0 }) or scrollIntoView after submit.

### [P3] staff-submissions-tab-cast
- **Lokasi:** `src/screens/StaffSubmissionsScreen.tsx:32`
- **Status:** confirmed
- **Masalah:** initialTab is typed as string and blindly cast to TabKey, both here and in the useEffect at line 44. An unknown tab string (e.g. 'Draft' instead of 'Drafts') would make tabCounts[tab] undefined and the filter match nothing. The component keeps duplicate tab state, local plus App activeStaffTab, kept in sync by an effect.
- **Saran perbaikan:** Export TabKey (or a STAFF_TABS const array), type App activeStaffTab and LayoutShell's staffTab option with it, and make the screen fully controlled by the prop (drop the local activeTab and the effect).

### [P3] staff-unused-react-import
- **Lokasi:** `src/screens/StaffSubmissionsScreen.tsx:1`
- **Status:** confirmed
- **Masalah:** The default React import is unused: the jsx is 'react-jsx' and no React.* reference exists in this file. It compiles only because noUnusedLocals is off.
- **Saran perbaikan:** Change to import { useState, useMemo, useEffect } from 'react';

### [P3] staff-brand-guidelines-head-unreachable
- **Lokasi:** `src/components/LayoutShell.tsx:130-156`
- **Status:** confirmed
- **Masalah:** BrandGuidelinesScreen is in the Staff and Admin menus but not the Head menu. The screen jumper (LayoutShell.tsx:431) deliberately keeps the current role for 'brand-guidelines', and the breadcrumb (394) shows the current role. A Head can therefore reach it only through the jumper, and no nav item is highlighted there.
- **Saran perbaikan:** Add a Brand guidelines NavItem to the Head menu if Heads should see it.

### [P3] staff-state-persists-after-signout
- **Lokasi:** `src/components/LayoutShell.tsx:376`
- **Status:** confirmed
- **Masalah:** Sign out only navigates to 'login'. drafts, typoFixed, selectedPlatforms and the submitted queue state persist, so signing back in as Staff shows the typo already fixed. 'New submission' (StaffSubmissionsScreen.tsx:117, sidebar) likewise never resets the draft.
- **Saran perbaikan:** Add a resetStaffFlow() in App (reset drafts to INITIAL_AI_DRAFTS, useAltDraft, typoFixed=false, selectedPlatforms default) and call it on 'New submission' and/or sign-out.

### [P3] staff-platforms-unused-icon-imports
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:10-11`
- **Status:** found-by-verifier
- **Masalah:** Sparkles and ShieldCheck are imported from lucide-react but never used. The App.tsx default React import is also unused. The build passes only because noUnusedLocals is off.
- **Saran perbaikan:** Remove the unused imports.

### [P3] staff-copy-hex-false-success
- **Lokasi:** `src/screens/BrandGuidelinesScreen.tsx:89-93`
- **Status:** found-by-verifier
- **Masalah:** handleCopyHex shows 'Copied' unconditionally. When navigator.clipboard is undefined (insecure context) or writeText rejects (for example clipboard-write blocked inside the Figma Make iframe), the rejection is swallowed and the UI still claims success. The 1.8s timer is also never cleared.
- **Saran perbaikan:** Set copiedHex only in .then(), and show an error state in .catch() or when clipboard is unavailable.

### [P3] staff-login-email-validation-asymmetry
- **Lokasi:** `src/screens/LoginScreen.tsx:239-244`
- **Status:** found-by-verifier
- **Masalah:** The email input is type='email' inside a real <form>, so native validation blocks 'Sign in as X' when the user types a malformed address. The 'Continue with Google' button (:199) and the role cards sign in regardless. Editing the email to another role's address does not change the role. This is demo behaviour, but the demo hides the fact that the email is ignored.
- **Saran perbaikan:** Make the fields read-only demo values, or derive the role from the typed email. Add noValidate or a visible 'demo' hint.

### [P3] staff-schedule-input-no-bounds
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:298-303`
- **Status:** found-by-verifier
- **Masalah:** The datetime-local schedule input has no min attribute or validation, so a past date can be picked. It is unlabeled, and its value is discarded anyway (see staff-schedule-date-dropped).
- **Saran perbaikan:** Add min set to the current datetime and an aria-label. Validate before submit once the value is actually wired through.

## Head screens (37)

### [P1] head-approve-dedupe-noop
- **Lokasi:** `src/App.tsx:190-192`
- **Status:** confirmed
- **Masalah:** Approving never adds a row to the Published table. handleApproveItem skips the insert if any published post has the same title, and every one of the 7 queue titles already exists in INITIAL_PUBLISHED_POSTS (PUB-901 hiring, PUB-899 product launch, PUB-894 11.11 promo, PUB-898 Friday sharing, PUB-897 Q3 case study, PUB-896 team outing, PUB-895 open house).
- **Saran perbaikan:** Dedupe by queue item id instead (add `sourceId` to PublishedPostItem), or drop the duplicate-title seed rows. Generate a unique id, e.g. `PUB-${Date.now()}`.

### [P1] head-approve-no-status-change
- **Lokasi:** `src/App.tsx:188-208`
- **Status:** confirmed
- **Masalah:** An approved item never leaves the queue and never changes status. It stays 'Submitted'/'In review'/'Revision' and can be approved again. QueueItem.status ('Submitted'|'In review'|'Revision', types.ts:45) cannot even represent 'Published'.
- **Saran perbaikan:** In handleApproveItem, remove the item from queueItems (setQueueItems(prev => prev.filter(i => i.id !== item.id))) or widen QueueItem.status to include 'Published' and filter it out of the queue view.

### [P1] head-no-activity-log
- **Lokasi:** `src/App.tsx:173, 176-214`
- **Status:** confirmed
- **Masalah:** Approve, revision and reject write nothing to activityLogs, even though ActivityLogEntry.actionCategory defines 'Approved' | 'Revision' | 'Published'. setActivityLogs is called only in handleSubmitForApproval, so the Admin Activity Log and Dashboard never show Head actions.
- **Saran perbaikan:** Prepend an ActivityLogEntry (person: ROLE_PROFILES.Head.name, personRole: 'Head', actionCategory 'Approved'/'Revision'/'Published') inside handleApproveItem, handleUpdateQueueItemStatus and handleRejectItem.

### [P1] head-no-staff-propagation
- **Lokasi:** `src/App.tsx:69-71, 294-296`
- **Status:** confirmed
- **Masalah:** Head decisions never reach the Staff 'My submissions' screen. staffSubmissions is never updated (its only setter call is a no-op), so MY-201 'We're hiring' stays 'In review' after approve or revision, and revision notes typed by the Head never appear for Staff.
- **Saran perbaikan:** In the approve/revision/reject handlers, find the staffSubmissions row by title (or add a shared submissionId to both types) and set its status to 'Published'/'Revision', revisionNote and updatedAt 'Just now'.

### [P1] head-no-calendar-propagation
- **Lokasi:** `src/App.tsx:188-214`
- **Status:** confirmed
- **Masalah:** Approve, revision and reject do not update calendarPosts. CAL-06 (hiring) stays 'In review' after approval. Conversely, 'Apply suggestion' sets CAL-09 (11.11 promo) to 'Scheduled' while queue item SUB-1040 is still 'Revision'.
- **Saran perbaikan:** Link calendar posts to queue items (add a queueId) and update the status in the same handlers. Keep CAL-09's status unchanged in the suggestion, or only allow it once the item is approved.

### [P2] head-reject-equals-revision
- **Lokasi:** `src/App.tsx:210-214; src/screens/HeadReviewQueueScreen.tsx:123-128`
- **Status:** confirmed
- **Masalah:** Reject sets status to 'Revision', so it is indistinguishable from Request revision, except that it carries no note. The banner says 'Rejected' while the chip shows 'Revision'. A destructive action with no confirmation.
- **Saran perbaikan:** Add a 'Rejected' status (types.ts SubmissionStatus + QueueItem.status + the StatusChip styles map) or remove the item, and add a confirm step.

### [P2] head-approve-no-guards
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:531-536`
- **Status:** confirmed
- **Masalah:** Approve is always enabled: for items in 'Revision', for MEDIUM RISK items, and for the hiring poster while typoFixed=false. The poster then shows 'Aplly now' + 'Typo detected' on the 'live' Published previews.
- **Saran perbaikan:** Disable or confirm when selectedItem.status === 'Revision' || (posterTheme === 'hiring' && !typoFixed), and show the reason.

### [P2] head-ai-check-contradicts-typo
- **Lokasi:** `src/data/mockData.ts:137; src/screens/HeadReviewQueueScreen.tsx:364`
- **Status:** confirmed
- **Masalah:** The static AI check says the typo was resolved, while the poster preview right above it still shows 'Typo detected' when typoFixed is false (the default until Staff clicks fix).
- **Saran perbaikan:** Render that check conditionally from typoFixed, or derive aiChecks for SUB-1042 in App.

### [P2] head-hardcoded-stat-cards
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:149, 162, 175`
- **Status:** partially-true
- **Masalah:** The stat cards hard-code '5 waiting', '2 revisions' and '3 low risk'. They are correct for the seed data but never update after revision or reject. The `counts` memo sitting next to them is not used for these cards.
- **Saran perbaikan:** Compute from items: counts.Submitted + counts['In review'], counts.Revision, items.filter(i => i.riskLevel === 'LOW RISK').length.
- **Koreksi verifikator:** Lines 149, 162 and 175 are hard-coded literals, and `counts` is not used for them. '5 waiting' and '2 revisions' do go stale after a revision or reject. '3 low risk' cannot go stale, because riskLevel is never mutated anywhere. It is still a literal that should be derived.

### [P2] head-hardcoded-sidebar-badge
- **Lokasi:** `src/components/LayoutShell.tsx:136`
- **Status:** confirmed
- **Masalah:** The 'Review queue' sidebar badge is hard-coded to 5. LayoutShell receives no queue data.
- **Saran perbaikan:** Pass a queueCount prop from App (queueItems.filter(i => i.status !== 'Revision').length) into LayoutShell.

### [P2] head-published-initial-fake-approval
- **Lokasi:** `src/App.tsx:64-66; src/screens/PublishedScreen.tsx:112-118`
- **Status:** confirmed
- **Masalah:** latestApprovedItem starts as INITIAL_QUEUE_ITEMS[0] (status 'Submitted'). Opening Published from the sidebar or a notification before approving anything shows 'APPROVED · GASKEUN! – Live' for an item still waiting in the queue. PUB-901 also lists it as published 'Just now'.
- **Saran perbaikan:** Make latestApprovedItem `QueueItem | null` and hide the hero/timeline/previews when it is null, or seed it from a genuinely published item.

### [P2] head-published-hardcoded-platforms
- **Lokasi:** `src/screens/PublishedScreen.tsx:114, 120-122, 141, 96, 186-272`
- **Status:** confirmed
- **Masalah:** The hero badge, subtitle, 'Platforms 2' stat, timeline text and previews always say Instagram + LinkedIn, whatever latestApprovedItem.platforms is. Approving SUB-1040 (Instagram + TikTok) shows a LinkedIn preview with its LinkedIn caption and no TikTok preview. Admin connectedPlatforms (TikTok disconnected) is ignored.
- **Saran perbaikan:** Derive the text from latestApprovedItem.platforms (join, length) and render each preview only if its platform is included. Pass connectedPlatforms in and flag disconnected targets.

### [P2] head-published-hardcoded-timeline
- **Lokasi:** `src/screens/PublishedScreen.tsx:70-99`
- **Status:** confirmed
- **Masalah:** The audit timeline hard-codes times, risk ('LOW RISK (12/100)') and approver. Approving a MEDIUM RISK 48 item still shows LOW RISK 12. The approver name duplicates ROLE_PROFILES.Head.name.
- **Saran perbaikan:** Use `${latestApprovedItem.riskLevel} (${latestApprovedItem.riskScore}/100)` and ROLE_PROFILES.Head.name. Store approvedAt when approving.

### [P2] head-calendar-suggestion-local-flag
- **Lokasi:** `src/screens/HeadCalendarScreen.tsx:51, 137-159`
- **Status:** confirmed
- **Masalah:** suggestionApplied is local state, so after leaving and returning to the calendar the banner offers 'Apply suggestion' again, even though CAL-09 was already moved in App state.
- **Saran perbaikan:** Derive it from props: posts.find(p => p.id === 'CAL-09')?.dayIndex === 1, or lift the flag into App.

### [P2] head-team-static-data
- **Lokasi:** `src/App.tsx:79; src/data/mockData.ts:689-788`
- **Status:** confirmed
- **Masalah:** teamDesigners has no setter, and its counts and latestStatus are hand-written: Rina inReviewCount 2 vs 1 queue item; Sari inReviewCount 1 but her only queue item is 'Revision'. Queue actions never update the team view.
- **Saran perbaikan:** Derive inReviewCount/revisionsCount/latestStatus from queueItems by designer name with useMemo in App, or document them as static.

### [P2] head-team-review-no-context
- **Lokasi:** `src/screens/HeadTeamScreen.tsx:206-210`
- **Status:** confirmed
- **Masalah:** 'Review' on a designer card opens the queue without preselecting that designer or item. HeadReviewQueueScreen has no initialSelectedId/initialDesigner prop, so it always opens on items[0].
- **Saran perbaikan:** Add an optional queue focus state in App (e.g. queueFocusDesigner) and pass it to HeadReviewQueueScreen as the initial designerFilter/selectedId.

### [P2] head-mock-data-inconsistent
- **Lokasi:** `src/data/mockData.ts:180, 404, 438, 198 vs 444, 432 vs 127, 329`
- **Status:** confirmed
- **Masalah:** The seed datasets contradict each other. '11.11 promo teaser' belongs to Sari Wulandari in the queue (180), calendar and team, but to Rina Putri in PUB-894 (404) and in Rina's own submissions (MY-202). The revision notes differ (198 vs 444). Hiring is 'Submitted' in the queue (127) and team (701), 'In review' in staff (432) and calendar (602), and already 'Published Just now' as PUB-901 (329). Staff 'My submissions' (Rina) also lists Dimas's and Tomi's items (MY-203, MY-205).
- **Saran perbaikan:** Pick one canonical record per piece of content (shared id across queue/staff/calendar/published) and align designer, status and note.

### [P2] head-a11y-clickable-div
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:283-294`
- **Status:** confirmed
- **Masalah:** Queue rows are clickable <div>s with no role, tabIndex or key handler, so a keyboard user cannot select a submission to review. The same pattern appears in the LayoutShell notifications (486-528).
- **Saran perbaikan:** Use <button type="button" className="w-full text-left ..."> with aria-pressed={isSelected}.

### [P2] head-revision-note-never-shown
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:337-507; src/App.tsx:154,183`
- **Status:** found-by-verifier
- **Masalah:** QueueItem.revisionNote is written but never read anywhere. The Head review panel never shows the existing revision note (SUB-1040 and SUB-1036 have seed notes) or the note a Head just sent. handleSubmitForApproval also stores the Staff's submission note in revisionNote, so the Staff's note to the reviewer is mislabelled and never shown to the Head.
- **Saran perbaikan:** Add a separate `submissionNote` field for the Staff note. In the review panel, render selectedItem.revisionNote (e.g. 'Last revision note') when present.

### [P2] head-calendar-suggestion-moves-into-past
- **Lokasi:** `src/screens/HeadCalendarScreen.tsx:139, 240; src/App.tsx:220`
- **Status:** found-by-verifier
- **Masalah:** The calendar marks Wed 14 Oct (weekIndex 1, dayIdx 2) as 'Today'. The Gemini suggestion moves '11.11 promo teaser' to Tue 13 Oct 19:00 (dayIndex 1), the day before today, and marks it 'Scheduled'. The AI suggestion schedules a post in the past.
- **Saran perbaikan:** Target a future slot (e.g. dayIndex 3, Thu 15) and update the copy at line 139 to match.

### [P3] head-published-view-live-stub
- **Lokasi:** `src/screens/PublishedScreen.tsx:268-270`
- **Status:** confirmed
- **Masalah:** 'View live post' is styled like a link but is a non-interactive <span>.
- **Saran perbaikan:** Make it a <button> or <a> with a real action, or restyle it as plain text.

### [P3] head-published-table-hardcoded-status
- **Lokasi:** `src/screens/PublishedScreen.tsx:341, 363-370`
- **Status:** confirmed
- **Masalah:** The Status column always renders 'Published'. The 'Upload to live' column shows approvalDuration (the names differ). PublishedPostItem.engagement and posterTheme are never displayed.
- **Saran perbaikan:** Rename the field or the column so they agree, and show engagement or drop it from the type.

### [P3] head-pub-id-generation
- **Lokasi:** `src/App.tsx:195`
- **Status:** confirmed
- **Masalah:** The new published id is `PUB-${900 + prev.length + 1}` → 'PUB-910', out of sequence with the seed (top row is PUB-901). It would collide if rows were ever removed.
- **Saran perbaikan:** Use `PUB-${Date.now()}`, matching the ACT-${Date.now()} convention in App.tsx:161.

### [P3] head-captions-platform-mismatch
- **Lokasi:** `src/data/mockData.ts:187, 202-205, 246, 252-262; src/screens/HeadReviewQueueScreen.tsx:462-465`
- **Status:** confirmed
- **Masalah:** The captions panel lists every key in item.captions, not item.platforms. SUB-1040 shows a LinkedIn caption though it targets Instagram + TikTok. SUB-1038 targets TikTok and its AI check cites a 348-char TikTok caption, but it has no TikTok caption. The `plat as ...` cast hides the mismatch.
- **Saran perbaikan:** Iterate selectedItem.platforms and read captions[p] ?? '(no caption)'. Fix the seed data.

### [P3] head-designer-options-duplicated
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:38-47`
- **Status:** confirmed
- **Masalah:** The designer dropdown list is hard-coded and duplicates names from mockData. A new designer would be unfilterable.
- **Saran perbaikan:** useMemo(() => ['All designers', ...new Set(items.map(i => i.designer))], [items]).

### [P3] head-banner-timeout-race
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:120, 127`
- **Status:** confirmed
- **Masalah:** Banner timers are never cancelled. An earlier timer clears a newer banner early (revision at t=0 with 4s, reject at t=3 → the reject banner disappears at t=4), and timers keep running after unmount.
- **Saran perbaikan:** Keep the timer id in a useRef, clearTimeout before setting a new one, and clear it in a useEffect cleanup.

### [P3] head-revision-default-note
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:113-115`
- **Status:** confirmed
- **Masalah:** Sending an empty revision note silently substitutes a generic hard-coded note instead of asking for input.
- **Saran perbaikan:** Disable 'Send revision request' while the note is empty, or show the default as placeholder/prefill.

### [P3] head-pagination-not-clamped
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:96-99; src/components/SharedUI.tsx:202-204`
- **Status:** partially-true
- **Masalah:** currentPage is reset only on filter changes. If items drop out of filteredItems because a status changed (e.g. on page 2 of 'Revision' after more rejects), currentPage can exceed totalPages: an empty list plus 'Showing 5–4 of 4'. Latent with the current seed counts.
- **Saran perbaikan:** Clamp: const page = Math.min(currentPage, Math.max(1, Math.ceil(filteredItems.length / pageSize))). Or clamp inside PaginationBar.
- **Koreksi verifikator:** The code does not clamp, and PaginationBar would show 'Showing 5–4'. The cited scenario is wrong, though: a reject adds items to the 'Revision' filter rather than removing them. No current action moves an item out of Revision, Submitted and In review never exceed one page (3 and 2 items), and 'All' never shrinks. Fully latent today. P3.

### [P3] head-counts-comment-misleading
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:71-79`
- **Status:** confirmed
- **Masalah:** The comment says counts are 'filtered by search + designer', but the memo counts all items.
- **Saran perbaikan:** Fix the comment, or actually apply search and designer filters before counting.

### [P3] head-a11y-label-unassociated
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:480-489`
- **Status:** confirmed
- **Masalah:** The revision note <label> is not associated with its <textarea> (no htmlFor/id). The feedback banner (184-195) has no role="status"/aria-live. The filter chips across all four screens lack aria-pressed. The search inputs have only a placeholder, no label.
- **Saran perbaikan:** Add id/htmlFor, role="status" on the banner, aria-pressed={active} on chips, and aria-label on search inputs.

### [P3] head-invalid-tailwind-class
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:244`
- **Status:** confirmed
- **Masalah:** `py-0.2` is not a 0.25-step spacing value, so Tailwind v4 likely generates no CSS for it (no-op).
- **Saran perbaikan:** Use py-0.5 or py-px.

### [P3] head-status-union-duplicated
- **Lokasi:** `src/types.ts:45; src/App.tsx:178; src/screens/HeadReviewQueueScreen.tsx:29, 58`
- **Status:** confirmed
- **Masalah:** The literal union 'Submitted' | 'In review' | 'Revision' is repeated in 4 places with no named type, so adding a status (e.g. 'Rejected'/'Published') requires editing all of them. onUpdateItemStatus accepts 'Submitted'/'In review', but the screen only ever passes 'Revision'.
- **Saran perbaikan:** export type QueueStatus = QueueItem['status'] in types.ts and use it everywhere.

### [P3] head-calendar-hardcoded-dates
- **Lokasi:** `src/screens/HeadCalendarScreen.tsx:23-39, 45, 106, 240, 139`
- **Status:** confirmed
- **Masalah:** Weeks, 'This week' = index 1, 'Today' = Wed 14 Oct, and the suggestion copy are all hard-coded. The unused `index` field on WEEKS is dead data.
- **Saran perbaikan:** Keep, but centralise a TODAY constant in mockData. Remove WEEKS[].index or use it.

### [P3] head-unused-react-import
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:1; HeadCalendarScreen.tsx:1; HeadTeamScreen.tsx:1; PublishedScreen.tsx:1`
- **Status:** confirmed
- **Masalah:** The default `React` import is unused (jsx: react-jsx). Harmless because noUnusedLocals is off. PublishedScreen.tsx:20 also has an odd 3-space indent.
- **Saran perbaikan:** import { useState, useMemo } from 'react';

### [P3] head-revision-draft-leaks-between-items
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:66, 285-288`
- **Status:** found-by-verifier
- **Masalah:** Selecting another queue row closes the revision box but does not clear revisionNoteInput. A half-typed note for item A is still in the textarea when the box is reopened for item B, and sending it attaches A's note to B.
- **Saran perbaikan:** Call setRevisionNoteInput('') together with setSelectedId, or keep the drafts keyed by item id.

### [P3] head-selected-item-ignores-filters
- **Lokasi:** `src/screens/HeadReviewQueueScreen.tsx:101-102`
- **Status:** found-by-verifier
- **Masalah:** selectedItem is looked up in all items before filteredItems. After a search, status or designer filter hides the selected row, the detail panel keeps showing it, and Approve, Reject and Revise still act on a submission that is no longer in the visible list.
- **Saran perbaikan:** Prefer filteredItems.find(...) || filteredItems[0], or reset selectedId when it falls out of filteredItems.

### [P3] head-calendar-banner-week-agnostic
- **Lokasi:** `src/screens/HeadCalendarScreen.tsx:128-160`
- **Status:** found-by-verifier
- **Masalah:** The 'Gemini scheduling suggestion' banner about Tue 13 Oct and Sat 17 Oct appears on all three weeks, including 5–11 Oct and 19–25 Oct, where the referenced post is not visible.
- **Saran perbaikan:** Render the banner only when weekIndex === 1, or include a link that jumps to that week.

## Admin screens & mockData (34)

### [P1] admin-data-csv-hash-truncation
- **Lokasi:** `src/screens/AdminActivityLogScreen.tsx:79`
- **Status:** confirmed
- **Masalah:** The CSV export is built as a data: URI encoded with encodeURI, which leaves '#' unescaped. The browser treats everything after the first '#' as a URL fragment, so the downloaded file is cut off. Seed entry ACT-03 contains '#FFE14D', so exporting with the default 'All' filter loses everything after ACT-03's detail (rows ACT-04..ACT-24).
- **Saran perbaikan:** Build the file with new Blob([csv], {type:'text/csv;charset=utf-8'}) and URL.createObjectURL (revoke it afterwards), or at minimum use 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv).

### [P2] admin-data-tiktok-connected-shows-not-connected
- **Lokasi:** `src/screens/AdminConnectedScreen.tsx:57`
- **Status:** partially-true
- **Masalah:** The TikTok entry stores disconnected-state copy in the fields that are only shown when it is connected. After clicking 'Connect TikTok' the card shows a 'Connected' badge next to the footer text 'Not connected', and the auto-publish box says 'Ready to authorize...'.
- **Saran perbaikan:** Give TikTok connected-state copy, e.g. tokenStatus 'OAuth 2.0 healthy · Expires in 90 days' and lastSync 'Synced just now'.
- **Koreksi verifikator:** Verified: TikTok's tokenStatus 'Ready to authorize...' and lastSync 'Not connected' (lines 56-57) are rendered only when isConnected is true (lines 122 and 130). After connecting, the card shows a 'Connected' badge next to 'Not connected'. This is a copy/state inconsistency, not a functional failure, because toggling works and nothing else reads these strings. It is P2, not P1.

### [P2] admin-data-users-empty-page-after-role-change
- **Lokasi:** `src/screens/AdminUsersScreen.tsx:58`
- **Status:** confirmed
- **Masalah:** currentPage is never clamped when filteredUsers shrinks. With role filter 'Staff' (9 users, 2 pages), go to page 2 and change three Staff rows to Head via the row select: the list drops to 6, page 2 renders an empty table, and PaginationBar reads 'Showing 7–6 of 6'.
- **Saran perbaikan:** Compute totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize)) and use safePage = Math.min(currentPage, totalPages) for slicing and in PaginationBar, or reset the page in an effect.

### [P2] admin-data-category-chip-mislabel
- **Lokasi:** `src/screens/AdminActivityLogScreen.tsx:91`
- **Status:** confirmed
- **Masalah:** The 'Category' column passes a mapped status to StatusChip, and StatusChip prints that mapped string as its label. 'Approved' rows read 'Published', 'AI check' rows read 'In review', and 'Admin' rows read 'Draft'. Picking the 'Approved' chip therefore lists rows labelled 'Published'.
- **Saran perbaikan:** Add a dedicated CategoryChip, or extend StatusChip with a separate label prop (style key separate from display text), so the real category name is displayed.

### [P2] admin-data-duplicated-divergent-category-mapping
- **Lokasi:** `src/screens/AdminDashboardScreen.tsx:370`
- **Status:** confirmed
- **Masalah:** The dashboard repeats the category-to-chip mapping inline and disagrees with the activity log's version: it passes 'Admin' through unchanged (StatusChip has no 'Admin' style, so it falls back to the Draft colours with the text 'Admin'), while the activity log turns 'Admin' into 'Draft'. The same entry looks different on the two screens.
- **Saran perbaikan:** Move one category chip component or mapping into SharedUI.tsx and use it on both screens.

### [P2] admin-data-approve-never-adds-published
- **Lokasi:** `src/data/mockData.ts:323`
- **Status:** partially-true
- **Masalah:** All 7 INITIAL_QUEUE_ITEMS titles already appear in INITIAL_PUBLISHED_POSTS (PUB-901, 899, 894, 898, 896, 897, 895). App.handleApproveItem de-duplicates by title, so approving any queue item never adds a published row and the Published table and admin data never change.
- **Saran perbaikan:** De-duplicate by a source id (store queue id on the published item), or rename or remove the overlapping published seed rows so queue items represent new work.
- **Koreksi verifikator:** Verified: all 7 queue titles exist in INITIAL_PUBLISHED_POSTS (1042/901, 1041/899, 1040/894, 1039/898, 1038/896, 1037/897, 1036/895), and App.tsx:191 de-duplicates by title, so approve never prepends a row. For the main demo item ("We're hiring" / PUB-901 'Just now') the de-dupe looks intentional, since PUB-901 is the pre-seeded result of that approval. 'Admin data never change' is wrong framing: no admin screen reads publishedPosts. The issue is a seed-data collision, so P2 rather than P1.

### [P2] admin-data-connection-state-not-propagated
- **Lokasi:** `src/components/LayoutShell.tsx:464`
- **Status:** confirmed
- **Masalah:** connectedPlatforms lives in App but only reaches the two admin screens. The header pill always says 'Instagram & LinkedIn connected', and StaffPlatformsScreen still offers and publishes to disconnected platforms. Disconnecting Instagram has no effect outside the admin pages.
- **Saran perbaikan:** Pass connectedPlatforms to LayoutShell and render the pill text from it; pass it to StaffPlatformsScreen to disable or warn on disconnected platforms.

### [P2] admin-data-admin-actions-not-logged
- **Lokasi:** `src/App.tsx:226`
- **Status:** confirmed
- **Masalah:** Role changes, invites and connect/disconnect never append to activityLogs, and neither do head approve/revise/reject. The seed log shows these as audited events (ACT-13 invitation, ACT-20 OAuth refresh, ACT-23 deactivation), so the 'complete audit trail' stops updating after load. The only appending handler is handleSubmitForApproval.
- **Saran perbaikan:** Add an appendLog(entry) helper in App and call it from each admin and head handler, with person 'Ayu Lestari', personRole 'Admin', actionCategory 'Admin'.

### [P2] admin-data-users-no-delete-deactivate
- **Lokasi:** `src/screens/AdminUsersScreen.tsx:291`
- **Status:** confirmed
- **Masalah:** 'Users CRUD' covers only create (invite) and update (role). The UI cannot deactivate, reactivate, remove, resend or revoke an invite, although the status filter and the 'Deactivated'/'Invite pending' statuses suggest it can. The permission matrix describes managing members that the screen cannot manage.
- **Saran perbaikan:** Add an actions column plus an App handler handleSetUserStatus(id, status), and log it.

### [P2] admin-data-invite-no-validation
- **Lokasi:** `src/App.tsx:232`
- **Status:** partially-true
- **Masalah:** Invite has no duplicate-email check: inviting rina.putri@lumbung.studio creates a second Rina. The id is `USR-${usersList.length + 1}`, which reads a stale closure and would collide if deletion were ever added. Every invitee gets the same avatarBg '#1450E0'. The success toast shows even for duplicates.
- **Saran perbaikan:** Check prev.some(u => u.email.toLowerCase() === email.toLowerCase()) and return an error to the screen; generate ids with Date.now() or a max-id counter; cycle through an avatar palette.
- **Koreksi verifikator:** Duplicate emails are accepted (no check at App.tsx:232-257), every invitee gets the same avatarBg '#1450E0', and the toast always shows. The 'stale closure' claim is wrong: handleInviteUser is re-created on every render and a form cannot submit twice within one render, so usersList.length is current, and 'USR-13' does not collide with the zero-padded seed ids. The id scheme is only fragile if deletion is added later, and the ids are inconsistently padded ('USR-13' vs 'USR-01').

### [P2] admin-data-no-last-admin-guard
- **Lokasi:** `src/screens/AdminUsersScreen.tsx:294`
- **Status:** confirmed
- **Masalah:** Any row's role can change without confirmation, including the only Admin (Ayu Lestari, USR-03), which leaves zero admins. The change also has no effect on the signed-in role, because ROLE_PROFILES and usersList are separate sources of truth.
- **Saran perbaikan:** Block the change when it would remove the last Admin, and add a confirm step for role escalation or demotion.

### [P2] admin-data-dashboard-connected-button-disconnects
- **Lokasi:** `src/screens/AdminDashboardScreen.tsx:247`
- **Status:** confirmed
- **Masalah:** The green 'Connected ✓' control looks like a status badge but is a button that disconnects the platform on a single click, with no confirmation. Its accessible name ('Connected ✓') does not describe the action.
- **Saran perbaikan:** Render a non-interactive status badge and leave Disconnect to the Manage screen, or label it 'Disconnect {name}' with aria-label and a confirm step.

### [P2] admin-data-a11y-unlabelled-inputs
- **Lokasi:** `src/screens/AdminUsersScreen.tsx:147`
- **Status:** confirmed
- **Masalah:** Several text inputs rely only on a placeholder and have no label or aria-label: the invite email (Users:147), the users search (Users:228), the dashboard search (Dashboard:126) and the activity search (ActivityLog:160). The role="switch" buttons (Connected:183, 223) have no accessible name. The filter chips (Users:195, ActivityLog:134) have no aria-pressed. The toasts (Users:179, Connected:77, ActivityLog:119) have no role="status"/aria-live.
- **Saran perbaikan:** Add aria-label to each input and switch (e.g. aria-label="Email notifications"), aria-pressed={active} on the chips, and role="status" on the toast containers.

### [P2] admin-data-cross-dataset-ownership
- **Lokasi:** `src/data/mockData.ts:426`
- **Status:** confirmed
- **Masalah:** INITIAL_STAFF_SUBMISSIONS is Rina Putri's 'My submissions', but it holds titles that every other dataset attributes to other designers: '11.11 promo teaser' (queue/calendar: Sari Wulandari), 'Product launch carousel' (Dimas Arya), 'Studio open house invite' (Tomi Hartono), 'Friday sharing session' (Nadia Kusuma), 'Team outing recap' (Raka Pratama), 'Q3 client case study' (Maya Anggraini). PUB-894 credits '11.11 promo teaser' to Rina, while SUB-1040, CAL-09 and ACT-06 credit Sari. PUB-893 'Year-end greeting card' credits Nadia, while CAL-13 credits Rina.
- **Saran perbaikan:** Decide one owner per title and align all lists; give Rina's submissions distinct titles (e.g. 'Hiring story cut', 'Brand refresh teaser').

### [P2] admin-data-cross-dataset-status
- **Lokasi:** `src/data/mockData.ts:119`
- **Status:** confirmed
- **Masalah:** The same item has contradictory statuses across datasets. "We're hiring: UI/UX Designer" is 'Submitted' (SUB-1042), 'In review' (MY-201, CAL-06 at 14:30) and already published at 14:22 (PUB-901, ACT-01). 'Studio open house invite' is 'Revision' (SUB-1036, MY-205) yet published on 03 Oct (PUB-895). 'Year-end greeting card' is 'Draft' (MY-204, CAL-13) yet published on 28 Sep (PUB-893, ACT-24). 'Team outing recap' is typed 'Carousel' in SUB-1038, 'Video' in MY-207, and a 'video recap' in ACT-22.
- **Saran perbaikan:** Make the published list hold only past posts distinct from current queue items, or rename the duplicates as follow-up editions ('... (Part 2)').

### [P2] admin-data-dashboard-activity-hides-action-label
- **Lokasi:** `src/screens/AdminDashboardScreen.tsx:355-379`
- **Status:** found-by-verifier
- **Masalah:** The dashboard's 'Recent activity' table has an 'Action' column that shows only the mapped category chip and never entry.actionLabel. ACT-01 'Approved & auto-published' and ACT-02 'Approved submission' therefore both appear as 'Published', which hides what actually happened (the activity log screen does show actionLabel).
- **Saran perbaikan:** Render act.actionLabel in the Action column, or add an Event column as AdminActivityLogScreen does.

### [P3] admin-data-csv-unescaped-fields
- **Lokasi:** `src/screens/AdminActivityLogScreen.tsx:67`
- **Status:** confirmed
- **Masalah:** Only targetTitle and detail have their double quotes escaped. timestamp, person and actionLabel are wrapped in quotes without escaping, so any of them containing '"' (e.g. a future label such as 'Fixed "Aplly"') produces a broken CSV.
- **Saran perbaikan:** Add a helper csvCell = (v: string) => `"${v.replace(/"/g,'""')}"` and apply it to every column.

### [P3] admin-data-hardcoded-kpis
- **Lokasi:** `src/screens/AdminDashboardScreen.tsx:61`
- **Status:** partially-true
- **Masalah:** KPI values and pipeline counts and percentages are literals and never react to state. 'Published 19' disagrees with the 9 INITIAL_PUBLISHED_POSTS and with the sum of TEAM publishedCount (27). The pct values do not match the counts (2/19 = 10.5%, shown as 12). The 'Scheduled' status is missing from the pipeline even though seed data contains Scheduled items. Draft/Submitted/In review/Revision happen to match the seed queue but go stale after any approve or revise action.
- **Saran perbaikan:** Pass queueItems, publishedPosts and staffSubmissions into AdminDashboardScreen and derive counts with useMemo; compute pct = count / max * 100; keep the 'Sample data' labels for the rest.
- **Koreksi verifikator:** The KPI and pipeline values are literals (lines 61-102), and the stated arithmetic checks out: TEAM publishedCount sums to 27, 2/19 is about 10.5% but shows as 12, and there is no Scheduled stage. However, every card and the pipeline header are explicitly labelled 'Sample data' (lines 65-89, 111-112, 171-172), so this is deliberate prototype content. Also, Draft=3 matches the staff submissions drafts (MY-204/207/210), not the seed queue, because the queue type has no Draft status. P3.

### [P3] admin-data-platform-meta-duplicated
- **Lokasi:** `src/screens/AdminDashboardScreen.tsx:211`
- **Status:** partially-true
- **Masalah:** Platform handles and icons are hard-coded in three places (dashboard inline array, AdminConnectedScreen `platforms` array, SharedUI PlatformBadge iconMap) instead of coming from mockData. The dashboard array also redundantly combines `as PlatformName` with `as const`.
- **Saran perbaikan:** Export a CONNECTED_ACCOUNTS / PLATFORM_META record from mockData.ts and use it on both screens.
- **Koreksi verifikator:** The duplication is real and the redundant `as PlatformName` with `as const` (lines 214-228) is verified. It undercounts, though: handles and icons are also repeated in StaffPlatformsScreen.tsx:49-69, which makes four copies. P3 is right.

### [P3] admin-data-notif-switch-ignored-by-test
- **Lokasi:** `src/screens/AdminConnectedScreen.tsx:200`
- **Status:** confirmed
- **Masalah:** The notification switches are local state that resets on every visit, and 'Send test' shows a success toast even when that channel's switch is off. Nothing is sent.
- **Saran perbaikan:** Disable 'Send test' when the switch is off; lift the switch state to App if it should persist.

### [P3] admin-data-toast-timer-race
- **Lokasi:** `src/screens/AdminUsersScreen.tsx:69`
- **Status:** confirmed
- **Masalah:** Toast timers are never cleared. A second invite within 3.5s is hidden early by the first timer, and timers keep firing after unmount. The same pattern appears in AdminConnectedScreen.tsx:64 and AdminActivityLogScreen.tsx:88.
- **Saran perbaikan:** Keep the timer id in a useRef, clear it before setting a new one, and clear it in a useEffect cleanup.

### [P3] admin-data-dashboard-top5-unsorted
- **Lokasi:** `src/screens/AdminDashboardScreen.tsx:45`
- **Status:** confirmed
- **Masalah:** 'Workspace members (Top 5)' is simply the first 5 array entries, unsorted. The subtitle says 'Active designers...', yet after an invite the 'Invite pending' user is prepended and becomes the first card. Deactivated users can also appear when searching.
- **Saran perbaikan:** Filter to status === 'Active' and sort by submissionsCount, or rename the heading to 'Recently added members'.

### [P3] admin-data-team-counts-mismatch
- **Lokasi:** `src/data/mockData.ts:697`
- **Status:** confirmed
- **Masalah:** Rina's TEAM stats (inReviewCount 2, revisionsCount 1, publishedCount 6) disagree with her own submissions list, which has 2 In review, 2 Revision (MY-202, MY-205) and 3 Published (MY-209, 211, 212). TEAM publishedCount sums to 27 against 9 published posts and the dashboard's '19'. Users submissionsCount sums to 115 against the dashboard's 'Submissions 24'.
- **Saran perbaikan:** Derive the counts from datasets in a selector, or hand-align the numbers and note in a comment which numbers must match.

### [P3] admin-data-avatar-color-collisions
- **Lokasi:** `src/data/mockData.ts:896`
- **Status:** confirmed
- **Masalah:** Avatar colours disagree for the same person across datasets: Tomi is '#52607E' in USERS but '#0B1F4D' in TEAM and in the queue's designerColor. Several different people share a colour and initials: Rina and Raka are both 'RP'; Nadia and Intan are both '#146C3C'; Raka and Ayu are both '#4C3D7A'; Sari and Fajar are both '#7A5300'; Bima and Tomi(team) are both '#0B1F4D'. Avatars are ambiguous.
- **Saran perbaikan:** Define one PEOPLE record (name, initials, colour, email) in mockData and reference it from every dataset.

### [P3] admin-data-token-expiry-drift
- **Lokasi:** `src/screens/AdminConnectedScreen.tsx:48`
- **Status:** confirmed
- **Masalah:** ACT-20 says the LinkedIn token was renewed on 08 Oct for 90 days, which leaves about 84 days on the implied current date of 14 Oct, but the card says 82 days. USR-11 says 'Invited 2 days ago' while ACT-13 shows the invite on 13 Oct (1 day earlier). These are small cross-dataset date drifts.
- **Saran perbaikan:** Change the copy to 'Expires in 84 days' and 'Invited 1 day ago', or move the ACT dates.

### [P3] admin-data-poster-theme-mismatch
- **Lokasi:** `src/data/mockData.ts:421`
- **Status:** partially-true
- **Masalah:** PUB-893 'Year-end greeting card' uses posterTheme 'product', so PosterGraphic would render the title 'Product launch carousel'. PUB-895 and SUB-1036 (open house) use 'batik', which renders 'Heritage & Craft Series'. PublishedPostItem.posterTheme is typed as `string` while QueueItem uses a union, so typos are not caught.
- **Saran perbaikan:** Export a PosterTheme union type, use it in both interfaces, and add 'greeting' / 'openhouse' themes to PosterGraphic or choose the closest existing theme.
- **Koreksi verifikator:** PublishedPostItem.posterTheme is never rendered: PublishedScreen passes latestApprovedItem.posterTheme (a QueueItem) to PosterGraphic, and no table cell uses post.posterTheme. So PUB-893's 'product' and PUB-895's 'batik' are dead data, and the claim that PosterGraphic 'would render' them is moot. The SUB-1036 part is real: HeadReviewQueueScreen:363 and PublishedScreen (after approval) render 'Heritage & Craft Series' for the open house invite. The loose `string` type at types.ts:71 is verified.

### [P3] admin-data-system-role-unused
- **Lokasi:** `src/types.ts:127`
- **Status:** confirmed
- **Masalah:** ActivityLogEntry.personRole allows 'System', but no seed or runtime entry uses it. ACT-14 'Auto-published scheduled post' is attributed to Bima/Head even though it is an automatic action.
- **Saran perbaikan:** Use person 'GasKeun Scheduler' with personRole 'System' for automatic publishes, or drop 'System' from the type.

### [P3] admin-data-unused-react-import
- **Lokasi:** `src/screens/AdminDashboardScreen.tsx:1`
- **Status:** confirmed
- **Masalah:** `React` is imported but never used in AdminDashboardScreen and AdminActivityLogScreen (jsx: react-jsx). This is harmless because tsconfig has no noUnusedLocals, but `tsc --noUnusedLocals` flags it.
- **Saran perbaikan:** Change to `import { useState, useMemo } from 'react';`. Keep it in AdminUsersScreen (uses React.FormEvent) and AdminConnectedScreen (uses React.ReactNode), or switch those to type imports.

### [P3] admin-data-status-filter-type-duplicated
- **Lokasi:** `src/screens/AdminUsersScreen.tsx:29`
- **Status:** confirmed
- **Masalah:** The status union is written out by hand twice (useState generic and the onChange cast) instead of being derived from MemberUserItem['status'], so adding a status to the type will not update the filter.
- **Saran perbaikan:** type StatusFilter = 'All statuses' | MemberUserItem['status']; and use it in both places.

### [P3] admin-data-no-access-control
- **Lokasi:** `src/components/LayoutShell.tsx:431`
- **Status:** partially-true
- **Masalah:** The admin screens are not role-gated. The screen jumper and the header pill call onSelectRole('Admin') automatically, and App renders any currentScreen whatever currentRole is. The permission matrix in AdminUsersScreen is therefore decorative. This is probably intended for a prototype, but a model editing the matrix may assume it is enforced.
- **Saran perbaikan:** Document this as prototype behaviour. If gating is needed, check ROLE_PROFILES / a permissions map in App before rendering each screen.
- **Koreksi verifikator:** Verified: LayoutShell:431-434 and 458 auto-switch the role, and App renders whatever currentScreen is set without a role check. This is clearly intended prototype or demo-jumper behaviour, as the issue itself concedes, so it is a documentation note (P3) rather than a P2 defect.

### [P3] admin-data-users-rolecount-ignores-filters
- **Lokasi:** `src/screens/AdminUsersScreen.tsx:35-42`
- **Status:** found-by-verifier
- **Masalah:** The role chip counts are computed from the full users array and ignore the status filter and search. With status 'Deactivated' selected, the 'Staff' chip still shows 9 while the table lists 1 row, so the badge and the table disagree.
- **Saran perbaikan:** Either compute the counts from users filtered by status and search but not by role, or label the badges as totals.

### [P3] admin-data-submit-log-empty-platforms
- **Lokasi:** `src/App.tsx:171`
- **Status:** found-by-verifier
- **Masalah:** The only runtime log entry records `Platforms: ${selectedPlatforms.join(', ')}`. If no platform is selected this becomes 'Platforms: ' (empty), while the queue item on line 148 falls back to ['Instagram','LinkedIn']. The audit row then disagrees with what was actually queued.
- **Saran perbaikan:** Compute the effective platforms once and use that value for both the queue item and the log detail.

### [P3] admin-data-csv-no-bom
- **Lokasi:** `src/screens/AdminActivityLogScreen.tsx:75-77`
- **Status:** found-by-verifier
- **Masalah:** The CSV has no UTF-8 BOM, and seed data contains non-ASCII characters ('→' in ACT-03, '—' elsewhere). Excel on Windows opens BOM-less UTF-8 CSVs as ANSI and garbles these characters. This adds to the '#' truncation bug.
- **Saran perbaikan:** When switching to a Blob, prepend '﻿' to the CSV text.

### [P3] admin-data-role-editable-for-deactivated-and-pending
- **Lokasi:** `src/screens/AdminUsersScreen.tsx:292-303`
- **Status:** found-by-verifier
- **Masalah:** The per-row role select is enabled for Deactivated (USR-12) and Invite pending (USR-11) members. You can 'promote' a deactivated account to Admin, which contradicts ACT-23's 'revoked publishing permissions'.
- **Saran perbaikan:** Disable the select, or show the role read-only, when member.status === 'Deactivated'.

## Tooling & build (15)

### [P2] tooling-format-dashdash
- **Lokasi:** `.figma/make/format:4`
- **Status:** confirmed
- **Masalah:** The format wrapper forwards a literal `--` to oxfmt. oxfmt then treats every following flag as a path, so check or list modes silently become write mode.
- **Saran perbaikan:** Do not edit the platform script. Locally, call the binary directly: `pnpm exec oxfmt --check <path>` or `node_modules/.bin/oxfmt --list-different <path>`. Never pass flags through `pnpm run format --`.

### [P2] tooling-format-scope
- **Lokasi:** `package.json:10`
- **Status:** partially-true
- **Masalah:** `pnpm format` without arguments formats the entire working directory, node_modules included. There is no .oxfmtignore, and the folder is not a git repo, so .gitignore is not applied.
- **Saran perbaikan:** Only ever run oxfmt with explicit paths (e.g. `pnpm exec oxfmt src/screens/Foo.tsx`), or change the script to `oxfmt src` if package.json edits are acceptable. Remember that editing package.json triggers the platform reinstall.
- **Koreksi verifikator:** Confirmed read-only: `oxfmt --list-different` with no path printed 3024 lines, 2924 of them under node_modules, and exited 2 on .d.ts parse errors. No .oxfmtignore or .prettierignore exists, and this folder is not a git repo. `oxfmt --help` says: 'If not provided, current working directory is used.' Inside Figma Make the folder is probably a git repo, so .gitignore may apply there; the problem is mostly local. The suggested fix is also flawed: if the script becomes `oxfmt src`, the platform wrapper `pnpm run format -- "$@"` runs `oxfmt src -- file.tsx`, which reformats ALL of src on every platform format call. It is a footgun, not an app bug, so P2.

### [P2] tooling-src-unformatted
- **Lokasi:** `src/**/*.ts(x), vite.config.ts`
- **Status:** partially-true
- **Masalah:** None of the 20 source files (plus vite.config.ts) match oxfmt output. Formatting any file rewrites it wholesale, e.g. flipping quotes to double, which buries real changes in noise.
- **Saran perbaikan:** Do not run the formatter as part of feature edits. Match the existing hand style: single quotes, semicolons, 2-space indent, trailing commas in multiline lists.
- **Koreksi verifikator:** Confirmed: oxfmt lists all 20 src TS/TSX files plus vite.config.ts. However, the suggested 'hand style' is wrong. The codebase is not uniformly semicolon-terminated: src/main.tsx and vite.config.ts use no semicolons (`import React from 'react'`), while App.tsx and the screens do (`import React, { useState } from 'react';`). The advice should be 'match the style of the file being edited'. Also, if Figma Make runs .figma/make/format on edited files automatically, files will be reformatted there regardless.

### [P2] tooling-build-no-typecheck
- **Lokasi:** `package.json:8`
- **Status:** confirmed
- **Masalah:** The build script is plain `vite build`, which strips types without checking them. A type error can pass the build and the Figma deploy. There is no typecheck, lint or test script.
- **Saran perbaikan:** After every edit run `pnpm exec tsc --noEmit -p .` manually (currently exits 0). Optionally add a "typecheck" script.

### [P2] tooling-site-title-missing
- **Lokasi:** `.figma/make/site.json:1-10 (consumed at vite.config.ts:89)`
- **Status:** confirmed
- **Masalah:** site.json has no title, so the browser tab and og:title read 'Figma Make App' instead of GasKeun.
- **Saran perbaikan:** Add "title": "GasKeun" (and "language" if the UI is not English) to .figma/make/site.json. This is a supported config key, not a code change.

### [P2] tooling-format-fix-conflicts-with-wrapper
- **Lokasi:** `.figma/make/format:4 + package.json:10`
- **Status:** found-by-verifier
- **Masalah:** Any change to the `format` script that adds a default path (the first agent suggested `oxfmt src`) combines with the platform wrapper. Every platform-invoked format of a single file would then reformat the whole src tree. The two files must be considered together.
- **Saran perbaikan:** Leave package.json `format` as plain `oxfmt`. Restrict scope with an ignore file (if oxfmt supports one) or by always passing explicit paths.

### [P3] tooling-unused-imports
- **Lokasi:** `src/screens/StaffPlatformsScreen.tsx:10-11; src/App.tsx:1 and 8 screen files line 1`
- **Status:** confirmed
- **Masalah:** There are unused imports that strict mode does not flag, because noUnusedLocals and noUnusedParameters are off.
- **Saran perbaikan:** Remove Sparkles and ShieldCheck from the lucide import. Remove the default `React` import only in files that never reference `React.` (keep the named hooks).

### [P3] tooling-alias-unused
- **Lokasi:** `vite.config.ts:30; tsconfig.json:10-12`
- **Status:** confirmed
- **Masalah:** The '@' -> src alias is configured in both Vite and TS, but no file uses it. Every import is relative.
- **Saran perbaikan:** Keep relative imports for consistency. Do not mix in '@/...' unless the whole codebase is migrated.

### [P3] tooling-reduced-motion-ignored
- **Lokasi:** `.figma/make/site.json:8; vite.config.ts:72-74; src/index.css:26,29-33,41`
- **Status:** partially-true
- **Masalah:** site.json sets accessibility.ignoreReducedMotion, but that key is not in the FigmaSiteConfiguration type and the plugin never reads it. No code in src honours prefers-reduced-motion, while index.css has hover transforms and transitions.
- **Saran perbaikan:** Add `@media (prefers-reduced-motion: reduce) { .gaskeun-btn-primary, .gaskeun-btn-secondary { transition: none; transform: none; } }` in src/index.css, or use Tailwind motion-reduce: variants.
- **Koreksi verifikator:** The FigmaSiteConfiguration type (:72-74) only has addBypassLinks, and the plugin never reads ignoreReducedMotion. No prefers-reduced-motion or motion-reduce code exists in src. But the cited lines are wrong: the hover transform is at index.css:29-33, not 38-42, and transitions are at :26 and :41. There is also one `animate-spin` (StaffUploadScreen.tsx:263). The `figma make deploy` CLI may read site.json itself and act on this key, which cannot be verified locally, so 'never read' holds only for the Vite plugin. The impact is tiny: a 1px translate and transitions of 0.15-0.18s.

### [P3] tooling-toolchain-drift
- **Lokasi:** `.mise.toml:2-3`
- **Status:** confirmed
- **Masalah:** The platform pins node 22 and pnpm 10.34.3, but this Windows machine runs node v25.9.0 and pnpm 11.25.0. package.json has neither engines nor packageManager, so nothing warns about the mismatch. It works today: lockfile v9.0, and vite 8 requires node ^20.19 || >=22.12.
- **Saran perbaikan:** Avoid features newer than Node 22. If install behaviour differs, use `npx pnpm@10.34.3 install`. Do not commit lockfile churn produced by pnpm 11 without checking it.

### [P3] tooling-agents-md-drift
- **Lokasi:** `AGENTS.md:5-10,16-22,28,41`
- **Status:** partially-true
- **Masalah:** AGENTS.md is the generic scaffold text. It says the dev server is always running (true only inside Figma Make), lists only main.tsx/App.tsx/index.css, and says to export components as default exports. LayoutShell and all of SharedUI use named exports, while the screens use default exports.
- **Saran perbaikan:** Follow the existing pattern: screens use `export default function XScreen`, while components/SharedUI and LayoutShell use named `export const`. Do not convert existing exports, because every import site would break.
- **Koreksi verifikator:** The substance is confirmed. AGENTS.md:41 says 'Export components as default exports.', while SharedUI.tsx (:14-284) and LayoutShell.tsx:79 use named `export const`, and the screens and App use `export default function`. The cited range AGENTS.md:47-50 does not exist; the file ends at line 41. More drift the report missed: AGENTS.md:28 says 'TypeScript 5.7', but 5.9.3 is installed.

### [P3] tooling-strictport-lan
- **Lokasi:** `vite.config.ts:34-36,44-45`
- **Status:** confirmed
- **Masalah:** On Windows the dev server binds 0.0.0.0, which exposes it on the LAN and can trigger a firewall prompt. Because of strictPort it exits if 8443 is taken, instead of picking another port.
- **Saran perbaikan:** Locally set env vars instead of editing the config: `$env:FIGMA_DEV_SERVER_HOST='127.0.0.1'; $env:PORT='5173'; pnpm dev`.

### [P3] tooling-install-unfrozen-lockfile
- **Lokasi:** `.figma/make/install:4`
- **Status:** found-by-verifier
- **Masalah:** The platform install runs with `--no-frozen-lockfile`, and every dependency uses a caret range (e.g. `"vite": "^8.0.5"`, `"lucide-react": "^1.56.0"`). Any package.json edit re-resolves silently and can bump versions. Combined with local pnpm 11 versus platform pnpm 10, the lockfile can churn without notice.
- **Saran perbaikan:** Review the pnpm-lock.yaml diff after any dependency change, and use the pinned pnpm 10.34.3 when regenerating it.

### [P3] tooling-robots-noindex
- **Lokasi:** `.figma/make/site.json:3-5; vite.config.ts:100,136-137`
- **Status:** found-by-verifier
- **Masalah:** site.json sets robots.index=false. The plugin then emits robots.txt with `Disallow: /` and a `noindex, nofollow` meta tag on every build and deploy. That is probably intentional for an internal approval tool, but anyone expecting a public landing page should know that deploys are hidden from search engines.
- **Saran perbaikan:** Leave it as is unless public indexing is desired. To allow indexing, set robots.index to true in site.json.

### [P3] tooling-bash-scripts-windows
- **Lokasi:** `.figma/make/dev, install, deploy, deploy-preview, format, analyze-routes, langserver (line 1)`
- **Status:** found-by-verifier
- **Masalah:** All platform scripts are bash (`#!/usr/bin/env bash`, `set -euo pipefail`) and call platform-only CLIs (`figma make deploy`, `figma-analyze`). On this Windows machine, deploy, deploy-preview and analyze-routes cannot work locally. Only the `pnpm` scripts (dev/build/preview) are usable, and AGENTS.md's 'dev server is already running' does not apply locally.
- **Saran perbaikan:** Locally, run `pnpm dev` / `pnpm build` / `pnpm exec tsc --noEmit -p .` directly and do not invoke the .figma/make scripts.
