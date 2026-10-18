# Analisis Proyek GasKeun

> Dokumen handoff untuk dikerjakan dengan Claude Haiku (mode Ultracode).
> Dianalisis 2026-10-18 oleh 13 agen: 6 pembaca area, 6 verifikator adversarial, dan 1 sintesis. Klaim terpenting juga dicek manual.
> Pasangan dokumen: [BACKLOG_HAIKU.md](BACKLOG_HAIKU.md) berisi tugas siap kerja, dan [TEMUAN_LENGKAP.md](TEMUAN_LENGKAP.md) berisi 187 temuan dengan file:line.

---

## 1. Ringkasan produk

GasKeun adalah **demo front-end saja** dari alur persetujuan konten media sosial untuk tim desain in-house. Klien fiktifnya bernama "Lumbung Studio". Proyek ini dibangun di Figma Make.

- **Tidak ada** backend, router, persistensi (reload = data kembali ke awal), maupun AI sungguhan. Semua perilaku "Gemini / Brand Guardian" bersifat deterministik dan hard-coded.
- Semua data berasal dari `src/data/mockData.ts`, lewat konstanta `INITIAL_*` dan `ROLE_PROFILES`.
- Ada 3 persona demo:

| Role | Nama | Home screen |
|---|---|---|
| Staff (desainer) | Rina Putri | `staff-upload` |
| Head (reviewer) | Bima Santoso | `head-queue` |
| Admin | Ayu Lestari | `admin-dashboard` |

**Alur utama:**

Login → Staff Upload (draf AI per platform) → Staff Platforms (pilih platform, Brand Guardian, perbaiki typo "Aplly", submit) → Head Review Queue (approve / revisi / reject) → Published.

Layar pendukung:
- Staff: My submissions, Brand guidelines.
- Head: Calendar, Team.
- Admin: Dashboard, Users & roles, Connected accounts, Activity log (ekspor CSV).

**Kondisi saat ini (sudah diverifikasi):**

| Cek | Hasil |
|---|---|
| `pnpm exec tsc --noEmit -p .` | ✅ 0 error |
| `pnpm build` | ✅ sukses, 1 chunk JS 391 kB (103 kB gzip) |
| Test / lint | ❌ tidak ada |
| Git | ❌ folder **bukan** repo git |
| P0 (crash/build rusak) | tidak ada |
| P1 (bug fungsional) | 10 terkonfirmasi |

Masalah utamanya: state tidak mengalir antar-role, ada stub yang berpura-pura berhasil, angka "live" sebenarnya hard-coded, dan dataset mock saling bertentangan.

---

## 2. Stack & tooling

- React 19, TypeScript 5.9 (`strict`, tetapi `noUnusedLocals` mati), Vite 8, Tailwind v4 via `@tailwindcss/vite` (tanpa tailwind.config), dan lucide-react **v1.56**.
- Toolchain platform: node 22 dan pnpm 10.34.3 (`.mise.toml`). Mesin lokal: node 25.9 dan pnpm 11.25.
- Dev server Figma Make berjalan di `$PORT` (default 8443, `strictPort`). Untuk menjalankan lokal di PowerShell: `$env:PORT='5173'; pnpm dev`.
- **Verifikasi satu-satunya:** `pnpm exec tsc --noEmit -p .`, dilanjutkan `pnpm build`. Ingat, `vite build` **tidak** melakukan type-check.

### File yang dikelola platform (JANGAN diedit)

- `vite.config.ts` (4 plugin figma*)
- semua isi `.figma/make/*`
- `.mise.toml`, `.gitignore`, `.gitattributes`
- slot komentar `<!-- figma:* -->` di `index.html`

Judul tab, favicon, dan bahasa diatur lewat `.figma/make/site.json` (key `title`, `icons.icon`, `language`).

Mengedit `package.json` atau `pnpm-lock.yaml` memicu reinstall dan restart dev server. **Jangan menambah dependency** kecuali diminta. Library seperti react-router, zustand, clsx, dan shadcn tidak terpasang.

### Formatter berbahaya

`pnpm format`, `oxfmt` tanpa argumen, dan `.figma/make/format` akan menulis ulang **semua** file, termasuk node_modules, karena folder ini bukan repo git. pnpm meneruskan `--` secara literal, sehingga flag "check" malah berubah jadi mode tulis. **Jangan pernah jalankan formatter.**

---

## 3. Struktur kode

```
src/
  main.tsx                 mount <App/> (StrictMode); satu-satunya file tanpa titik koma
  App.tsx          384 b   SEMUA state global (17 useState) + semua handler + "router" if-chain
  types.ts         132 b   tipe domain (Role, ScreenId[13], QueueItem, ...)
  index.css         61 b   import font + tailwind, kelas .gaskeun-* (TIDAK ber-@layer)
  data/mockData.ts 1168 b  ROLE_PROFILES + INITIAL_* (7 queue, 9 published, 12 staff, 14 calendar, 7 team, 12 users, 24 activity)
  components/
    LayoutShell.tsx 555 b  sidebar (role switcher, menu per role, sign out) + topbar (breadcrumb, jumper 13 layar, pill, notifikasi)
    SharedUI.tsx    442 b  Instagram/Linkedin (SVG custom), GaskeunLogo, GeminiSparkleTile, StatusChip, PlatformBadge,
                           PaginationBar, EmptyFilterState, PosterGraphic (7 tema poster)
  screens/ (13 layar, semuanya default export)
    LoginScreen                  StaffUpload    StaffPlatforms   StaffSubmissions   BrandGuidelines
    HeadReviewQueue (548 b)      HeadCalendar   HeadTeam         Published
    AdminDashboard               AdminUsers     AdminConnected   AdminActivityLog
```

### Navigasi

Tidak ada router. `currentScreen: ScreenId` disimpan di App, dan layar dirender dengan rantai `{currentScreen === 'x' && <X/>}`. Akibatnya **setiap layar di-unmount saat pindah layar**, dan state lokalnya (filter, halaman, toast, banner) ikut hilang.

Layar `login` dirender tanpa shell. Sebelas layar lainnya dibungkus `LayoutShell`.

**Menambah layar baru wajib menyentuh 5 tempat:**
1. union `ScreenId` di `types.ts`
2. `SCREEN_BREADCRUMBS` di LayoutShell. Tipenya `Record<ScreenId,…>`, jadi tsc akan error kalau lupa.
3. `ALL_SCREENS_LIST` di LayoutShell
4. `roleMenus` di LayoutShell
5. blok render di `App.tsx`

Selain itu, `ROLE_PROFILES.homeScreen` punya union literal sendiri yang lebih sempit.

---

## 4. Aliran data (inti masalah)

```
mockData INITIAL_*  ─►  App.tsx useState  ─► props ─►  Screen
                              ▲                          │
                              └──── onX() → handleX() ◄──┘
```

Setiap slice state praktis hanya dimiliki satu role:

- **Silo Staff.** State `drafts`, `useAltDraft`, `typoFixed`, dan `selectedPlatforms`.
  - `staffSubmissions` **tidak pernah benar-benar ditulis**. Satu-satunya pemanggilan setter-nya adalah no-op `setStaffSubmissions(prev => [...prev])` di prop `onSaveDraft`.
- **Jembatan Staff → Head (satu-satunya).** `handleSubmitForApproval` hanya menimpa item queue dengan id ajaib **`'SUB-1042'`**, lalu menambah satu entri activity log.
  - Ia tidak menyentuh staffSubmissions dan calendar.
  - Judul dan hashtag hasil edit tidak ikut terkirim.
- **Silo Head.**
  - `handleApproveItem` hanya mengubah `latestApprovedItem`. Penambahan baris Published-nya **tidak pernah terjadi**, karena dedupe dilakukan berdasarkan *judul* dan ketujuh judul queue sudah ada di `INITIAL_PUBLISHED_POSTS`.
  - Item yang di-approve tetap berada di queue dan bisa di-approve lagi.
  - Revisi dan reject hanya mengubah `queueItems`. Reject berperilaku persis sama dengan revisi.
- **Silo Admin.**
  - `connectedPlatforms` hanya sampai ke 2 layar Admin. Pill "Instagram & LinkedIn connected" di topbar berupa literal.
  - Tindakan Admin tidak dicatat di log.
  - `usersList` tidak terhubung dengan `ROLE_PROFILES`.
- **Shell.** LayoutShell hanya menerima role, screen, logo, dan activeStaffTab. Akibatnya badge 12/3/5, "3 unread", dan pill semuanya literal.
- **Role.** `onSelectRole` punya dua arti:
  - Di LayoutShell, ia adalah `handleSelectRole`, yang juga lompat ke home.
  - Di Login dan StaffPlatforms, ia adalah setter mentah `setCurrentRole`.
  - Tidak ada guard akses, jadi role apa pun bisa membuka layar apa pun.
- **Sign out** hanya bernavigasi ke `login`. Semua state tetap bertahan.

---

## 5. Masalah lintas-modul (prioritas)

| ID | Sev | Masalah | Lokasi utama |
|---|---|---|---|
| X1 | P1 | Siklus Staff↔Head terputus: submit tidak muncul di My submissions, dan keputusan Head tidak kembali ke Staff. Satu post punya 4 id berbeda (MY-201 / SUB-1042 / CAL-06 / PUB-901) | App.tsx `handleSubmitForApproval`, `handleApproveItem`, `handleRejectItem` |
| X2 | P1 | Approve buntu: dedupe berdasarkan judul, item tetap di queue, hero Published mengumumkan post yang tidak ada di tabel | App.tsx `handleApproveItem`, types.ts `QueueItem.status` |
| — | P1 | Save draft menampilkan toast "Saved", padahal tidak terjadi apa-apa | App.tsx prop `onSaveDraft` |
| — | P1 | Ekspor CSV Activity log **terpotong** di karakter `#` pertama (data: URI + `encodeURI`). ACT-03 mengandung `#FFE14D` | AdminActivityLogScreen `handleExportCsv` |
| X3 | P2 | Activity log hanya ditulis saat submit Staff. Kategori Approved/Revision/Published/Admin tidak pernah muncul | App.tsx |
| X4 | P2 | `connectedPlatforms` tidak sampai ke pill topbar, StaffPlatforms, dan Published | App.tsx, LayoutShell, PublishedScreen |
| X5 | P2 | `QueueItem.revisionNote` dipakai untuk 2 hal (catatan Staff dan feedback Head), dan Head tidak pernah melihatnya | App.tsx, HeadReviewQueueScreen |
| X6 | P2 | `typoFixed` adalah boolean global yang tak pernah di-reset. Submit dan Approve tidak dijaga saat typo belum diperbaiki | App.tsx, StaffPlatforms, HeadReviewQueue |
| X7 | P2 | Angka "live" hard-coded: badge sidebar, stat queue, KPI Admin ("Published 19" vs 9 data), hero Published | LayoutShell, HeadReviewQueue, AdminDashboard, Published |
| X8 | P2 | Role dan layar bisa tidak sinkron. Langkah 3 di StaffUpload membuka head-queue saat masih role Staff | App.tsx `handleNavigate`, StaffUploadScreen |
| X9 | P2 | Sign out tidak me-reset state | LayoutShell, App.tsx |
| X10 | P2 | Dataset mock bertentangan (pemilik, status, judul duplikat, item orang lain di "My submissions" milik Rina) | mockData.ts |
| X14 | P2 | Kelas `.gaskeun-*` tidak ber-@layer, sehingga **mengalahkan utility Tailwind** di elemen yang sama. Contoh: banner sukses submit seharusnya biru tapi tampil putih | index.css |
| X17 | P2 | Jebakan tooling: build tanpa typecheck, dan formatter merusak file | package.json, .figma/make/format |
| — | P2 | Pagination tidak di-clamp, sehingga muncul halaman kosong "Showing 7–6 of 6" di AdminUsers | SharedUI `PaginationBar`, AdminUsersScreen |
| X11–X13, X15, X16 | P3 | Identitas orang tersebar di banyak sumber, union status diduplikasi, id ajaib, UI duplikat (stepper, upload logo, pagination), dan onNavigate di layar tidak bisa meneruskan `staffTab` | lihat TEMUAN_LENGKAP |

Detail tiap baris (bukti kode dan saran perbaikan) ada di [TEMUAN_LENGKAP.md](TEMUAN_LENGKAP.md).

---

## 6. Jebakan untuk model kecil (WAJIB dibaca)

1. **"Aplly now" di `PosterGraphic` (SharedUI) itu DISENGAJA.** Typo ini adalah inti demo "Typo detected → Fixed" lewat prop `typoFixed`, dan tersebar di 6 tempat. **Jangan "perbaiki" ejaannya.** Placeholder `[CITY]` dan `[DEADLINE]` juga disengaja.
2. **lucide-react v1 tidak punya ikon brand.** `import { Instagram, Linkedin } from 'lucide-react'` menghasilkan undefined dan crash saat render. Impor dari `../components/SharedUI`. TikTok memakai ikon lucide `Video`. Perhatikan beda kapitalisasi: tipe `'LinkedIn'` (I kapital), komponen `Linkedin`.
3. **Ekspor named vs default.** Layar memakai default export. `LayoutShell` dan semua isi `SharedUI` memakai named export. Jangan ubah gaya impor di satu tempat saja.
4. **Id ajaib** `'SUB-1042'` (App + default seleksi di HeadReviewQueue) dan `'CAL-09'` (saran kalender). Kalau di-rename, alurnya rusak **tanpa error tipe**.
5. **Dataset hanya terhubung lewat string judul dan nama.** Judul `"We're hiring: UI/UX Designer"` mengandung apostrof, jadi wajib pakai tanda kutip ganda. Apostrof dalam string ber-kutip tunggal akan merusak build. Di JSX, pakai `&apos;`.
6. **Menambah status queue** (misalnya Approved atau Rejected) berarti mengubah `types.ts` `QueueItem.status`, union duplikat di `App.tsx` (`handleUpdateQueueItemStatus`) dan `HeadReviewQueueScreen` (2 tempat), serta menambah key di map `styles` milik `StatusChip`. Kalau tidak, status yang tidak dikenal diam-diam memakai gaya Draft.
7. **Kelas `.gaskeun-*` mengalahkan utility** (lihat X14). Selama task @layer belum selesai, menambah `bg-*`/`border-*` pada elemen `gaskeun-card` **tidak berefek**.
8. **`PaginationBar` tidak clamp.** Setiap perubahan filter atau pencarian wajib memanggil `setCurrentPage(1)`.
9. **Layar di-unmount saat navigasi.** Tombol Approve memanggil `onApproveItem`, lalu `onNavigate('published')`, sehingga banner apa pun di queue tidak akan pernah terlihat. State yang harus bertahan wajib diangkat ke App.
10. **Dua setter role** (lihat §4). Untuk ganti role lalu navigasi, panggil `onSelectRole` dulu, baru `onNavigate`.
11. **"Hari ini" = Rabu 14 Okt 2026.** Ini tersebar di HeadCalendar (`isToday`), App (`'Just now · 14 Oct 2026'`), dan mockData. Ubah semuanya sekaligus.
12. **`StaffSubmissionsScreen` menyimpan tab lokal dan juga `activeStaffTab` milik App.** Setiap ganti tab wajib memanggil `onTabChange`, kalau tidak highlight sidebar akan meleset.
13. **Inisial `RP` dipakai dua orang** (Rina Putri dan Raka Pratama). Jangan jadikan inisial sebagai key.
14. **File panjang dengan class string yang berulang** (App, LayoutShell, HeadReviewQueue, mockData). Untuk `old_string` di Edit, sertakan teks unik seperti label, nama handler, atau komentar `{/* Section */}`.
15. **Dua palet warna.** Chrome aplikasi memakai navy/biru/cyan/lime. Brand klien Lumbung memakai Sun `#FFE14D`, Ink `#1F1A2E`, dan Berry `#F0307A`. Jangan pakai warna klien untuk chrome aplikasi.

## 7. Konvensi kode

- **State:** semua state lintas-layar ada di `App.tsx` (`useState`). Handler diberi nama `handleX`, dan diteruskan sebagai prop `onX`. Layar hanya menyimpan state UI lokal.
- **Update immutable:** `setX(prev => prev.map(...))`, `{ ...prev, [k]: v }`, dan baris baru ditambahkan di depan: `[newItem, ...prev]`.
- **Layar:** `export default function XScreen({...}: XScreenProps)` dengan `interface XScreenProps` tepat di atasnya.
- **Impor:** pakai **path relatif** (`'../types'`). Alias `@` ada tapi tidak dipakai.
- **Gaya penulisan:** kutip tunggal, titik koma, indentasi 2 spasi, dan trailing comma.
- **Styling:** Tailwind dengan hex arbitrer. Pakai ulang hex yang sudah ada:

  | Peran | Hex |
  |---|---|
  | ink | `#0B1F4D` |
  | muted | `#52607E` |
  | primary (hover) | `#1450E0` (`#1044C4`) |
  | border | `#E6ECF5` |
  | border input | `#D5DEEE` |
  | latar halaman | `#F5F7FC` |
  | panel AI | `#F2F6FF` / `#D9E4FF` |
  | success | `#146C3C` / `#E5F5EC` |
  | warning | `#7A5300` / `#FFF4D6` |
  | lime | `#BBFB52` |
  | cyan | `#08D9F0` |

- **Tombol:** selalu `type="button"`, `cursor-pointer`, dan `min-h-[44px]`. Untuk disabled: `disabled:opacity-40 disabled:pointer-events-none`.
- **Pola list:** `search` + filter chip, lalu `useMemo` filtered, lalu `useMemo` slice per halaman (`pageSize` lokal). Kalau kosong tampilkan `EmptyFilterState onReset`, kalau ada isi tampilkan list dengan `PaginationBar`.
- **Id runtime:** `PREFIX-${Date.now()}`. Prefix seed: SUB-, PUB-, MY-, CAL-, DES-, USR-, ACT-. Waktu ditulis relatif ("Just now").
- **Bahasa:** copy UI berbahasa Inggris dengan nama-nama Indonesia.

---

## 8. Keputusan produk yang perlu dijawab pemilik proyek

Jawab sebelum mengerjakan task terkait, karena model kecil tidak boleh menebak jawabannya.

1. **Reject:** apakah item dihapus, diarsip dengan status `Rejected`, atau dikembalikan ke Staff? Saat ini perilakunya sama dengan revisi.
2. **Bahasa UI:** tetap Inggris, atau dilokalkan ke Bahasa Indonesia? `site.json` belum mengatur `language`.
3. **Tetap mock-only, atau nanti disambungkan ke backend / AI sungguhan?** Jawabannya menentukan apakah refactor state ke hooks/context layak dikerjakan sekarang.
4. Apakah Figma Make akan menimpa `package.json` / `site.json` / `CLAUDE.md` saat sinkronisasi? Kalau ya, task yang mengedit file itu berisiko ter-revert.

## 9. Yang belum diverifikasi

- Belum ada klik-uji di browser. Semua temuan berasal dari pembacaan kode. Bug visual (banner CSS, `py-0.2`, tampilan mobile) masih berupa inferensi.
- Responsif di ukuran ponsel (sidebar menumpuk di atas konten, grid kalender 7 kolom), kontras warna di luar Berry, dan keyboard / screen reader belum diuji langsung.
- Performa: belum ada code splitting per layar, dan Google Fonts dimuat lewat `@import` yang memblokir render.
