# GasKeun — konteks proyek untuk agen

Proyek ini adalah aplikasi front-end **GasKeun**: demo alur persetujuan konten media sosial untuk tim desain in-house. Aplikasinya berjalan di Figma Make dan seluruh datanya berasal dari mock. Tidak ada backend, autentikasi sungguhan, router, maupun AI sungguhan.

Dokumen ini adalah titik awal. Detail yang lebih dalam ada di [Dokumen pendukung](#dokumen-pendukung).

## Ringkasan produk

- **Klien fiktif:** Lumbung Studio (email `@lumbung.studio`).
- **Persona demo** (`ROLE_PROFILES` di `src/data/mockData.ts`):
  - **Staff:** Rina Putri, desainer yang mengunggah dan mengajukan konten.
  - **Head:** Bima Santoso, reviewer yang menyetujui atau meminta revisi.
  - **Admin:** Ayu Lestari, mengelola user, koneksi platform, dan log.
- **Platform sosial:** Instagram, LinkedIn, dan TikTok (`PlatformName`).
- **Status:** prototipe. Login hanya memilih role (email dan password diabaikan). Data kembali ke seed setiap reload. Label "Gemini" dan "Brand Guardian" adalah simulasi yang hard-coded.

### Alur utama

1. **Login** (`login`): pilih role. `handleSignIn` menyimpan role dan membuka home screen role tersebut.
2. **Staff Upload** (`staff-upload`): poster hiring tetap dengan draf AI per platform. Staff bisa mengedit, menekan Regenerate (hanya bergantian di antara dua set draf), atau Save draft (belum berfungsi, lihat known issues).
3. **Staff Platforms** (`staff-platforms`): pilih platform dan waktu posting, jalankan checklist Brand Guardian, perbaiki typo "Aplly", lalu submit. Submit menimpa item `SUB-1042` di antrean Head dan menambah satu entri activity log.
4. **Head Review Queue** (`head-queue`): antrean 7 item dengan filter dan panel detail. Aksinya Approve, Request revision, dan Reject. Saat ini Reject berperilaku sama dengan revisi.
5. **Published** (`published`): hero dari `latestApprovedItem` dan tabel post yang sudah terbit.

## Peta layar

Nomor di kolom "#" sama dengan `ALL_SCREENS_LIST` di `LayoutShell.tsx`, yang dipakai untuk jumper "All 13 screens".

| # | ScreenId | File | Role dan menu sidebar | Catatan |
|---|---|---|---|---|
| 1 | `login` | `src/screens/LoginScreen.tsx` | Publik | Pemilihan role |
| 2 | `staff-upload` | `src/screens/StaffUploadScreen.tsx` | Staff · New submission | Draf AI per platform |
| 3 | `staff-platforms` | `src/screens/StaffPlatformsScreen.tsx` | Staff · dari alur, bukan menu | Checklist, typo, submit |
| 4 | `head-queue` | `src/screens/HeadReviewQueueScreen.tsx` | Head · Review queue | Approve, revisi, reject |
| 5 | `published` | `src/screens/PublishedScreen.tsx` | Head · Published | Hero dan tabel terbit |
| 6 | `admin-dashboard` | `src/screens/AdminDashboardScreen.tsx` | Admin · Dashboard | KPI, sebagian hard-coded |
| 7 | `staff-submissions` | `src/screens/StaffSubmissionsScreen.tsx` | Staff · My submissions dan Drafts (tab) | Memakai `activeStaffTab` |
| 8 | `brand-guidelines` | `src/screens/BrandGuidelinesScreen.tsx` | Staff dan Admin · Brand guidelines | Tidak ada di menu Head |
| 9 | `head-calendar` | `src/screens/HeadCalendarScreen.tsx` | Head · Content calendar | Saran jadwal untuk `CAL-09` |
| 10 | `head-team` | `src/screens/HeadTeamScreen.tsx` | Head · Team | Hanya baca (`teamDesigners`) |
| 11 | `admin-users` | `src/screens/AdminUsersScreen.tsx` | Admin · Users & roles | Ubah role, undang user |
| 12 | `admin-connected` | `src/screens/AdminConnectedScreen.tsx` | Admin · Connected accounts | Koneksi platform dan notifikasi |
| 13 | `admin-activity` | `src/screens/AdminActivityLogScreen.tsx` | Admin · Activity log | Ekspor CSV |

Semua layar kecuali `login` dirender di dalam `LayoutShell` (sidebar dan topbar).

## Arsitektur

### Navigasi tanpa router

- `currentScreen` (tipe `ScreenId` di `src/types.ts`) disimpan di `App.tsx`. Layar dirender dengan kondisi `currentScreen === '...' && <Screen/>`.
- Saat pindah layar, layar sebelumnya di-unmount, sehingga state lokalnya (filter, halaman, toast, banner) ikut hilang. Kalau sebuah state harus bertahan, angkat ke `App.tsx`.
- `handleNavigate` menggulir ke atas dan menerima `{ staffTab }` untuk tab My submissions.
- Ada **dua setter role** dengan arti berbeda:
  - `handleSelectRole` (dipakai `LayoutShell`) mengganti role **dan** membuka home screen-nya.
  - `setCurrentRole` mentah (dipakai `LoginScreen` dan `StaffPlatformsScreen`) hanya mengganti role. Layar yang memakai ini harus memanggil `onNavigate` sendiri.
- Jumper dan notifikasi memanggil `onSelectRole` lalu `onNavigate`. Urutan ini hanya benar karena React menggabungkan kedua update tersebut.

### State di App.tsx

Semua state lintas-layar ada di `App.tsx` (17 `useState`). Yang penting:

| State | Isi | Dipakai oleh |
|---|---|---|
| `currentRole`, `currentScreen` | role dan layar yang aktif | shell dan routing |
| `drafts`, `useAltDraft`, `typoFixed`, `selectedPlatforms` | draf per platform, flag typo, platform terpilih | Staff Upload, Staff Platforms, Head Queue, Published |
| `queueItems` | antrean review | Head Review Queue |
| `publishedPosts`, `latestApprovedItem` | tabel terbit dan item yang terakhir di-approve | Published |
| `staffSubmissions`, `activeStaffTab` | submission Staff dan tab yang aktif | My submissions, LayoutShell |
| `calendarPosts` | jadwal | Head Calendar |
| `teamDesigners` | tim (tanpa setter) | Head Team |
| `usersList`, `connectedPlatforms`, `activityLogs` | user, status koneksi platform, log | layar Admin. Log juga diisi saat Staff submit |
| `customLogoUrl` | logo kustom sebagai data URL (hilang saat reload) | Login dan LayoutShell |

### Handler di App.tsx

Setiap handler diteruskan ke layar sebagai prop `onX`:

- Role dan navigasi: `handleSelectRole`, `handleNavigate`, `handleSignIn`
- Draf Staff: `handleUpdateDraft`, `handleRegenerateDraft`, `handleTogglePlatform`
- Pengajuan: `handleSubmitForApproval` (menimpa `SUB-1042`, menambah log)
- Review Head: `handleUpdateQueueItemStatus`, `handleApproveItem`, `handleRejectItem`, `handleApplyCalendarSuggestion`
- Admin: `handleChangeUserRole`, `handleInviteUser`, `handleToggleConnect`

### Aliran data yang nyata

Ini kondisi saat ini, termasuk bagian yang belum tersambung:

- **Staff ke Head** hanya lewat `SUB-1042`. Submit tidak menambah baris di My submissions.
- **Keputusan Head** (approve, revisi, reject) hanya mengubah `queueItems`. Approve juga mengubah `latestApprovedItem`. Keputusan itu tidak sampai ke My submissions, kalender, atau log.
- **Approve tidak menambah baris** di tabel Published. Dedupe dilakukan berdasarkan judul, dan semua judul antrean sudah ada di `INITIAL_PUBLISHED_POSTS`. Ini bug data, bukan bug render.
- **Admin** mengelola `connectedPlatforms`, tetapi nilainya hanya dipakai di layar Admin. Pill "Instagram & LinkedIn connected" di topbar berupa teks tetap.
- **Badge sidebar** (12, 3, 5) dan angka KPI adalah literal.
- **Sign out** hanya berpindah ke `login`. State tidak di-reset.

## Data (src/data/mockData.ts)

| Konstanta | Jumlah | Dipakai di |
|---|---|---|
| `ROLE_PROFILES` | 3 persona | identitas yang sedang login, home screen |
| `INITIAL_QUEUE_ITEMS` | 7 (`SUB-1036`–`SUB-1042`) | Head Review Queue |
| `INITIAL_PUBLISHED_POSTS` | 9 (`PUB-893`–`PUB-901`) | Published |
| `INITIAL_STAFF_SUBMISSIONS` | 12 (`MY-201`–`MY-212`, 3 Draft) | My submissions |
| `INITIAL_CALENDAR_POSTS` | 14 (`CAL-01`–`CAL-14`) | Head Calendar |
| `INITIAL_TEAM_DESIGNERS` | 7 (`DES-1`–`DES-7`) | Head Team |
| `INITIAL_USERS_LIST` | 12 (`USR-01`–`USR-12`) | Admin Users |
| `INITIAL_ACTIVITY_LOG` | 24 (`ACT-01`–`ACT-24`) | Activity log, dashboard |
| `INITIAL_AI_DRAFTS`, `ALTERNATE_AI_DRAFTS` | 2 set draf | Regenerate |

- **Tidak ada id yang sama antar dataset.** Dataset disambungkan lewat judul dan nama string.
- Satu post yang sama muncul sebagai `SUB-1042` (antrean), `MY-201` (My submissions), `CAL-06` (kalender), dan `PUB-901` (terbit).
- Beberapa data saling bertentangan, misalnya status, pemilik, dan judul yang duplikat. Daftarnya ada di `docs/TEMUAN_LENGKAP.md`.
- Id yang disebut langsung di kode: `SUB-1042` (di App dan sebagai default seleksi di Head Queue) dan `CAL-09` (saran kalender). Kalau di-rename, alurnya rusak tanpa error tipe.
- Id runtime memakai format `PREFIX-${Date.now()}`. Id seed memakai prefix tetap (`SUB-`, `PUB-`, `MY-`, `CAL-`, `DES-`, `USR-`, `ACT-`).

### Tipe penting (src/types.ts)

- `Role` = `'Staff' | 'Head' | 'Admin'`
- `ScreenId` = 13 literal layar
- `PlatformName` = `'Instagram' | 'LinkedIn' | 'TikTok'` (perhatikan huruf I kapital di `LinkedIn`)
- `SubmissionStatus` = `'Submitted' | 'In review' | 'Revision' | 'Published' | 'Draft' | 'Scheduled'`
- `QueueItem.status` = `'Submitted' | 'In review' | 'Revision'`. Tidak ada status Approved, Published, atau Rejected.
- `QueueItem.posterTheme` = `'hiring' | 'product' | 'outing' | 'promo' | 'sharing' | 'batik' | 'casestudy'`

## Komponen bersama

- `src/components/SharedUI.tsx` (named export): `Instagram`, `Linkedin` (ikon SVG custom), `GaskeunLogo`, `GeminiSparkleTile`, `StatusChip`, `PlatformBadge`, `PaginationBar`, `EmptyFilterState`, `PosterGraphic`.
- `src/components/LayoutShell.tsx` (named export): `LayoutShell` dan `ALL_SCREENS_LIST`.
- `PosterGraphic` menampilkan poster sesuai `posterTheme`. Prop `typoFixed` hanya berpengaruh di tema `hiring`. Tema yang tidak dikenal jatuh ke tema `product`.
- `StatusChip` hanya mengenal status di map `styles`. Status lain jatuh ke gaya Draft, tetapi teksnya tetap tampil apa adanya.
- `PaginationBar` tidak membatasi halaman. Setiap perubahan filter harus memanggil `setCurrentPage(1)`.
- `EmptyFilterState` selalu menulis "Nothing matches these filters". Pesan itu keliru untuk dataset yang memang kosong.

## Desain dan styling

- Tailwind CSS v4 lewat `@tailwindcss/vite`. Tidak ada `tailwind.config`. Kustomisasi tema, kalau dibutuhkan, masuk ke `src/index.css` dengan `@theme`.
- Warna memakai hex arbitrer, misalnya `text-[#0B1F4D]`. Pakai nilai yang sudah ada dan jangan membuat varian yang mirip.

| Peran | Hex |
|---|---|
| Teks utama (ink) | `#0B1F4D` |
| Teks sekunder (muted) | `#52607E` |
| Primary (hover) | `#1450E0` (`#1044C4`) |
| Border / border input | `#E6ECF5` / `#D5DEEE` |
| Latar halaman | `#F5F7FC` |
| Panel AI | `#F2F6FF` / `#D9E4FF` |
| Sukses | `#146C3C` / `#E5F5EC` |
| Peringatan | `#7A5300` / `#FFF4D6` |
| Aksen | lime `#BBFB52`, cyan `#08D9F0` |

- **Palet brand klien** (Sun `#FFE14D`, Ink `#1F1A2E`, Berry `#F0307A`, Paper `#FFFFFF`) hanya dipakai di poster dan halaman Brand guidelines. Jangan dipakai untuk chrome aplikasi.
- Kelas global di `src/index.css`: `.gaskeun-card`, `.gaskeun-btn-primary`, `.gaskeun-btn-secondary`, `.gaskeun-ai-panel`, `.gaskeun-h1`. Kelas ini **belum** berada di `@layer`, sehingga mengalahkan utility Tailwind pada elemen yang sama. Menambah `bg-*` atau `border-*` ke elemen ber-`gaskeun-card` tidak akan berefek.
- Font Plus Jakarta Sans dimuat lewat `@import` Google Fonts. Baris ini harus tetap menjadi baris pertama `index.css`, sebelum `@import 'tailwindcss'`.
- Tombol memakai `type="button"`, `cursor-pointer`, dan tinggi sekitar 44px. Untuk state nonaktif: `disabled:opacity-40 disabled:pointer-events-none`.
- Ikon memakai `lucide-react` v1, yang **tidak punya ikon brand**. Instagram dan LinkedIn diimpor dari `SharedUI`. TikTok memakai ikon `Video` dari lucide.

## Konvensi kode

- **Layar:** `export default function XScreen({...}: XScreenProps)` dengan `interface XScreenProps` di atasnya. Props callback diberi prefix `on`.
- **Export:** layar memakai default export. Aturan umum dari template adalah default export untuk semua komponen, tetapi `SharedUI.tsx` dan `LayoutShell.tsx` sudah memakai named export. Ikuti pola yang ada.
- **Impor:** relatif (`'../types'`, `'../components/SharedUI'`). Alias `@` tersedia tetapi tidak dipakai.
- **Gaya:** kutip tunggal, titik koma, indentasi 2 spasi. Pengecualian: `src/main.tsx` tanpa titik koma.
- **Apostrof:** string yang mengandung apostrof memakai kutip ganda, misalnya `"We're hiring: UI/UX Designer"`. Di teks JSX, pakai `&apos;`. Apostrof yang tidak di-escape di string berkutip tunggal akan merusak build.
- **Update state:** selalu immutable, misalnya `setX((prev) => prev.map(...))`, atau `[newItem, ...prev]` untuk menambah di depan.
- **Teks waktu:** relatif, misalnya `'Just now'`, bukan objek `Date`. Tanggal "hari ini" adalah **Rabu 14 Oct 2026**.
- **Toast:** `useState` lokal, hilang dengan `setTimeout` 3000–3500 ms.
- **Daftar dengan pencarian:** `useState` untuk search, filter, dan `currentPage`. Daftar dihitung dengan `useMemo`. `pageSize` bersifat lokal per layar.

## Yang disengaja (jangan "diperbaiki")

- Tulisan **"Aplly now"** di `PosterGraphic` dan data demo. Ini inti demo "Typo detected → Fixed" yang dikendalikan `typoFixed`, dan tulisannya tersebar di beberapa file.
- Placeholder **`[CITY]`** dan **`[DEADLINE]`** di copy. Placeholder ini memang harus tetap ada.
- Label **"Gemini"** dan **"Brand Guardian"** adalah simulasi. Jangan menambahkan panggilan API sungguhan kecuali diminta.

## Jebakan saat mengedit

- **Menambah layar** harus menyentuh 5 tempat: `ScreenId` di `types.ts`, `SCREEN_BREADCRUMBS` dan `ALL_SCREENS_LIST` di `LayoutShell.tsx` (`SCREEN_BREADCRUMBS` bertipe `Record<ScreenId, …>`, jadi tsc error kalau ada yang terlewat), `roleMenus` di `LayoutShell.tsx`, dan blok render di `App.tsx`.
- **Menambah status queue** (misalnya Approved atau Rejected) harus menyentuh `QueueItem.status` di `types.ts`, union duplikat di `handleUpdateQueueItemStatus` dan `HeadReviewQueueScreen` (dua tempat), serta entri di `styles` milik `StatusChip`.
- **Menambah tema poster** harus menyentuh union `posterTheme` dan `themeConfigs` di `SharedUI.tsx`. Kalau tidak, poster diam-diam jatuh ke tema `product`.
- **Nama dan angka yang sama** tersebar di banyak file, misalnya `Rina Putri`, `Bima Santoso`, dan angka checklist Brand Guardian yang hard-coded. Cari dengan grep di seluruh `src/` sebelum mengubahnya.
- **Inisial `RP`** dipakai dua orang (Rina Putri dan Raka Pratama). Jangan dipakai sebagai key.
- **File panjang** (`App.tsx` 384 baris, `LayoutShell.tsx` 555 baris) dan class string yang berulang. Untuk `old_string` di Edit, sertakan teks unik seperti label, nama handler, atau komentar `{/* ... */}`.
- **Avatar** di `ROLE_PROFILES` berupa string gradient CSS yang dipasang lewat `style={{ background }}`. Jangan diubah menjadi kelas `bg-*`.
- **Tombol role di Login** harus `type="button"` di dalam `<form>`. Tanpa itu, klik role langsung men-submit form.

## Known issues

Daftar lengkapnya ada di [docs/TEMUAN_LENGKAP.md](docs/TEMUAN_LENGKAP.md). Yang paling penting:

- Save draft tidak menyimpan draf, tetapi tetap menampilkan toast sukses.
- Approve tidak menambah baris di Published, dan item tetap ada di antrean.
- Keputusan Head tidak sampai ke My submissions dan kalender.
- Ekspor CSV Activity log terpotong di karakter `#`, karena memakai `data:` URI dan `encodeURI`.
- `typoFixed` adalah boolean global yang tidak pernah di-reset. Submit dan Approve belum dijaga oleh status typo.

Rencana perbaikannya ada di [docs/BACKLOG_HAIKU.md](docs/BACKLOG_HAIKU.md).

## Dependensi dan toolchain

- **Runtime:** React 19 dan React DOM 19.
- **Build:** Vite 8, `@vitejs/plugin-react` 6, TypeScript 5.7 atau lebih baru (terpasang 5.9.3).
- **Styling:** Tailwind CSS v4 (`tailwindcss` dan `@tailwindcss/vite`).
- **Ikon:** `lucide-react` 1.56.
- **Format:** oxfmt ada di `devDependencies`, tetapi **jangan dijalankan** (lihat di bawah).
- **Versi Node dan pnpm:** `.mise.toml` memakai Node 22 dan pnpm 10.34.3. Mesin lokal saat analisis memakai Node 25.9 dan pnpm 11.25.
- Tidak ada router, state library, UI kit, test runner, atau linter. Jangan menambahkannya kecuali diminta.

## Struktur proyek

- `src/main.tsx`: entrypoint React. Me-mount `App` di `#root` dan mengimpor `index.css`.
- `src/App.tsx`: seluruh state, handler, dan routing layar. Titik awal untuk hampir semua perubahan UI.
- `src/types.ts`: tipe domain.
- `src/data/mockData.ts`: seed data dan persona.
- `src/components/`: `LayoutShell.tsx` (sidebar dan topbar) dan `SharedUI.tsx` (komponen bersama).
- `src/screens/`: 13 layar.
- `src/index.css`: font, Tailwind, dan kelas `.gaskeun-*`.
- `index.html`: shell Vite dengan slot `<!-- figma:* -->` yang diisi platform.
- `public/favicon.svg`: favicon.
- `docs/`: analisis, backlog, dan temuan.

## Batasan file (dikelola platform)

Jangan diedit:

- `vite.config.ts` (berisi plugin Figma Make)
- seluruh isi `.figma/make/`, kecuali `.figma/make/site.json`
- `.mise.toml`, `.gitignore`, `.gitattributes`
- slot `<!-- figma:* -->` di `index.html`

Metadata situs diatur lewat `.figma/make/site.json`. Saat ini file itu hanya berisi deskripsi dan aturan robots. Judul tab belum diatur di sana (lihat T09 di backlog).

Mengedit `package.json` atau `pnpm-lock.yaml` memicu reinstall dan restart dev server. Hindari kecuali memang diminta.

## Verifikasi dan perintah

- Setiap perubahan **wajib** lolos `pnpm exec tsc --noEmit -p .` dengan 0 error. `pnpm build` tidak melakukan type-check, jadi tsc tetap harus dijalankan.
- Setelah itu jalankan `pnpm build`.
- **Jangan** jalankan `pnpm format`, `oxfmt`, atau `.figma/make/format`. Ketiganya menulis ulang semua file, dan pnpm meneruskan `--` sebagai argumen.
- Dev server biasanya sudah berjalan di `$PORT` (default 8443). Jangan menjalankan server kedua. Di Windows, untuk port lain: `$env:PORT='5173'; $env:FIGMA_DEV_SERVER_HOST='127.0.0.1'; pnpm dev`.
- Belum ada test otomatis. Untuk verifikasi visual, buka aplikasi di browser.

## Dokumen pendukung

- [`docs/ANALISIS_PROYEK.md`](docs/ANALISIS_PROYEK.md): arsitektur, aliran data, dan jebakan.
- [`docs/BACKLOG_HAIKU.md`](docs/BACKLOG_HAIKU.md): 34 tugas kecil dengan kriteria terima.
- [`docs/TEMUAN_LENGKAP.md`](docs/TEMUAN_LENGKAP.md): 187 temuan dengan `file:line`.

## Cara bekerja sebagai agen

1. Baca bagian yang relevan di dokumen ini dan di `docs/ANALISIS_PROYEK.md` sebelum mengedit.
2. Ubah hanya file yang diperlukan untuk tugas. Jangan merapikan kode di luar lingkup.
3. Kalau ada langkah yang tidak cocok dengan kode, berhenti dan laporkan. Jangan menebak.
4. Jalankan verifikasi (tsc), lalu laporkan file yang diubah, ringkasan perubahan, dan hasil tsc.
5. Kalau folder belum berupa repo git, sebutkan semua file yang diubah supaya mudah ditinjau.
