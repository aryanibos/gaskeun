# Backlog Tugas untuk Claude Haiku

> Baca dulu [ANALISIS_PROYEK.md](ANALISIS_PROYEK.md), minimal §4 (aliran data) dan §6 (jebakan).
> Setiap tugas sengaja dibuat kecil, menyentuh sedikit file, dan punya kriteria terima yang bisa dicek.
> Nomor baris di repo akan bergeser setelah edit. **Cari lokasi berdasarkan nama fungsi atau teks unik**, bukan nomor baris.

---

## 0. Persiapan (dikerjakan pemilik proyek, sekali saja)

1. **Jadikan folder ini repo git, lalu commit baseline** (`git init`, `git add -A`, `git commit -m "baseline"`).
   - Saat ini folder **bukan** repo git, jadi perubahan tidak bisa di-diff atau di-revert.
   - Workflow Ultracode juga tidak bisa memakai `isolation: 'worktree'` tanpa git, sehingga agen yang berjalan paralel **wajib** mengerjakan file yang berbeda-beda.
2. Pastikan `node_modules` sudah ada (`pnpm install`). Status 2026-10-18: sudah terpasang.
3. Jawab keputusan produk di ANALISIS_PROYEK §8, terutama soal semantik Reject.

## 1. Aturan kerja per tugas

- **Verifikasi wajib** setiap selesai satu tugas: jalankan `pnpm exec tsc --noEmit -p .` (harus 0 error), lalu `pnpm build`.
- **Jangan** jalankan `pnpm format`, `oxfmt`, atau `.figma/make/format`.
- **Jangan** edit `vite.config.ts`, `.figma/make/*` (kecuali `site.json` di T09), `.mise.toml`, atau slot `<!-- figma:* -->` di `index.html`.
- **Jangan** tambah dependency. Jangan pakai react-router, zustand, clsx, dan sejenisnya.
- **Jangan** perbaiki ejaan "Aplly", dan jangan hapus `[CITY]` / `[DEADLINE]`. Keduanya disengaja.
- Ikon Instagram/LinkedIn diimpor dari `SharedUI`, bukan dari `lucide-react`.
- String yang mengandung apostrof wajib memakai kutip ganda. Di teks JSX, pakai `&apos;`.
- Satu tugas = satu perubahan yang terfokus. Jangan merapikan kode di luar lingkup tugas.
- Kalau ada langkah yang ternyata tidak cocok dengan kode, **berhenti dan laporkan**. Jangan menebak.

## 2. Aturan paralel (Ultracode)

- Tugas dalam **satu gelombang** boleh dijalankan paralel **hanya jika daftar file-nya tidak beririsan**. Kolom *File* adalah kontrak kepemilikan file.
- Semua tugas yang menyentuh `src/App.tsx` membentuk **jalur App** dan **harus berurutan** (T02 → T10 → T11 → …).
- Tanpa git dan worktree, jangan pernah ada dua agen yang menulis file yang sama pada waktu bersamaan.
- Pola workflow yang disarankan per gelombang:
  1. Satu agen implementasi per tugas.
  2. Satu agen verifikator yang mencoba **membantah** kriteria terima dengan membaca diff dan menjalankan tsc.
  3. Perbaikan, lalu lanjut ke tugas berikutnya.

### Template prompt untuk satu agen implementasi

```
Kerjakan tugas <ID> di docs/BACKLOG_HAIKU.md pada proyek ini.
Baca docs/ANALISIS_PROYEK.md §6 dan §7 sebelum mengedit.
Hanya ubah file yang tercantum di kolom File tugas itu.
Setelah selesai jalankan `pnpm exec tsc --noEmit -p .` dan laporkan: file yang diubah, ringkasan diff,
hasil tsc, dan apakah setiap kriteria terima terpenuhi (dengan bukti).
```

---

## Gelombang 1: paralel (file tidak beririsan)

| ID | Pri | Judul | File |
|---|---|---|---|
| T01 | P1 | Perbaiki ekspor CSV yang terpotong | `src/screens/AdminActivityLogScreen.tsx` |
| T02 | P1 | Approve: keluarkan dari queue, dedupe pakai id sumber | `src/types.ts`, `src/App.tsx` |
| T03 | P2 | Pindahkan `.gaskeun-*` ke `@layer components` | `src/index.css` |
| T04 | P2 | Copy TikTok connected, dan gate tombol "Send test" | `src/screens/AdminConnectedScreen.tsx` |
| T05 | P2 | Guard submit Staff, badge "Ready" yang sungguhan | `src/screens/StaffPlatformsScreen.tsx` |
| T06 | P2 | Clamp pagination | `src/components/SharedUI.tsx`, `src/screens/AdminUsersScreen.tsx`, `src/screens/HeadReviewQueueScreen.tsx` |
| T07 | P2 | Rekonsiliasi data mock | `src/data/mockData.ts` |
| T08 | P3 | Label dan aria pada form Login/Staff | `src/screens/LoginScreen.tsx`, `src/screens/StaffUploadScreen.tsx`, `src/screens/StaffSubmissionsScreen.tsx` |
| T09 | P2 | Judul tab dan favicon | `.figma/make/site.json`, `public/favicon.svg` |

### T01 · P1 · Perbaiki ekspor CSV Activity log
**File:** `src/screens/AdminActivityLogScreen.tsx` · **Bergantung pada:** tidak ada

**Masalah:** `handleExportCsv` membuat `data:` URI lalu memakai `encodeURI`. Karakter `#` tidak di-escape, sehingga file terpotong di `#` pertama. Entri ACT-03 mengandung `#FFE14D`.

**Langkah:**
1. Di `handleExportCsv`, tambahkan `const csvCell = (v: string) => `"${String(v).replace(/"/g, '""')}"`;`, lalu terapkan ke **setiap** kolom (id, timestamp, person, personRole, actionCategory, actionLabel, targetTitle, detail).
2. Susun `const csv = '﻿' + [headers.map(csvCell).join(','), ...rows.map((r) => r.join(','))].join('\n');`.
3. Ganti data URI dengan `const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob);`. Buat anchor, set atribut `download`, panggil `click()`, lalu `URL.revokeObjectURL(url)`.
4. Jangan ubah perilaku toast.

**Kriteria terima:**
- Dengan filter "All", file berisi 25 baris (1 header + 24 data).
- Detail ACT-03 tetap utuh, termasuk `#FFE14D` dan `→`.
- Field yang mengandung tanda kutip tidak merusak kolom.
- tsc 0 error.

### T02 · P1 · Approve mengeluarkan item dari queue dan dedupe pakai id sumber
**File:** `src/types.ts`, `src/App.tsx` · **Bergantung pada:** tidak ada · **Memulai jalur App**

**Langkah:**
1. Di `types.ts`, tambahkan `sourceQueueId?: string;` ke `PublishedPostItem`.
2. Di `handleApproveItem`:
   - Ganti `prev.some((p) => p.title === item.title)` menjadi `prev.some((p) => p.sourceQueueId === item.id)`.
   - Untuk baris baru, pakai id `PUB-${Date.now()}` dan tambahkan `sourceQueueId: item.id`.
3. Masih di handler yang sama, tambahkan `setQueueItems((prev) => prev.filter((i) => i.id !== item.id));`.
4. Ubah `handleSubmitForApproval` menjadi **upsert**. Kalau tidak ada item ber-id `'SUB-1042'`, tambahkan di depan sebuah salinan `INITIAL_QUEUE_ITEMS[0]` yang sudah diisi field baru (status `'Submitted'`, platforms, captions, note). Ini supaya submit ulang setelah approve tetap berfungsi.

**Kriteria terima:**
- Approve "Product launch carousel" (SUB-1041) menambah baris teratas di tabel Published, dan queue menjadi 6 item.
- Approve item hiring, lalu submit lagi dari Staff Platforms, membuat SUB-1042 muncul kembali di queue.
- tsc 0 error.

**Catatan:** setelah queue kosong, `EmptyFilterState` akan menampilkan "Nothing matches these filters". Copy ini keliru tapi tidak crash. Biarkan untuk tugas terpisah.

### T03 · P2 · Kelas `.gaskeun-*` ke `@layer components`, ditambah gaya disabled dan focus
**File:** `src/index.css` · **Bergantung pada:** tidak ada

**Langkah:**
1. Baris 1 (`@import url(...)` Google Fonts) dan baris 2 (`@import 'tailwindcss';`) **tetap paling atas**.
2. Bungkus semua aturan `.gaskeun-card`, `.gaskeun-btn-primary`, `.gaskeun-btn-secondary`, `.gaskeun-ai-panel`, dan `.gaskeun-h1` (termasuk `:hover`-nya) dalam `@layer components { ... }`.
3. Di dalam layer yang sama, tambahkan:
   - `.gaskeun-btn-primary:disabled, .gaskeun-btn-secondary:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; transform: none; }`
   - `.gaskeun-btn-primary:focus-visible, .gaskeun-btn-secondary:focus-visible { outline: 2px solid #1450E0; outline-offset: 2px; }`
4. Tambahkan blok `@media (prefers-reduced-motion: reduce)` yang mematikan transition dan transform hover pada tombol.

**Kriteria terima:**
- Banner sukses setelah submit di Staff Platforms tampil biru muda (`#E6EFFF`) dengan border biru.
- Kartu lain tidak berubah tampilannya.
- Menekan Tab ke tombol primary memunculkan outline biru.
- `pnpm build` sukses.

### T04 · P2 · AdminConnected: copy TikTok dan gate "Send test"
**File:** `src/screens/AdminConnectedScreen.tsx` · **Bergantung pada:** tidak ada

**Langkah:**
1. Di array `platforms` lokal, ubah entri TikTok: `tokenStatus: 'OAuth 2.0 healthy · Expires in 90 days'` dan `lastSync: 'Synced just now'`. Copy saat disconnected sudah ditangani oleh cabang `isConnected ? … : …`.
2. Tambahkan `disabled={!emailNotif}` pada tombol "Send test" Email, dan `disabled={!telegramNotif}` pada tombol Telegram. Sesuaikan dengan nama state yang ada di file. Tambahkan juga class `disabled:opacity-40 disabled:pointer-events-none`.
3. Tambahkan `aria-label` pada kedua tombol `role="switch"`.

**Kriteria terima:**
- Setelah "Connect TikTok", kartu menampilkan "Connected" dan "Synced just now".
- Saat switch Email mati, tombol Send test nonaktif.
- tsc 0 error.

### T05 · P2 · Guard submit Staff dan badge "Ready" yang sungguhan
**File:** `src/screens/StaffPlatformsScreen.tsx` · **Bergantung pada:** tidak ada

**Langkah:**
1. Ubah atribut `disabled` tombol Submit menjadi `selectedPlatforms.length === 0 || !typoFixed || submittedModal`.
2. Di bawah tombol, tampilkan `{!typoFixed && <p className="text-[11px] text-[#7A5300]">Fix the flagged typo before submitting.</p>}`.
3. Badge "Ready" hanya tampil bila `typoFixed && selectedPlatforms.length > 0`. Selain itu tampilkan "Needs fixes" (teks `#7A5300` di atas `#FFF4D6`).
4. `handleSubmit` langsung `return` bila `submittedModal` bernilai true.
5. Setelah submit, panggil `window.scrollTo({ top: 0, behavior: 'smooth' })`, dan tambahkan `role="status" aria-live="polite"` pada banner sukses.

**Kriteria terima:**
- Submit nonaktif sampai typo "Aplly" diperbaiki.
- Klik kedua setelah submit berhasil tidak mungkin dilakukan.
- tsc 0 error.

### T06 · P2 · Clamp pagination
**File:** `src/components/SharedUI.tsx`, `src/screens/AdminUsersScreen.tsx`, `src/screens/HeadReviewQueueScreen.tsx` · **Bergantung pada:** tidak ada

**Langkah:**
1. Di `PaginationBar`, hitung `const totalPages = Math.max(1, Math.ceil(totalItems / pageSize)); const safePage = Math.min(currentPage, totalPages);`. Pakai `safePage` untuk startItem, endItem, dan tombol aktif.
2. Di `AdminUsersScreen`, hitung `safePage` yang sama, lalu pakai di `slice` dan sebagai `currentPage` milik PaginationBar.
3. Lakukan hal yang sama di `HeadReviewQueueScreen` (pada `useMemo` yang melakukan slice).
4. Panggilan `setCurrentPage(1)` yang sudah ada tetap dipertahankan.

**Kriteria terima:**
- Di Admin Users dengan filter role Staff, buka halaman 2, lalu ubah 3 user Staff menjadi Head. Tabel harus menampilkan halaman valid terakhir yang berisi data. Tidak boleh ada tabel kosong atau teks "Showing 7–6 of 6".
- tsc 0 error.

### T07 · P2 · Rekonsiliasi data mock
**File:** `src/data/mockData.ts` · **Bergantung pada:** tidak ada · **Dilarang** mengubah id `SUB-1042`, `CAL-09`, `MY-201`, `CAL-06`.

**Langkah:**
1. Ubah judul post Published yang menduplikasi item queue menjadi edisi lampau:

   | Id | Judul baru | Perubahan lain |
   |---|---|---|
   | PUB-901 | `"We're hiring: Brand Designer"` | `publishedAt: '07 Oct 2026, 10:00'` |
   | PUB-899 | 'Product launch teaser' | |
   | PUB-898 | 'Friday sharing session (Typography)' | |
   | PUB-897 | 'Q2 client case study' | |
   | PUB-896 | 'Team outing teaser' | |
   | PUB-895 | 'Studio anniversary post' | |
   | PUB-894 | '10.10 promo teaser' | designer 'Sari Wulandari' |

2. Di `INITIAL_STAFF_SUBMISSIONS` (daftar milik Rina), ganti judul item yang sebenarnya milik orang lain:

   | Id | Judul baru |
   |---|---|
   | MY-202 | 'Hiring story cut v2' |
   | MY-203 | 'Brand refresh teaser' |
   | MY-205 | 'Studio tour story' |
   | MY-206 | 'Design crit recap' |
   | MY-207 | 'Behind-the-scenes reel' |
   | MY-208 | 'Client testimonial card' |

   Status dan jumlah tetap: 12 baris, 3 di antaranya Draft.
3. Ubah status MY-201 menjadi `'Submitted'`.
4. Beri CAL-14 judul berbeda: '11.11 countdown story'.
5. Grep seluruh `src/` untuk setiap judul yang diubah, dan pastikan tidak ada file lain yang merujuknya.

**Kriteria terima:**
- Tidak ada judul yang muncul sekaligus di `INITIAL_QUEUE_ITEMS` dan `INITIAL_PUBLISHED_POSTS`.
- Panjang array tidak berubah (7/9/12/14/7/12/24).
- tsc 0 error.

### T08 · P3 · Label dan aria pada form Login/Staff
**File:** `src/screens/LoginScreen.tsx`, `src/screens/StaffUploadScreen.tsx`, `src/screens/StaffSubmissionsScreen.tsx` · **Bergantung pada:** tidak ada

**Langkah:**
1. Pakai `useId()` untuk menghubungkan setiap pasangan `<label htmlFor>` dengan `<input id>` (email/password di Login; field title/caption/hashtag di StaffUpload).
2. Tambahkan `aria-label` pada input yang hanya punya placeholder (input hashtag, search dan select di StaffSubmissions).
3. Di LoginScreen, hapus `cursor-pointer` dan `hover:underline` dari span "SSO enabled".
4. Di StaffUpload, simpan timer toast dalam `useRef` dengan cleanup saat unmount, dan nonaktifkan tombol Regenerate selama proses regenerate.

**Kriteria terima:**
- Klik label memfokuskan field-nya.
- Tidak ada input tanpa nama aksesibel.
- tsc 0 error.

### T09 · P2 · Judul tab dan favicon
**File:** `.figma/make/site.json`, `public/favicon.svg` · **Bergantung pada:** tidak ada

**Langkah:**
1. Tambahkan `"title": "GasKeun"` ke `site.json`. Key lain tidak diubah. **Jangan** edit `index.html` atau `vite.config.ts`.
2. Ganti `public/favicon.svg` dengan SVG 32×32 berupa kotak membulat bergradien `#1450E0` → `#08D9F0` dan huruf "G" putih tebal. Bentuknya bisa disalin dari `GaskeunLogo` di SharedUI.

**Kriteria terima:**
- `pnpm build` menghasilkan `dist/index.html` yang memuat `<title>GasKeun</title>`.
- Hapus folder `dist/` setelah dicek.

---

## Gelombang 2: jalur App (berurutan), ditambah tugas layar yang menyusul

Kerjakan **T10 → T21 secara berurutan**, karena semuanya menyentuh `App.tsx`. T22–T24 tidak menyentuh App, sehingga boleh berjalan paralel dengan jalur App setelah dependensinya selesai dan file-nya tidak sedang dipakai tugas lain.

| ID | Pri | Judul | File | Setelah |
|---|---|---|---|---|
| T10 | P1 | Helper `logActivity` untuk semua aksi | App.tsx | T02 |
| T11 | P1 | Save draft yang sungguhan | App.tsx | T10 |
| T12 | P1 | Propagasi submit dan keputusan Head ke My submissions dan kalender | mockData.ts, App.tsx | T11, T07 |
| T13 | P2 | Pisahkan catatan Staff dari catatan revisi Head | types.ts, App.tsx, HeadReviewQueueScreen.tsx | T12, T06 |
| T14 | P2 | `latestApprovedItem` nullable | App.tsx, PublishedScreen.tsx | T13 |
| T15 | P2 | Submit hanya mengirim caption platform terpilih, ditambah hashtag dan judul hasil edit | App.tsx | T14 |
| T16 | P2 | Saran kalender: state turunan, slot di masa depan | App.tsx, HeadCalendarScreen.tsx | T15 |
| T17 | P2 | Role ditentukan dari layar di `handleNavigate`; langkah 3 StaffUpload tidak bisa diklik | App.tsx, StaffUploadScreen.tsx | T16, T08 |
| T18 | P3 | Validasi invite Admin, guard admin terakhir | App.tsx, AdminUsersScreen.tsx | T17, T06 |
| T19 | P2 | Badge LayoutShell dan pill koneksi berbasis data | LayoutShell.tsx, App.tsx | T18 |
| T20 | P2 | `handleSignOut` me-reset state | App.tsx, LayoutShell.tsx | T19 |
| T21 | P2 | StaffPlatforms menerima `connectedPlatforms` dan `drafts` | App.tsx, StaffPlatformsScreen.tsx | T20, T05 |
| T22 | P2 | Hero, timeline, dan preview Published diturunkan dari item | PublishedScreen.tsx | T14 |
| T23 | P2 | Guard Approve Head, perbaikan panel detail | HeadReviewQueueScreen.tsx | T13 |
| T24 | P2 | `StatusChip` dengan prop `label`, satu chip kategori aktivitas bersama | SharedUI.tsx, AdminActivityLogScreen.tsx, AdminDashboardScreen.tsx | T06, T01 |

### T10 · P1 · Helper `logActivity`
**Langkah:**
1. Di App, tambahkan:
   ```ts
   const logActivity = (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) =>
     setActivityLogs((prev) => [{ id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: 'Just now', ...entry }, ...prev]);
   ```
2. Refactor `handleSubmitForApproval` agar memakai helper ini, dengan `person: ROLE_PROFILES.Staff.name`.
3. Panggil helper dari handler berikut:

   | Handler | Field log |
   |---|---|
   | `handleApproveItem` | person `ROLE_PROFILES.Head.name`, personRole `'Head'`, actionCategory `'Approved'`, actionLabel `'Approved & auto-published'`, targetTitle judul item |
   | `handleUpdateQueueItemStatus` (untuk `'Revision'`) | category `'Revision'`, detail = isi catatan |
   | `handleRejectItem` | category `'Revision'`, label `'Rejected submission'`; judul diambil dari `queueItems` |
   | `handleChangeUserRole`, `handleInviteUser`, `handleToggleConnect` | person `ROLE_PROFILES.Admin.name`, personRole `'Admin'`, category `'Admin'` |
   | `handleApplyCalendarSuggestion` | personRole `'Head'`, category `'AI check'` |

**Kriteria terima:**
- Approve satu item, invite satu user, dan disconnect Instagram menghasilkan 3 baris baru di Activity log dan di "Recent activity" Dashboard.
- tsc 0 error.

### T11 · P1 · Save draft yang sungguhan
**Langkah:**
1. Tambahkan `handleSaveDraft`. Handler ini meng-upsert baris `StaffSubmissionItem` dengan id `'MY-DRAFT-CURRENT'` dan field: `title: drafts.Instagram.title`, `type: 'Poster'`, `platforms: selectedPlatforms`, `status: 'Draft'`, `updatedAt: 'Just now'`, `reviewer: ROLE_PROFILES.Head.name`. Kalau id sudah ada, perbarui barisnya; kalau belum, tambahkan di depan.
2. Ganti prop inline no-op `onSaveDraft={() => { setStaffSubmissions((prev) => [...prev]); }}` menjadi `onSaveDraft={handleSaveDraft}`.

**Kriteria terima:**
- Klik Save draft, lalu buka tab Drafts: hitungannya naik dari 3 ke 4.
- Klik kedua tidak membuat duplikat.

### T12 · P1 · Propagasi ke My submissions dan kalender
**Langkah:**
1. Di mockData, ekspor `export const CURRENT_FLOW_IDS = { queue: 'SUB-1042', staff: 'MY-201', calendar: 'CAL-06' } as const;`.
2. Ganti literal `'SUB-1042'` di App dengan `CURRENT_FLOW_IDS.queue`.
3. `handleSubmitForApproval` juga memperbarui baris staff `CURRENT_FLOW_IDS.staff` dengan: status `'Submitted'`, `updatedAt: 'Just now'`, judul hasil edit, `selectedPlatforms`, dan `revisionNote: undefined`.
4. Buat helper `syncStaffFromQueue(queueId, patch)` yang hanya memetakan `CURRENT_FLOW_IDS.queue → CURRENT_FLOW_IDS.staff`. Panggil dari:
   - aksi revisi: status `'Revision'` beserta catatannya
   - aksi reject: status `'Revision'`
   - aksi approve: status `'Published'`
5. Approve item `CURRENT_FLOW_IDS.queue` juga mengubah status calendar `CAL-06` menjadi `'Published'`.

**Kriteria terima:**
- Setelah submit Staff, MY-201 tampil di tab "In review" dengan "Just now".
- "Request revision" dari Head beserta catatannya memunculkan banner Revision di layar Staff.
- Approve membuat MY-201 dan CAL-06 berstatus Published.

### T13 · P2 · Catatan Staff terpisah dari catatan revisi Head
**Langkah:**
1. Tambahkan `staffNote?: string;` ke `QueueItem`.
2. Submit mengisi `staffNote` dan **berhenti menulis `revisionNote`**.
3. Aksi revisi memakai `revisionNote: note !== undefined ? note : item.revisionNote`.
4. Di panel detail HeadReviewQueue, di atas caption, tampilkan "Note from designer" (`staffNote`) dan "Last revision note" (`revisionNote`) dengan gaya kotak `gaskeun-ai-panel`. Masing-masing hanya tampil bila nilainya ada.
5. Saat baris queue diklik, reset juga `setRevisionNoteInput('')`.

**Kriteria terima:**
- SUB-1040 menampilkan catatan revisi seed-nya.
- Catatan dari submit Staff terlihat oleh Head.
- Ketikan catatan tidak terbawa saat pindah ke baris lain.

### T14 · P2 · `latestApprovedItem` nullable
**Langkah:**
1. Ubah state menjadi `useState<QueueItem | null>(null)`.
2. Di PublishedScreen, ubah tipe prop menjadi `QueueItem | null`, lalu bungkus hero, timeline, dan preview dengan `{latestApprovedItem && (...)}`.
3. Bila nilainya null, tampilkan `gaskeun-card` kecil berisi: "No post approved in this session yet. Approve one from the Review queue."

**Kriteria terima:**
- Membuka Published langsung setelah login hanya menampilkan kartu info dan tabel.
- Setelah approve, hero tampil dengan judul item tersebut.

### T15 · P2 · Submit mengirim caption platform terpilih
**Langkah:**
1. Di `handleSubmitForApproval`, buat `const platforms = selectedPlatforms.length ? selectedPlatforms : (['Instagram', 'LinkedIn'] as PlatformName[]);` dan `const withTags = (p: PlatformName) => `${drafts[p].caption} ${drafts[p].hashtags.join(' ')}`.trim();`.
2. Untuk captions, isi hanya platform yang terpilih (selebihnya `''`, atau `undefined` untuk TikTok), lalu set `title: drafts.Instagram.title`.

**Kriteria terima:**
- Submit dengan hanya Instagram terpilih membuat panel Head menampilkan caption Instagram saja, lengkap dengan hashtag.
- Judul di queue sama dengan judul hasil edit.

### T16 · P2 · Saran kalender
**Langkah:**
1. `handleApplyCalendarSuggestion` memindahkan CAL-09 ke `dayIndex: 3, time: '19:00'` (Kamis 15 Okt) **tanpa** mengubah statusnya.
2. Di HeadCalendar, hapus state lokal `suggestionApplied`. Turunkan nilainya dengan `posts.find((p) => p.id === 'CAL-09')?.dayIndex === 3`.
3. Perbarui copy saran menjadi Thu 15 Oct.
4. Panel saran hanya tampil bila `weekIndex === 1`.

**Kriteria terima:**
- Setelah Apply, keluar lalu kembali ke kalender: status "applied" tetap terlihat.
- Panel saran tersembunyi di minggu lain.

### T17 · P2 · Role ditentukan dari layar
**Langkah:**
1. Impor `ALL_SCREENS_LIST` dari LayoutShell.
2. Di `handleNavigate`, tambahkan: cari `role` milik layar tujuan di list. Kalau ketemu dan layarnya bukan `login` maupun `brand-guidelines`, panggil `setCurrentRole(role)`.
3. Di StaffUpload, ubah langkah stepper ke-3 ("Head approval") menjadi `<div aria-disabled="true">` tanpa `onClick`, `cursor-pointer`, maupun gaya hover.

**Kriteria terima:**
- Navigasi lewat jumper atau tautan dalam layar selalu menampilkan menu sidebar yang sesuai dengan role layar tersebut.

### T18 · P3 · Validasi invite Admin
**Langkah:**
1. `handleInviteUser` mengembalikan `boolean`. Kembalikan `false` bila email (tidak peka huruf besar/kecil) sudah ada di daftar. Pakai id `USR-${Date.now()}`.
2. Ubah tipe prop di AdminUsers menjadi `(email, role) => boolean`, dan tampilkan toast error "Already a member" bila hasilnya false.
3. `<select>` role diberi `disabled` bila user tersebut satu-satunya Admin, atau statusnya `Deactivated`.

**Kriteria terima:**
- Invite `rina.putri@lumbung.studio` menampilkan error.
- Role Ayu tidak bisa diubah dari Admin.

### T19 · P2 · Badge LayoutShell dan pill berbasis data
**Langkah:**
1. Tambahkan dua prop ke `LayoutShellProps`: `counts: { mySubmissions: number; drafts: number; queue: number }` dan `connectedPlatforms: Record<PlatformName, boolean>`.
2. Ganti badge literal 12, 3, dan 5 dengan nilai dari `counts`.
3. Teks pill dihitung dari platform yang terhubung, misalnya "LinkedIn connected". Bila tidak ada satu pun, tampilkan "No accounts connected" dengan gaya amber.
4. Dari App, kirim `counts` yang dihitung dari `staffSubmissions` dan `queueItems` (queue = status selain `'Revision'`), beserta `connectedPlatforms`.

**Kriteria terima:**
- Disconnect Instagram mengubah pill menjadi "LinkedIn connected".
- Save draft menaikkan badge Drafts.
- Approve menurunkan badge queue.

### T20 · P2 · `handleSignOut`
**Langkah:**
1. Buat `handleSignOut` di App. Handler ini mengembalikan semua state ke nilai `INITIAL_*` / default, termasuk `typoFixed = false`, `latestApprovedItem = null`, dan `activeStaffTab = 'All'`, lalu memanggil `setCurrentScreen('login')`. `customLogoUrl` dipertahankan.
2. Tambahkan prop `onSignOut` di LayoutShell dan pakai pada tombol Sign out, menggantikan `onNavigate('login')`.

**Kriteria terima:**
- Perbaiki typo, submit, sign out, lalu masuk lagi sebagai Staff: poster kembali menampilkan "Typo detected".

### T21 · P2 · StaffPlatforms menerima `connectedPlatforms` dan `drafts`
**Langkah:**
1. Tambahkan kedua prop dan kirim dari App.
2. Kartu platform yang belum terhubung diberi tag amber "Not connected".
3. Teks checklist "278/342 chars, 6/5 hashtags" yang hard-coded diganti dengan panjang caption dan jumlah hashtag yang sebenarnya dari `drafts`.
4. Judul di banner sukses memakai `drafts.Instagram.title`, dan nama reviewer memakai `ROLE_PROFILES.Head.name`.

**Kriteria terima:**
- Untuk draf seed, checklist menampilkan 286 dan 326 chars, dan angkanya ikut berubah setelah diedit.
- TikTok berlabel "Not connected" sampai Admin menghubungkannya.

### T22 · P2 · Published diturunkan dari item yang di-approve
**Langkah:**
1. Badge, subtitle, dan timeline memakai `latestApprovedItem.platforms.join(' & ')`.
2. Stat jumlah platform memakai `.platforms.length`.
3. Risiko ditampilkan sebagai `${riskLevel} (${riskScore}/100)`.
4. Preview Instagram dan LinkedIn hanya dirender bila platform tersebut termasuk dalam item.
5. Nama approver memakai `ROLE_PROFILES.Head.name`.

**Kriteria terima:**
- Approve SUB-1040 menampilkan "Instagram & TikTok", "MEDIUM RISK (48/100)", dan tidak ada preview LinkedIn.

### T23 · P2 · Guard Approve Head dan perbaikan panel detail
**Langkah:**
1. `approveBlocked = status === 'Revision' || (posterTheme === 'hiring' && !typoFixed)`. Tombol Approve diberi `disabled={approveBlocked}`, disertai teks alasannya.
2. Kartu stat "5 waiting", "2 revisions", dan "3 low risk" dihitung dari `items`.
3. Ganti `DESIGNER_OPTIONS` dengan `useMemo` yang mengumpulkan nama desainer unik dari `items`.
4. Caption dirender dengan mengiterasi `selectedItem.platforms`, memakai fallback `'(no caption provided)'`.
5. Ganti `py-0.2` menjadi `py-0.5`.

**Kriteria terima:**
- SUB-1040 tidak bisa di-approve.
- Angka stat berubah setelah Request revision.

### T24 · P2 · `StatusChip` dengan `label`, chip kategori bersama
**Langkah:**
1. Tambahkan entri gaya `'Approved'` (hijau), `'AI check'` (biru), dan `'Admin'` (ungu `#4C3D7A` di atas `#EFEAFB`) ke map `styles`, serta prop opsional `label`.
2. Ekspor `ActivityCategoryChip`.
3. Pakai komponen ini di AdminActivityLog (hapus `mapCategoryToStatusChip`) dan di AdminDashboard. Di Dashboard, tampilkan juga `actionLabel`.

**Kriteria terima:**
- Chip Approved, AI check, dan Admin tampil dengan warna yang berbeda dan label yang benar di kedua layar.

---

## Gelombang 3: refactor P3 (setelah fitur stabil)

| ID | Judul | File | Setelah |
|---|---|---|---|
| T25 | Ekspor tipe `QueueStatus` dan `PosterTheme`, hapus union duplikat | types.ts, App.tsx, HeadReviewQueueScreen.tsx, SharedUI.tsx | Gelombang 2 |
| T26 | A11y LayoutShell: div klik menjadi `<button>`, `aria-expanded`, `aria-current`, hanya satu dropdown terbuka | LayoutShell.tsx | T20 |
| T27 | A11y queue: baris menjadi `<button aria-pressed>`, textarea berlabel, timer banner di `useRef` | HeadReviewQueueScreen.tsx | T23 |
| T28 | Ekstrak `WorkflowStepper` dan `readImageAsDataUrl` ke SharedUI; hapus prop GaskeunLogo yang tidak dipakai | SharedUI, StaffUpload, StaffPlatforms, LoginScreen, LayoutShell | T26 |
| T29 | Token warna Tailwind `@theme` di index.css (tanpa migrasi TSX) | index.css | T03 |
| T30 | Migrasi hex ke token, **satu layar per tugas** (boleh paralel antar-layar) | satu file layar | T29 |
| T31 | Pecah LayoutShell menjadi Sidebar dan Topbar (API publik tetap) | LayoutShell + `components/layout/*` | T26, T28 |
| T32 | Ekstrak handler App ke hooks `useStaffFlow` / `useReviewFlow` / `useAdminState` | App.tsx + `src/state/*` | Seluruh jalur App |
| T33 | Drawer sidebar untuk mobile | LayoutShell (atau Sidebar) | T31 |
| T34 | Hapus impor yang tidak dipakai (`tsc --noUnusedLocals` sebagai panduan, tsconfig tidak diubah) | banyak file | **Paling akhir** |

Detail langkah untuk Gelombang 3 bisa diambil dari bagian "Saran perbaikan" di [TEMUAN_LENGKAP.md](TEMUAN_LENGKAP.md). Untuk T30, ganti **hanya hex yang persis sama**, misalnya `text-[#0B1F4D]` menjadi `text-ink` dan `bg-[#F5F7FC]/60` menjadi `bg-canvas/60`. Warna brand klien (`#FFE14D`, `#1F1A2E`, `#F0307A`) dan nilai `style={{}}` yang berasal dari data dibiarkan.
