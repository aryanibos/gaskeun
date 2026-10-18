# Referensi Komponen GasKeun

Dokumen ini memetakan seluruh komponen yang dipakai aplikasi GasKeun: `LayoutShell`, sembilan export `SharedUI`, dan 13 layar. Nama komponen, tipe props, nilai default, dan perilaku diambil langsung dari `src/components/` dan `src/screens/`.

- `SharedUI.tsx` dan `LayoutShell.tsx` memakai named export; setiap layar memakai default export `XScreen`.
- Impor antar-folder memakai path relatif, misalnya `'../components/SharedUI'`.

## 1. Peta komponen

| Komponen | File | Export | Props utama | Dipakai oleh |
|---|---|---|---|---|
| `LayoutShell` | `src/components/LayoutShell.tsx` | named `LayoutShell`, `ALL_SCREENS_LIST` | `currentRole`, `currentScreen`, `onSelectRole`, `onNavigate`, `customLogoUrl`, `onUploadLogo`, `activeStaffTab?`, `children` | `App.tsx`, semua layar kecuali `login` |
| `Instagram` | `src/components/SharedUI.tsx` | named | `size?`, `className?` | Admin Connected, Admin Dashboard, Brand Guidelines, Published, Staff Platforms, Staff Upload, `PlatformBadge` |
| `Linkedin` | `src/components/SharedUI.tsx` | named | `size?`, `className?` | Admin Connected, Admin Dashboard, Brand Guidelines, Published, Staff Platforms, Staff Upload, `PlatformBadge` |
| `GaskeunLogo` | `src/components/SharedUI.tsx` | named | `size?`, `customLogoUrl?`, `onUploadLogo?`, `allowUploadHint?` | `LoginScreen`, `LayoutShell` |
| `GeminiSparkleTile` | `src/components/SharedUI.tsx` | named | `size?` | Brand Guidelines, Head Calendar, Head Review Queue, Head Team, Staff Platforms, Staff Upload |
| `StatusChip` | `src/components/SharedUI.tsx` | named | `status` | Admin Activity Log, Admin Dashboard, Admin Users, Head Calendar, Head Review Queue, Head Team, Published, Staff Submissions |
| `PlatformBadge` | `src/components/SharedUI.tsx` | named | `platform`, `compact?` | Head Calendar, Head Review Queue, Published, Staff Submissions |
| `PaginationBar` | `src/components/SharedUI.tsx` | named | `currentPage`, `totalItems`, `pageSize`, `onPageChange` | Admin Activity Log, Admin Users, Head Review Queue, Head Team, Published, Staff Submissions |
| `EmptyFilterState` | `src/components/SharedUI.tsx` | named | `message?`, `onReset` | Admin Activity Log, Admin Dashboard, Admin Users, Head Calendar, Head Review Queue, Head Team, Published, Staff Submissions |
| `PosterGraphic` | `src/components/SharedUI.tsx` | named | `theme?`, `typoFixed?`, `compact?` | Head Review Queue, Published, Staff Platforms, Staff Upload |
| `LoginScreen` | `src/screens/LoginScreen.tsx` | default | `selectedRole`, `onSelectRole`, `onSignIn`, `customLogoUrl`, `onUploadLogo` | `App.tsx` |
| `StaffUploadScreen` | `src/screens/StaffUploadScreen.tsx` | default | `drafts`, `onUpdateDraft`, `onRegenerateDraft`, `typoFixed`, `onSaveDraft`, `onNavigate` | `App.tsx` |
| `StaffPlatformsScreen` | `src/screens/StaffPlatformsScreen.tsx` | default | `selectedPlatforms`, `onTogglePlatform`, `typoFixed`, `onFixTypo`, `onSubmitForApproval`, `onNavigate`, `onSelectRole` | `App.tsx` |
| `HeadReviewQueueScreen` | `src/screens/HeadReviewQueueScreen.tsx` | default | `items`, `onUpdateItemStatus`, `onApproveItem`, `onRejectItem`, `onNavigate`, `typoFixed` | `App.tsx` |
| `PublishedScreen` | `src/screens/PublishedScreen.tsx` | default | `publishedPosts`, `latestApprovedItem`, `typoFixed` | `App.tsx` |
| `AdminDashboardScreen` | `src/screens/AdminDashboardScreen.tsx` | default | `users`, `activities`, `connectedPlatforms`, `onToggleConnect`, `onNavigate` | `App.tsx` |
| `StaffSubmissionsScreen` | `src/screens/StaffSubmissionsScreen.tsx` | default | `submissions`, `initialTab?`, `onTabChange?`, `onNavigate` | `App.tsx` |
| `BrandGuidelinesScreen` | `src/screens/BrandGuidelinesScreen.tsx` | default | tidak ada props | `App.tsx` |
| `HeadCalendarScreen` | `src/screens/HeadCalendarScreen.tsx` | default | `posts`, `onApplySuggestion` | `App.tsx` |
| `HeadTeamScreen` | `src/screens/HeadTeamScreen.tsx` | default | `designers`, `onNavigate` | `App.tsx` |
| `AdminUsersScreen` | `src/screens/AdminUsersScreen.tsx` | default | `users`, `onChangeUserRole`, `onInviteUser` | `App.tsx` |
| `AdminConnectedScreen` | `src/screens/AdminConnectedScreen.tsx` | default | `connectedPlatforms`, `onToggleConnect` | `App.tsx` |
| `AdminActivityLogScreen` | `src/screens/AdminActivityLogScreen.tsx` | default | `logs` | `App.tsx` |

## 2. Komponen `SharedUI`

Semua komponen di bawah adalah named export dari `src/components/SharedUI.tsx` dan bertipe `React.FC`.

### 2.1 `Instagram`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `size` | `number` | `16` | tidak |
| `className` | `string` | `''` | tidak |

Perilaku: merender SVG 24×24 dengan `stroke="currentColor"`, `strokeWidth="2"`, dan `fill="none"`. `size` mengatur `width` dan `height`; warna diambil dari `className` lewat `text-*`.

```tsx
import { Instagram } from '../components/SharedUI';

export function InstagramIcon() {
  return <Instagram size={16} className="text-[#E1306C]" />;
}
```

Catatan: ini ikon custom, bukan dari `lucide-react`. Karena `fill="none"`, warna hanya mengikuti `stroke` (`currentColor`); tanpa `className`, ikon mewarisi warna teks induk. Tidak ada `aria-label` atau `<title>`.

### 2.2 `Linkedin`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `size` | `number` | `16` | tidak |
| `className` | `string` | `''` | tidak |

Perilaku: sama seperti `Instagram`, dengan path ikon LinkedIn. Warna khas memakai `text-[#0A66C2]`.

```tsx
import { Linkedin } from '../components/SharedUI';

export function LinkedinIcon() {
  return <Linkedin size={14} className="text-[#0A66C2]" />;
}
```

Catatan: nama export adalah `Linkedin` (huruf `i` kecil), sedangkan nilai `PlatformName` adalah `'LinkedIn'` (huruf `I` besar). Salah casing pada import akan gagal kompilasi.

### 2.3 `GaskeunLogo`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `size` | `34 \| 48 \| number` | `34` | tidak |
| `customLogoUrl` | `string \| null` | `undefined` | tidak |
| `onUploadLogo` | `(url: string) => void` | `undefined` | tidak |
| `allowUploadHint` | `boolean` | `undefined` | tidak |

Perilaku: bila `customLogoUrl` berisi string, komponen merender `<img>` dengan `object-cover` dan `alt="Gaskeun Logo"`. Bila tidak, komponen merender tile gradien `135deg, #1450E0 0%, #1A5BFF 52%, #08D9F0 100%` berisi huruf G putih dan aksen centang lime. Radius sudut adalah `14` saat `size === 48`, selain itu `10`.

```tsx
import { GaskeunLogo } from '../components/SharedUI';

export function BrandMark({ logoUrl }: { logoUrl: string | null }) {
  return <GaskeunLogo size={48} customLogoUrl={logoUrl} />;
}
```

Catatan: `onUploadLogo` dan `allowUploadHint` dideklarasikan di interface tetapi tidak dibaca di body komponen. Unggah logo yang sebenarnya dilakukan `LayoutShell` dan `LoginScreen` lewat `<input type="file">` tersembunyi dan `FileReader.readAsDataURL`. `customLogoUrl` adalah data URL di state `App.tsx`, sehingga hilang saat reload. Fallback (tanpa URL) memakai `aria-label`, sedangkan `<img>` memakai `alt`.

### 2.4 `GeminiSparkleTile`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `size` | `'sm' \| 'md'` | `'md'` | tidak |

Perilaku: tile gradien `135deg, #1450E0 0%, #08D9F0 100%` dengan ikon `Sparkles`. `sm` berukuran `28×28` (`w-7 h-7 rounded-lg`, ikon 15), `md` berukuran `36×36` (`w-9 h-9 rounded-xl`, ikon 18).

```tsx
import { GeminiSparkleTile } from '../components/SharedUI';

export function GeminiNote() {
  return (
    <div className="gaskeun-ai-panel p-4 flex items-center gap-2.5">
      <GeminiSparkleTile size="sm" />
      <p className="text-xs font-extrabold text-[#0B1F4D]">Gemini pre-check</p>
    </div>
  );
}
```

Catatan: tidak menerima `className`, sehingga ukuran dan warna tidak bisa ditimpa dari luar. Komponen murni dekoratif dan tidak menyediakan teks alternatif. Label "Gemini" adalah simulasi, bukan panggilan API.

### 2.5 `StatusChip`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `status` | `SubmissionStatus \| string` | tidak ada | ya |

Perilaku: pill dengan dot berwarna. Gaya diambil dari map internal; status yang tidak dikenal memakai gaya `Draft`, tetapi teksnya tetap dicetak apa adanya.

| Status | Latar | Teks | Dot |
|---|---|---|---|
| `Submitted` | `#E6EFFF` | `#0E3AAE` | `#1450E0` |
| `In review` | `#EDE7FA` | `#4C3D7A` | `#6D28D9` |
| `Revision` | `#FFF4D6` | `#7A5300` | `#D97706` |
| `Published` | `#E5F5EC` | `#146C3C` | `#16A34A` |
| `Draft` | `#EEF2F9` | `#0B1F4D` | `#52607E` |
| `Scheduled` | `#E0F7FA` | `#006064` | `#0891B2` |
| `Active` | `#E5F5EC` | `#146C3C` | `#16A34A` |
| `Invite pending` | `#FFF4D6` | `#7A5300` | `#D97706` |
| `Deactivated` | `#EEF2F9` | `#52607E` | `#94A3B8` |

```tsx
import { StatusChip } from '../components/SharedUI';
import { SubmissionStatus } from '../types';

export function StatusCell({ status }: { status: SubmissionStatus }) {
  return <StatusChip status={status} />;
}
```

Catatan: tipe `string` membuat salah ketik lolos kompilasi dan diam-diam memakai gaya Draft. Status `Active`, `Invite pending`, dan `Deactivated` bukan bagian dari `SubmissionStatus`, tetapi diterima lewat `string`. Warna dipasang lewat `style` inline, sehingga kelas `bg-*` atau `text-*` dari luar tidak menang. Menambah status queue baru harus disertai entri di map ini.

### 2.6 `PlatformBadge`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `platform` | `PlatformName` | tidak ada | ya |
| `compact` | `boolean` | `false` | tidak |

Perilaku: badge abu-abu `#F5F7FC` dengan border `#E6ECF5`. Ikon: Instagram `#E1306C`, LinkedIn `#0A66C2`, TikTok memakai ikon `Video` lucide berwarna `#0B1F4D`. `compact` menyembunyikan label teks dan menyisakan ikon.

```tsx
import { PlatformBadge } from '../components/SharedUI';
import { PlatformName } from '../types';

export function PlatformRow({ platforms }: { platforms: PlatformName[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {platforms.map((p) => (
        <PlatformBadge key={p} platform={p} compact />
      ))}
    </div>
  );
}
```

Catatan: TikTok tidak punya ikon brand di `lucide-react` v1, sehingga memakai `Video`. Cast paksa di luar union membuat `iconMap[platform]` menjadi `undefined`; label tetap tampil bila `compact` tidak diaktifkan.

### 2.7 `PaginationBar`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `currentPage` | `number` | tidak ada | ya |
| `totalItems` | `number` | tidak ada | ya |
| `pageSize` | `number` | tidak ada | ya |
| `onPageChange` | `(page: number) => void` | tidak ada | ya |

Perilaku: menghitung `totalPages = Math.max(1, Math.ceil(totalItems / pageSize))`, lalu menampilkan rentang `startItem–endItem`, tombol Prev, seluruh nomor halaman, dan Next. Prev nonaktif di halaman pertama, Next nonaktif di halaman terakhir. Tombol aktif memakai `#1450E0`.

```tsx
import { PaginationBar } from '../components/SharedUI';

export function TableFooter({ page, total, size, onPage }: {
  page: number; total: number; size: number; onPage: (p: number) => void;
}) {
  return (
    <PaginationBar currentPage={page} totalItems={total} pageSize={size} onPageChange={onPage} />
  );
}
```

Catatan: komponen tidak membatasi `currentPage` dan tidak melakukan clamp. Setiap perubahan pencarian atau filter di layar induk harus memanggil `setCurrentPage(1)`. `pageSize` harus lebih besar dari `0`; nilai `0` menghasilkan `Infinity` dan `Array.from` melempar `RangeError`. Tidak ada elipsis, sehingga jumlah halaman besar akan merender semua tombol. Saat `totalItems` adalah `0`, tampilan menjadi `Showing 0–0 of 0` dengan satu tombol halaman.

### 2.8 `EmptyFilterState`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `message` | `string` | `'No matching items found for your current search and filters.'` | tidak |
| `onReset` | `() => void` | tidak ada | ya |

Perilaku: panel putus-putus dengan ikon `SearchX`, judul tetap, pesan kustom, dan tombol "Clear search and filters" bergaya `gaskeun-btn-secondary`.

```tsx
import { EmptyFilterState } from '../components/SharedUI';

export function EmptyRows({ onReset }: { onReset: () => void }) {
  return (
    <EmptyFilterState
      message="Tidak ada hasil untuk filter ini."
      onReset={onReset}
    />
  );
}
```

Catatan: judul "Nothing matches these filters" selalu sama dan tidak bisa diubah lewat props, sehingga komponen ini keliru untuk dataset yang memang kosong. `onReset` harus mengosongkan pencarian, filter, dan `currentPage` sekaligus.

### 2.9 `PosterGraphic`

| Prop | Tipe | Default | Wajib |
|---|---|---|---|
| `theme` | `string` | `'hiring'` | tidak |
| `typoFixed` | `boolean` | `false` | tidak |
| `compact` | `boolean` | `false` | tidak |

Perilaku: tema `hiring` memakai palet klien dan menampilkan badge "WE'RE HIRING", posisi, lokasi `[CITY]`, deadline `[DEADLINE]`, CTA, serta chip "Typo detected"/"Fixed". Tema lain memakai konfigurasi berikut; tema tak dikenal jatuh ke `product`.

| `theme` | Latar | Aksen | Judul |
|---|---|---|---|
| `hiring` | `#FFE14D` | `#F0307A` | UI/UX Designer |
| `product` | `#1F1A2E` | `#08D9F0` | Product launch carousel |
| `promo` | `#F0307A` | `#FFE14D` | 11.11 promo teaser |
| `sharing` | `#0B1F4D` | `#BBFB52` | Friday sharing session |
| `outing` | `#1450E0` | `#FFE14D` | Team outing recap |
| `casestudy` | `#0E3AAE` | `#BBFB52` | Q3 client case study |
| `batik` | `#1F1A2E` | `#FFE14D` | Heritage & Craft Series |

```tsx
import { PosterGraphic } from '../components/SharedUI';

export function PosterPreview({ typoFixed }: { typoFixed: boolean }) {
  return <PosterGraphic theme="hiring" typoFixed={typoFixed} compact />;
}
```

Catatan: `theme` bertipe `string`, bukan union, sehingga salah ketik tidak menghasilkan error dan poster diam-diam menjadi `product`. Menambah tema harus menyentuh `themeConfigs`. `typoFixed` hanya berpengaruh pada tema `hiring`. Placeholder `[CITY]` dan `[DEADLINE]` serta tulisan "Aplly now" sengaja dipertahankan untuk demo.

## 3. `LayoutShell`

### 3.1 Props

| Prop | Tipe | Wajib | Perilaku |
|---|---|---|---|
| `currentRole` | `Role` | ya | Menentukan profil, menu sidebar, dan breadcrumb. |
| `currentScreen` | `ScreenId` | ya | Menentukan item menu aktif dan label breadcrumb. |
| `onSelectRole` | `(role: Role) => void` | ya | Mengganti role dan membuka home screen role tersebut. |
| `onNavigate` | `(screen: ScreenId, options?: { staffTab?: string }) => void` | ya | Berpindah layar; `staffTab` dipakai untuk tab My submissions. |
| `customLogoUrl` | `string \| null` | ya | Diteruskan ke `GaskeunLogo` di sidebar. |
| `onUploadLogo` | `(url: string) => void` | ya | Dipanggil dengan data URL hasil `FileReader`. |
| `activeStaffTab` | `string` | tidak | Membedakan item "My submissions" dan "Drafts" saat aktif. |
| `children` | `React.ReactNode` | ya | Dirender di dalam `<main>` dengan `max-w-[1280px]`. |

### 3.2 `ALL_SCREENS_LIST`

Array 13 entri berurutan, dipakai jumper "All 13 screens".

| `num` | `id` | `label` | `role` |
|---|---|---|---|
| 1 | `login` | `1. Login & role picker` | `Staff` |
| 2 | `staff-upload` | `2. Staff – Upload & AI draft` | `Staff` |
| 3 | `staff-platforms` | `3. Staff – Platforms & check` | `Staff` |
| 4 | `head-queue` | `4. Head – Review queue` | `Head` |
| 5 | `published` | `5. Published` | `Head` |
| 6 | `admin-dashboard` | `6. Admin – Dashboard` | `Admin` |
| 7 | `staff-submissions` | `7. Staff – My submissions` | `Staff` |
| 8 | `brand-guidelines` | `8. Brand guidelines` | `Staff` |
| 9 | `head-calendar` | `9. Head – Content calendar` | `Head` |
| 10 | `head-team` | `10. Head – Team` | `Head` |
| 11 | `admin-users` | `11. Admin – Users & roles` | `Admin` |
| 12 | `admin-connected` | `12. Admin – Connected accounts` | `Admin` |
| 13 | `admin-activity` | `13. Admin – Activity log` | `Admin` |

### 3.3 `SCREEN_BREADCRUMBS`

Konstanta internal bertipe `Record<ScreenId, { section: string; page: string }>`; tidak diekspor. Karena bertipe `Record`, menambah `ScreenId` tanpa entri di sini langsung gagal di `tsc`.

| `ScreenId` | `section` | `page` |
|---|---|---|
| `login` | `Auth` | `Sign in` |
| `staff-upload` | `Staff` | `Upload & AI draft` |
| `staff-platforms` | `Staff` | `Platforms & check` |
| `staff-submissions` | `Staff` | `My submissions` |
| `head-queue` | `Head` | `Review queue` |
| `published` | `Head` | `Published` |
| `head-calendar` | `Head` | `Content calendar` |
| `head-team` | `Head` | `Team` |
| `admin-dashboard` | `Admin` | `Dashboard` |
| `admin-users` | `Admin` | `Users & roles` |
| `admin-connected` | `Admin` | `Connected accounts` |
| `admin-activity` | `Admin` | `Activity log` |
| `brand-guidelines` | `Workspace` | `Brand guidelines` |

Pengecualian: saat `currentScreen === 'brand-guidelines'`, topbar menampilkan `currentRole` sebagai bagian kiri, bukan `crumb.section`.

### 3.4 Sidebar, topbar, dan aksi

Sidebar selebar 248px di desktop (bertumpuk di mobile) dengan latar `#0B1F4D`.

- **Logo, unggah, dan workspace:** `GaskeunLogo size={34}`, teks "Gaskeun" dan "Approve. Gaskeun.". Tombol `ImagePlus` membuka `<input type="file" accept="image/*">` tersembunyi; `FileReader` mengirim data URL ke `onUploadLogo`. Kartu workspace berisi teks tetap "Lumbung Studio" dan "Design team workspace".
- **Role switcher:** tiga tombol `Staff`, `Head`, `Admin`. Yang aktif memakai `#1450E0`; klik memanggil `onSelectRole`, yang mengganti role sekaligus membuka home screen.
- **Menu per role (`roleMenus`):** Staff berisi New submission (`staff-upload`), My submissions (`staff-submissions`, badge `12`, `staffTab: 'All'`), Drafts (`staff-submissions`, badge `3`, `staffTab: 'Drafts'`), dan Brand guidelines. Head berisi Review queue (badge `5`), Published, Content calendar, dan Team. Admin berisi Dashboard, Users & roles, Connected accounts, Brand guidelines, dan Activity log. Angka `12`, `3`, dan `5` adalah literal.
- **Status aktif menu:** `new-sub` aktif untuk `staff-upload` dan `staff-platforms`; `drafts` aktif bila tab `Drafts`; `my-sub` aktif bila tab bukan `Drafts`; item lain aktif bila `currentScreen` sama.
- **Kartu Gemini dan pengguna:** kartu Gemini berisi teks tetap "Gemini is on" dengan indikator lime. Kartu pengguna memakai `ROLE_PROFILES[currentRole]` (`initials`, `avatarBg`, `name`, `roleLabel`); Sign out memanggil `onNavigate('login')` tanpa mereset state.
- **Topbar dan jumper:** topbar sticky `z-30` berisi breadcrumb, jumper "All 13 screens", pill hijau "Instagram & LinkedIn connected" (teks tetap, klik membuka `admin-connected` sebagai Admin), lonceng dengan dropdown 3 notifikasi, dan avatar. Jumper menutup dropdown, mengganti role lewat `onSelectRole` untuk semua layar kecuali `login` dan `brand-guidelines`, lalu memanggil `onNavigate`; `login` tidak pernah tampil di dalam shell.
- **Notifikasi:** tiga entri tetap; masing-masing menutup dropdown, memilih role, lalu membuka `head-queue`, `staff-submissions`, atau `published`. Label "3 unread" juga literal.

## 4. Props layar

| Layar | Props | Tipe |
|---|---|---|
| `LoginScreen` | `selectedRole`<br>`onSelectRole`<br>`onSignIn`<br>`customLogoUrl`<br>`onUploadLogo` | `Role`<br>`(role: Role) => void`<br>`(role: Role, targetScreen: ScreenId) => void`<br>`string \| null`<br>`(url: string) => void` |
| `StaffUploadScreen` | `drafts`<br>`onUpdateDraft`<br>`onRegenerateDraft`<br>`typoFixed`<br>`onSaveDraft`<br>`onNavigate` | `Record<PlatformName, PlatformDraft>`<br>`(platform: PlatformName, updated: Partial<PlatformDraft>) => void`<br>`(platform: PlatformName) => void`<br>`boolean`<br>`() => void`<br>`(screen: ScreenId) => void` |
| `StaffPlatformsScreen` | `selectedPlatforms`<br>`onTogglePlatform`<br>`typoFixed`<br>`onFixTypo`<br>`onSubmitForApproval`<br>`onNavigate`<br>`onSelectRole` | `PlatformName[]`<br>`(plat: PlatformName) => void`<br>`boolean`<br>`() => void`<br>`(note: string, timing: 'immediate' \| 'schedule') => void`<br>`(screen: ScreenId) => void`<br>`(role: Role) => void` |
| `HeadReviewQueueScreen` | `items`<br>`onUpdateItemStatus`<br>`onApproveItem`<br>`onRejectItem`<br>`onNavigate`<br>`typoFixed` | `QueueItem[]`<br>`(id: string, status: 'Submitted' \| 'In review' \| 'Revision', note?: string) => void`<br>`(item: QueueItem) => void`<br>`(id: string) => void`<br>`(screen: ScreenId) => void`<br>`boolean` |
| `PublishedScreen` | `publishedPosts`<br>`latestApprovedItem`<br>`typoFixed` | `PublishedPostItem[]`<br>`QueueItem`<br>`boolean` |
| `AdminDashboardScreen` | `users`<br>`activities`<br>`connectedPlatforms`<br>`onToggleConnect`<br>`onNavigate` | `MemberUserItem[]`<br>`ActivityLogEntry[]`<br>`Record<PlatformName, boolean>`<br>`(platform: PlatformName) => void`<br>`(screen: ScreenId) => void` |
| `StaffSubmissionsScreen` | `submissions`<br>`initialTab`<br>`onTabChange`<br>`onNavigate` | `StaffSubmissionItem[]`<br>`string` (opsional)<br>`(tab: string) => void` (opsional)<br>`(screen: ScreenId) => void` |
| `BrandGuidelinesScreen` | tidak ada | — |
| `HeadCalendarScreen` | `posts`<br>`onApplySuggestion` | `CalendarPostItem[]`<br>`() => void` |
| `HeadTeamScreen` | `designers`<br>`onNavigate` | `TeamDesignerItem[]`<br>`(screen: ScreenId) => void` |
| `AdminUsersScreen` | `users`<br>`onChangeUserRole`<br>`onInviteUser` | `MemberUserItem[]`<br>`(id: string, newRole: Role) => void`<br>`(email: string, role: Role) => void` |
| `AdminConnectedScreen` | `connectedPlatforms`<br>`onToggleConnect` | `Record<PlatformName, boolean>`<br>`(platform: PlatformName) => void` |
| `AdminActivityLogScreen` | `logs` | `ActivityLogEntry[]` |

## 5. Token desain

Warna dipakai sebagai nilai arbitrer Tailwind, misalnya `text-[#0B1F4D]`. Tidak ada `tailwind.config`; token global hanya ada di `src/index.css`.

| Peran | Hex | Pemakaian |
|---|---|---|
| Ink | `#0B1F4D` | Teks utama, sidebar, latar chip Draft |
| Muted | `#52607E` | Teks sekunder dan ikon nonaktif |
| Primary | `#1450E0` / `#1044C4` / `#1A5BFF` | Dasar, hover, dan gradien tombol serta logo |
| Border | `#E6ECF5` / `#D5DEEE` | Kartu dan pemisah; input dan tombol sekunder |
| Background | `#F5F7FC` | Latar halaman |
| Panel AI | `#F2F6FF` / `#D9E4FF` | Latar dan border `gaskeun-ai-panel` |
| Sukses | `#146C3C` / `#E5F5EC` | Teks dan latar pill sukses |
| Peringatan | `#7A5300` / `#FFF4D6` | Teks dan latar kartu peringatan |
| Aksen lime | `#BBFB52` | Ikon menu aktif dan centang logo |
| Aksen cyan | `#08D9F0` | Aksen logo dan gradien |

Warna status mengikuti tabel di bagian `StatusChip`; jangan membuat varian baru yang mirip.

Palet brand klien hanya boleh muncul di poster dan halaman Brand guidelines, bukan di chrome aplikasi; putih pada kartu dan tombol adalah warna netral UI, bukan aksen Paper.

| Nama | Hex | Pemakaian |
|---|---|---|
| Sun | `#FFE14D` | Latar hero hiring dan kampanye |
| Ink | `#1F1A2E` | Tipografi display dan permukaan gelap |
| Berry | `#F0307A` | Badge CTA dan aksen energik |
| Paper | `#FFFFFF` | Kartu kontainer dan teks kontras tinggi |

## 6. Kelas utilitas `.gaskeun-*`

Kelima kelas ini didefinisikan di `src/index.css` di luar `@layer`. Gaya tanpa layer mengalahkan layer `utilities` Tailwind, sehingga utility dengan properti yang sama tidak berefek. `@import` Google Fonts juga harus tetap menjadi baris pertama `index.css`, sebelum `@import 'tailwindcss'`; jangan menjalankan formatter karena dapat menulis ulang seluruh file.

| Kelas | Deklarasi CSS | Catatan |
|---|---|---|
| `.gaskeun-card` | `background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E6ECF5; box-shadow: 0 1px 2px rgba(11,31,77,0.04), 0 8px 24px rgba(11,31,77,0.05)` | `bg-*`, `border-*`, `rounded-*`, dan `shadow-*` pada elemen yang sama akan kalah. Padding dan layout tetap aman. |
| `.gaskeun-btn-primary` | `background: linear-gradient(135deg, #1450E0 0%, #1A5BFF 100%); color: #FFFFFF; border-radius: 12px; min-height: 48px; box-shadow: 0 4px 14px rgba(26,91,255,0.28), 0 1px 2px rgba(11,31,77,0.08); transition: all 0.18s ease` | Hover `#1044C4 → #1450E0`, `translateY(-1px)`. State nonaktif tetap butuh `disabled:opacity-40 disabled:pointer-events-none`. |
| `.gaskeun-btn-secondary` | `background-color: #FFFFFF; color: #0B1F4D; border-radius: 12px; border: 1px solid #D5DEEE; min-height: 44px; transition: all 0.15s ease` | Hover `#F5F7FC` dengan border `#B8C7E0`. |
| `.gaskeun-ai-panel` | `background-color: #F2F6FF; border: 1px solid #D9E4FF; border-radius: 14px` | Latar dan border tidak bisa ditimpa utility. |
| `.gaskeun-h1` | `font-size: 28px; font-weight: 800; letter-spacing: -0.6px; line-height: 1.2; color: #0B1F4D` | Ukuran dan warna terkunci; jangan tambahkan `text-*` yang sama. |

## 7. Pola komposisi yang dianjurkan

- **Kartu:** gunakan `gaskeun-card` dengan padding dan jarak vertikal, misalnya `className="gaskeun-card p-6 space-y-4"`. Jangan menambahkan `bg-white` atau `border-[#E6ECF5]` karena deklarasi kelas mengalahkan utility. Untuk grid, letakkan `gaskeun-card` pada anak grid.
- **Tombol:** CTA utama memakai `gaskeun-btn-primary`, aksi netral memakai `gaskeun-btn-secondary`. Selalu `type="button"` dan `cursor-pointer`; tinggi minimum sudah diatur kelas (48px dan 44px). Nonaktifkan dengan `disabled:opacity-40 disabled:pointer-events-none`.
- **Panel AI:** kombinasikan `gaskeun-ai-panel p-4 sm:p-5`, `GeminiSparkleTile size="sm"` atau `"md"`, judul `text-xs font-extrabold text-[#0B1F4D]`, dan deskripsi `text-[11px] text-[#52607E]`. Tile putih di dalamnya memakai `bg-white rounded-xl border border-[#D9E4FF]`.
- **Chip status:** selalu lewat `StatusChip`, termasuk untuk status user (`Active`, `Invite pending`, `Deactivated`). Jangan menyalin warna chip ke markup lain agar map tetap satu sumber.
- **Pagination:** simpan `currentPage` dan `pageSize` di layar, potong data dengan `useMemo`, dan panggil `setCurrentPage(1)` pada setiap perubahan pencarian atau filter. Karena `PaginationBar` tidak melakukan clamp, hitung `safePage = Math.min(currentPage, Math.max(1, Math.ceil(total / pageSize)))` sebelum memotong data, lalu tampilkan `EmptyFilterState` bila hasil filter kosong.

## Lihat juga

- [Arsitektur](./arsitektur.md)
- [Panduan pengembangan](./panduan-pengembangan.md)
- [Referensi data](./referensi-data.md)
- [Panduan pengguna](./panduan-pengguna.md)
- [Status dan rencana](./status-dan-rencana.md)
