# Analisis Kekurangan Sistem GasKeun

> Disusun 18 Okt 2026. Basis analisis: kode di commit `4471cd2` (isi working tree identik, kecuali line ending), hasil `tsc`, `pnpm build`, dan smoke test di browser (Chromium headless pada build produksi, ke-13 layar, ditambah pemindaian aksesibilitas axe-core 4.10).
>
> Dokumen ini **melengkapi, bukan mengulang** tiga dokumen yang sudah ada: [ANALISIS_PROYEK.md](ANALISIS_PROYEK.md) (arsitektur dan jebakan), [TEMUAN_LENGKAP.md](TEMUAN_LENGKAP.md) (187 bug dengan `file:line`), dan [BACKLOG_HAIKU.md](BACKLOG_HAIKU.md) (34 tugas perbaikan). Pertanyaan yang dijawab di sini berbeda: **apa yang belum ada** agar GasKeun bisa dipakai tim sungguhan, dan dalam urutan apa sebaiknya dikerjakan.

---

## 1. Ringkasan

GasKeun saat ini adalah **prototipe klik yang meyakinkan**: 13 layar, tidak ada error JavaScript, dan build bersih. Namun hampir semua yang dijanjikan deskripsi produknya, *"auto-publishing … with AI-driven drafting, brand checks, review workflows, and multi-platform posting"* (`.figma/make/site.json`), masih berupa tampilan statis.

Lima kekurangan terbesar:

1. **Belum ada lapisan data.** Data lintas-layar hidup di 17 `useState` di `App.tsx` (di-seed dari `mockData.ts`), sisanya berupa state lokal layar atau literal di JSX. Reload mengembalikan semuanya ke kondisi awal. Belum ada API, database, maupun penyimpanan file.
2. **Belum ada identitas dan kontrol akses.** Login hanya memilih role, siapa pun bisa berpindah menjadi Admin dari sidebar, dan matriks izin di Users & roles hanya hiasan.
3. **Alur kerja belum tertutup, bahkan di level demo.** Hanya satu konten (poster hiring) yang bisa diedit. Jembatan Staff→Head hanya lewat id `SUB-1042`, keputusan Head tidak kembali ke Staff, dan status Approved, Rejected, maupun Scheduled tidak ada di antrean.
4. **Semua integrasi masih simulasi.** Ini mencakup Gemini, Brand Guardian, publikasi ke tiga platform, notifikasi Email/Telegram, dan metrik reach/engagement.
5. **Belum ada jaring pengaman engineering.** Tidak ada test, linter, CI, error boundary, maupun monitoring, dan type-check hanya dijalankan manual. README baru ditambahkan bersama dokumen ini.

### Kesiapan per area

| Area | Status | Catatan singkat |
|---|---|---|
| UI 13 layar dan desain visual | ✅ Ada | Konsisten dan build bersih |
| Alur demo end-to-end | 🟡 Sebagian | Submit→review berjalan; approve, save draft, dan propagasi status masih putus |
| Data dan persistensi | ❌ Belum ada | Hanya di memori; tidak ada model domain yang terpadu |
| Autentikasi dan otorisasi | ❌ Belum ada | Hanya role picker; tidak ada sesi maupun guard |
| AI drafting dan Brand Guardian | 🟡 Simulasi | Teks statis dan satu toggle boolean |
| Publikasi dan penjadwalan | 🟡 Simulasi | Tidak ada panggilan API maupun scheduler |
| Upload aset | ❌ Belum ada | "Replace" hanya memutar tiga nama file palsu |
| Notifikasi | 🟡 Simulasi | "Send test" hanya menampilkan toast |
| Navigasi dan URL | ❌ Belum ada | URL selalu `/`; tombol Back keluar dari aplikasi |
| Test, lint, CI | ❌ Belum ada | — |
| Aksesibilitas dan tampilan ponsel | 🟡 Sebagian | 8 jenis pelanggaran axe; sidebar dan topbar memenuhi layar pertama di ponsel |
| Observabilitas | ❌ Belum ada | — |
| Dokumentasi | 🟡 Sebagian | Dokumen untuk agen lengkap; README baru ada; LICENSE belum ada; sebagian isi sudah usang |

---

## 2. Kondisi terverifikasi (18 Okt 2026)

| Pemeriksaan | Hasil |
|---|---|
| `pnpm exec tsc --noEmit -p .` | ✅ 0 error |
| `tsc` dengan `--noUnusedLocals --noUnusedParameters` (sekadar informasi) | 10 impor tidak terpakai: `React` di 8 file, ditambah `Sparkles` dan `ShieldCheck` di StaffPlatforms (backlog T34) |
| `pnpm build` | ✅ Sukses. Satu chunk JS 390,9 kB (102,5 kB gzip) dan CSS 42,9 kB (8,1 kB gzip) |
| Smoke test ke-13 layar (build produksi) | ✅ 0 exception JavaScript. Satu-satunya request yang gagal adalah Google Fonts, karena jaringan sandbox |
| URL dan riwayat browser | URL tetap `/` di semua layar. `history.length` tidak bertambah setelah 12 kali navigasi. Tombol Back meninggalkan aplikasi, dan reload kembali ke login |
| Lebar ponsel 390×844 | Tidak ada scroll horizontal. Namun sidebar setinggi 712–760 px ditambah topbar sekitar 107 px mengisi layar pertama, sehingga konten baru mulai di sekitar piksel 843–891 |
| Aksesibilitas (axe-core) | 8 jenis pelanggaran (rincian di §4.9) |
| Bug terdokumentasi yang terkonfirmasi di browser | Save draft: tab Drafts tetap 3. Approve: antrean tetap 7 item dan Published tetap 9 baris. Submit tetap aktif walau typo belum diperbaiki. Banner sukses submit tampil putih, bukan biru (efek `.gaskeun-*` di luar `@layer`). Ekspor 25 baris log hanya menghasilkan 5 baris CSV (header, 3 baris utuh, dan 1 baris yang terpotong di `#FFE14D`) |
| Backlog | **0 dari 34** tugas sudah dikerjakan. Contohnya, judul tab masih "Figma Make App" (T09) dan approve masih dedupe berdasarkan judul (T02) |
| Git | Folder ini **sudah** repo git: 1 commit (`4471cd2`, 18 Okt 2026) dengan remote GitHub. Beberapa dokumen masih menyebutnya "bukan repo git" (lihat §4.12) |

---

## 3. Janji produk vs kenyataan

Teks di UI menjanjikan banyak hal. Tabel ini memetakan setiap janji ke kondisi kodenya.

| Janji di UI | Lokasi teks | Kondisi di kode | Yang dibutuhkan agar nyata |
|---|---|---|---|
| "Gemini drafts platform captions & hashtags" | Login, Staff Upload | Dua set draf statis (`INITIAL_AI_DRAFTS`, `ALTERNATE_AI_DRAFTS`). Regenerate hanya bergantian di antara keduanya setelah jeda 320 ms | Panggilan LLM lewat backend, prompt per platform dan tone, keluaran terstruktur, batas biaya, fallback saat AI gagal |
| "Gemini detected… OCR & layout analysis" | Staff Upload | Empat field yang di-hard-code di JSX | Model vision/OCR atas file yang benar-benar diunggah |
| "Brand Guardian pre-checks typos, logo, and colors" | Login, Staff Platforms | 1 FIX dan 3 PASS yang tetap. "Fix typo" hanya mengubah satu boolean | Mesin aturan yang membaca aturan dari Brand guidelines, ditambah pemeriksaan AI |
| Skor risiko dan "AI review summary" | Review queue | `riskScore`, `aiChecks`, `aiRecommendation` berupa literal di mock | Dihitung dari hasil pemeriksaan yang sebenarnya |
| "Auto-publish across channels" dan "Est. publish time: < 10 sec" | Login, Platforms, Review queue, Published | Approve hanya mengisi `latestApprovedItem`. Tidak ada panggilan API ke platform mana pun | Integrasi API per platform, antrean job publikasi, retry, dan status balik (lihat §4.5) |
| "Schedule with Gemini suggestion" | Platforms, Calendar | Tanggal jadwal tidak ikut terkirim saat submit. Saran jadwal berupa teks tetap | Scheduler dengan zona waktu dan kalender yang tersimpan |
| "OAuth 2.0 healthy · Expires in 54 days" | Connected accounts | Toggle boolean | Alur OAuth sungguhan, penyimpanan token terenkripsi, pemantauan masa berlaku |
| Notifikasi Email dan Telegram | Connected accounts | Switch disimpan di state lokal, dan "Send test" hanya menampilkan toast | Penyedia email, Telegram Bot API, preferensi per user, dan deep link (butuh router) |
| "Complete audit trail" dan ekspor CSV | Activity log | Hanya submit Staff yang menulis log. Ekspor CSV terpotong | Log append-only di server; setiap aksi dicatat beserta pelakunya dari sesi |
| Reach, likes, "+28% reach", "64% to 82%" | Published, Platforms, Team, Dashboard | Semuanya string literal | Penarikan metrik dari API insight tiap platform |
| "SSO enabled" dan "Continue with Google" | Login | "SSO enabled" tidak punya handler; tombol Google melewati form | Penyedia identitas sungguhan (mis. Google Workspace) dan manajemen sesi |
| "Send a workspace invite link" | Users & roles | Hanya menambah baris di tabel; tidak ada yang terkirim | Token undangan dan email |

---

## 4. Kekurangan per area

Setiap bagian memuat kondisi sekarang, dampaknya, dan apa yang perlu ditambahkan. Rujukan ke ID temuan (TEMUAN_LENGKAP, serta ID X1–X17 dari ANALISIS_PROYEK §5) dan tugas (BACKLOG) dicantumkan supaya tidak ada pekerjaan ganda.

### 4.1 Lapisan data dan model domain

**Sekarang**

- Data lintas-layar berupa seed di `mockData.ts` yang disalin ke `useState` di `App.tsx`. Sebagian lain (aturan Brand Guardian, kata terlarang, switch notifikasi, KPI Dashboard) hanya state lokal layar atau literal. Tidak ada `fetch`, `localStorage`, maupun lapisan service.
- Satu konten yang sama muncul sebagai empat record terpisah yang tidak saling terhubung: `SUB-1042` (antrean), `MY-201` (My submissions), `CAL-06` (kalender), dan `PUB-901` (Published). Penghubungnya hanya kecocokan string judul.
- Waktu disimpan sebagai teks ("Just now", "14 Oct 2026, 14:22"), dan "hari ini" di-hard-code sebagai Rabu 14 Okt 2026.

**Dampak.** Setiap fitur baru harus menyinkronkan empat dataset secara manual, dan inilah akar sebagian besar bug P1/P2 (X1, X2, X10). Per hari ini (18 Okt 2026), penanda "Today" di kalender (Rabu 14 Okt), saran jadwal di Platforms & check (Kamis 15 Okt 19:00 WIB), dan saran di kalender (Selasa 13 Okt) semuanya sudah lewat, sehingga demo akan terlihat makin basi.

**Yang perlu ditambahkan**

1. **Satu model domain.** Antrean, My submissions, kalender, Published, statistik Team, dan KPI Dashboard semuanya menjadi *view turunan* dari entitas yang sama:

   ```text
   Workspace 1─* User                (role: Staff | Head | Admin, status)
   Workspace 1─* PlatformConnection  (platform, token terenkripsi, expiresAt)
   Workspace 1─1 BrandRuleSet        (aturan, palet, kata terlarang, tone per platform)
   Submission                        (id, ownerId, status, currentVersionId)
     1─* SubmissionVersion           (aset, judul, caption & hashtag per platform, hasil cek)
     1─* Review                      (reviewerId, keputusan, catatan, waktu)
     1─* PublishJob                  (platform, scheduledAt, status, externalPostId, permalink, error)
   ActivityEvent                     (actorId, aksi, targetId, detail, waktu) — append-only
   ```

2. **Lapisan repository/service** dulu, meskipun isinya masih mock (mis. `submissions.list()`, `submissions.submit()`). Layar tidak lagi tahu dari mana datanya berasal, sehingga mengganti mock dengan API nanti tidak perlu menyentuh layar. Langkah ini tidak butuh dependency baru.
3. **Waktu sungguhan.** Simpan dalam format ISO 8601, tampilkan dengan `Intl.DateTimeFormat` di zona `Asia/Jakarta`, dan hitung waktu relatif saat render.
4. **Backend**: database, object storage untuk aset, dan API. Lihat keputusan di §6.

**Rujukan:** ANALISIS_PROYEK §4, X1, X2, X10; T07, T12, T32.

### 4.2 Identitas, autentikasi, dan otorisasi

**Sekarang**

- Login mengabaikan email dan password. "Continue with Google" langsung masuk, dan "SSO enabled" hanya teks.
- Switcher role di sidebar, jumper "All 13 screens", dan pill topbar bisa mengubah siapa pun menjadi Admin. `App.tsx` merender layar apa pun tanpa memeriksa role.
- Matriks izin di Users & roles tidak ditegakkan. Contohnya, matriks menyatakan hanya Admin yang boleh mengubah aturan Brand Guardian, padahal Staff bisa membuka Brand guidelines dan mengubah toggle-nya. Matriks juga menyatakan Admin boleh approve, padahal menu Admin tidak punya antrean.
- Undangan tidak mengirim apa pun. Tidak ada aksi nonaktifkan, aktifkan ulang, hapus, atau kirim ulang undangan. Sign out tidak me-reset state.

**Dampak.** Hak akses tidak bisa dipercaya, dan audit log tidak bisa menyebut pelaku yang sebenarnya.

**Yang perlu ditambahkan**

- Penyedia identitas. Google Workspace OIDC cocok dengan janji "SSO" dan domain `@lumbung.studio`. Dibutuhkan juga sesi, logout yang membersihkan state, dan timeout.
- RBAC yang **ditegakkan di server**, ditambah guard per layar di klien (mis. peta `ScreenId → Role[]`).
- Siklus hidup user: undangan bertoken, nonaktifkan/aktifkan ulang, dan guard "admin terakhir".
- Switcher role dan jumper dipindah ke balik flag "mode demo" agar tidak ikut ke versi produksi.

**Rujukan:** staff-login-fake-auth, admin-data-no-access-control, shell-no-role-screen-guard, admin-data-users-no-delete-deactivate, admin-data-invite-no-validation, admin-data-no-last-admin-guard, shell-logout-no-reset; T17, T18, T20.

### 4.3 Alur kerja persetujuan

**Sekarang**

- Hanya ada satu konten yang bisa diedit (poster hiring). "New submission" dan tombol "Open" di baris mana pun selalu membuka editor yang sama, dan tidak ada cara membuat pengajuan baru.
- `QueueItem.status` hanya mengenal `Submitted`, `In review`, dan `Revision`. Reject berperilaku sama dengan revisi, dan item yang sudah di-approve tetap tinggal di antrean.
- Catatan revisi dari Head tidak sampai ke Staff. Belum ada siklus kirim ulang, riwayat versi, utas komentar, maupun dukungan lebih dari satu reviewer.
- Tanggal jadwal hilang saat submit, dan submit maupun approve tidak dijaga oleh hasil pemeriksaan.

**Yang perlu ditambahkan: state machine yang eksplisit**

```text
Draft → Submitted → In review → Approved → (Scheduled) → Publishing → Published
                       │  │                                    │
                       │  └→ Rejected (diarsipkan)             └→ Failed → coba lagi → Publishing
                       └→ Revision → Staff kirim ulang (versi baru) → Submitted
```

- Setiap transisi punya guard, misalnya "semua cek Brand Guardian lolos" dan "minimal satu platform terpilih sudah terhubung". Setiap transisi juga memicu notifikasi dan tercatat di log.
- Riwayat versi dan diff antar-revisi, serta utas komentar per pengajuan.
- Keputusan produk yang masih terbuka: apa arti Reject (ANALISIS_PROYEK §8.1).

**Rujukan:** X1, X2, X5, X6, shell-reject-equals-revision, staff-schedule-date-dropped, staff-open-row-wrong-target; T02, T05, T11–T16, T23.

### 4.4 AI: drafting dan Brand Guardian

**Sekarang.** Semua perilaku AI deterministik dan di-hard-code. Aturan di Brand guidelines adalah state lokal yang kembali ke default setiap kali pindah layar, dan aturan itu tidak memengaruhi apa pun. Placeholder `[CITY]` dan `[DEADLINE]` tetap mendapat PASS dari checklist, padahal item lain di antrean (SUB-1036) menganggap placeholder sebagai masalah.

**Yang perlu ditambahkan**

- **Proxy di backend.** Kunci API tidak boleh ada di front-end, karena setiap variabel `VITE_*` yang dipakai di kode ikut tertanam di bundle yang bisa dibaca siapa pun.
- **Brand Guardian bertahap.** Mulai dari pemeriksaan deterministik yang murah dan dapat diuji: panjang caption, jumlah hashtag, kata terlarang, regex placeholder `\[[A-Z]+\]`, dan hashtag wajib `#LumbungStudio`. Setelah itu baru pemeriksaan AI: OCR typo pada artwork, dominasi palet, dan safe zone logo.
- Aturan Brand Guardian disimpan terpusat per workspace dan dipakai oleh Staff Platforms serta Review queue.
- Label "AI-generated", tetap ada manusia yang memutuskan, log prompt dan respons untuk audit, serta set evaluasi kecil untuk mengukur kualitas draf.
- Kebijakan data: aset klien yang dikirim ke penyedia AI harus punya dasar persetujuan (lihat §4.10).

**Rujukan:** staff-brand-rules-not-wired, staff-placeholders-submitted-unresolved, head-ai-check-contradicts-typo, staff-regenerate-destroys-edits.

### 4.5 Publikasi, penjadwalan, dan integrasi platform

**Sekarang.** Tidak ada satu pun panggilan ke API platform. `connectedPlatforms` hanya dibaca di layar Admin, pill "Instagram & LinkedIn connected" di topbar berupa teks tetap, dan "View live post" tidak bisa diklik.

**Persyaratan platform** (menurut dokumentasi resmi, dicek 18 Okt 2026):

| Platform | Syarat utama | Implikasi untuk GasKeun |
|---|---|---|
| Instagram | Akun profesional. Izin `instagram_business_basic` dan `instagram_business_content_publish` (Instagram Login), atau `instagram_basic`, `instagram_content_publish`, dan `pages_read_engagement` (Facebook Login). Media berbasis URL harus di-host di server yang bisa diakses publik. Kuota 100 post per 24 jam lewat API, walau bagian carousel di halaman yang sama menyebut 50 | Butuh object storage dengan URL publik atau signed, token per akun, dan penghitung kuota |
| LinkedIn | Scope `w_organization_social`. Member yang memberi izin harus berperan ADMINISTRATOR, CONTENT_ADMIN, atau DIRECT_SPONSORED_CONTENT_POSTER di Company Page | Admin klien perlu melakukan OAuth sendiri, dan URN organisasi perlu disimpan. Cek juga persyaratan akses produk API di LinkedIn Developer Portal |
| TikTok | Content Posting API. "All content posted by unaudited clients will be restricted to private viewing mode", jadi aplikasi harus lolos audit dulu | Sediakan waktu untuk audit. API juga punya endpoint photo post, sehingga label "Needs video" di UI perlu diselaraskan |

**Yang perlu ditambahkan**

- Alur OAuth per platform, penyimpanan token terenkripsi, refresh otomatis, dan peringatan sebelum token kedaluwarsa.
- Worker publikasi berbasis antrean job, dengan retry, idempotensi (agar tidak double-post), dan status per platform.
- Validasi media per platform sebelum submit: rasio, ukuran, serta jenis gambar atau video.
- Scheduler yang menghormati zona waktu, ditambah status balik (`externalPostId`, permalink) untuk tombol "View live post".
- Penarikan metrik (reach, engagement) dari API insight tiap platform untuk menggantikan angka statis.

**Rujukan:** X4, staff-tiktok-not-connected, admin-data-tiktok-connected-shows-not-connected, head-published-view-live-stub; T04, T19, T21, T22.

### 4.6 Upload dan aset media

**Sekarang.** Poster adalah komponen React (`PosterGraphic`), bukan gambar. Tombol "Replace" hanya memutar tiga nama file palsu, dan tidak ada input file untuk karya desain. Satu-satunya upload sungguhan adalah logo, yang dibaca sebagai data URL tanpa batas ukuran dan hilang saat reload.

**Yang perlu ditambahkan.** Upload sungguhan (drag-and-drop, validasi tipe dan ukuran, pratinjau), penyimpanan di object storage, pembuatan turunan per platform (resize, thumbnail), dukungan video untuk TikTok, serta riwayat aset per versi pengajuan.

**Rujukan:** staff-replace-file-fake, shell-logo-upload-duplicated.

### 4.7 Navigasi dan URL

**Sekarang** (terverifikasi di browser):

- URL selalu `/`, tombol Back langsung keluar dari aplikasi, dan reload selalu kembali ke login.
- Tidak ada tautan langsung ke pengajuan tertentu. Akibatnya janji notifikasi Telegram, "Real-time group ping with direct Review Queue deep link", tidak mungkin dipenuhi.
- Filter dan halaman tabel hilang setiap kali berpindah layar.

**Yang perlu ditambahkan.** Router dengan URL per layar dan per item (mis. `/review/SUB-1042`), filter di query string, halaman 404, dan guard role per rute. Router umumnya berarti dependency baru, yang saat ini dilarang aturan proyek. Alternatif tanpa dependency adalah routing berbasis hash yang sederhana. Keduanya butuh keputusan pemilik (§6).

**Rujukan:** ANALISIS_PROYEK §3 (Navigasi), X8, shell-notifications-static.

### 4.8 Kualitas engineering dan tooling

| Kekurangan | Kondisi sekarang | Rekomendasi |
|---|---|---|
| Test otomatis | Tidak ada | Vitest untuk logika (handler, turunan data), Testing Library untuk komponen, dan Playwright untuk alur utama. Skrip smoke test yang dipakai untuk analisis ini bisa menjadi benih test e2e |
| Linter | Tidak ada | ESLint dengan aturan `react-hooks`, atau oxlint (satu keluarga dengan oxfmt) |
| CI | Tidak ada, padahal repo sudah di GitHub | GitHub Actions: `pnpm install --frozen-lockfile`, type-check, lalu build di setiap PR |
| Type-check | Manual, dan `vite build` tidak melakukannya | Skrip `"typecheck": "tsc --noEmit -p ."` yang dijalankan juga di CI |
| Error boundary | Tidak ada. Satu error render membuat seluruh aplikasi menjadi halaman putih | `ErrorBoundary` di akar aplikasi dengan tampilan fallback |
| Code splitting | Ke-13 layar ada di satu chunk 391 kB | `React.lazy` per layar, sehingga halaman login tidak ikut memuat layar Admin |
| Struktur state | `App.tsx` memegang 17 `useState`, semua handler, dan prop drilling | `useReducer` atau context per domain, atau hooks seperti di T32 |
| Konfigurasi lingkungan | Tidak ada contoh konfigurasi env | Tambahkan saat backend ada (mis. `VITE_API_URL`), tanpa secret. Karena `.gitignore` (dikelola platform) mengabaikan pola `.env*`, file contoh perlu `git add -f` atau nama lain seperti `env.example` |
| Metadata paket | Nama paket masih `figma-make-app`. Tidak ada `engines` maupun `packageManager`, sehingga tidak ada peringatan saat versi lokal (Node 25.9, pnpm 11.25) berbeda dari platform (Node 22, pnpm 10.34.3) | Lengkapi field tersebut, dengan persetujuan karena mengubah `package.json` memicu reinstall |

Test runner, linter, skrip `typecheck`, dan metadata paket butuh dependency baru atau perubahan `package.json`. `CLAUDE.md` melarang dependency baru, dan `AGENTS.md` meminta `package.json` tidak diubah kecuali diminta, jadi keempatnya butuh persetujuan pemilik (§6). ErrorBoundary, `React.lazy`, dan restrukturisasi state bisa dikerjakan tanpa dependency baru.

**Rujukan:** tooling-build-no-typecheck, shell-no-typecheck-script, tooling-unused-imports, tooling-toolchain-drift, tooling-install-unfrozen-lockfile; T32, T34.

### 4.9 UX, aksesibilitas, tampilan ponsel, dan bahasa

**Hasil axe-core** (WCAG; seluruh 13 layar):

| Aturan | Dampak | Elemen | Lokasi dan penyebab |
|---|---|---|---|
| `button-name` | kritis | 7 | Switch aturan di Brand guidelines (5) dan switch notifikasi di Connected accounts (2) tidak punya nama aksesibel |
| `label` | kritis | 4 | Email dan password di Login, judul dan caption di Staff Upload. `<label>` tidak terhubung ke field-nya |
| `color-contrast` | serius | 16 (6 layar) | Teks Berry di atas Sun pada poster (2,98:1), teks putih di atas Berry (3,88:1), teks `#52607E/80` berukuran 11 px (3,8–4,0:1), teks "No posts" di kalender (`#52607E/60`, 2,6:1), dan label hex Berry di Brand guidelines (3,4:1) |
| `aria-prohibited-attr` | serius | 1 per layar | `div` logo memakai `aria-label` tanpa `role` |
| `scrollable-region-focusable` | serius | 1 | Area grid kalender yang bisa di-scroll tidak bisa dijangkau keyboard |
| `heading-order` | sedang | 6 layar | Level heading melompat: h2→h4 di Upload, Platforms, Review queue, dan Published (judul poster memakai `<h4>`), serta h1→h3 di Login dan Team |
| `landmark-one-main`, `region` | sedang | Login | Halaman login tidak punya landmark `<main>` |

**Kekurangan UX lain**

- **Ponsel.** Sidebar (712–760 px) dan topbar memenuhi layar pertama, sehingga konten tidak terlihat tanpa scroll (T33).
- **Tanpa konfirmasi untuk aksi yang berdampak.** Reject, Disconnect platform, dan ubah role langsung berlaku tanpa dialog konfirmasi maupun undo.
- **Belum ada status loading dan error.** Saat ini belum dibutuhkan karena belum ada jaringan, tetapi wajib ada begitu backend tersambung. `EmptyFilterState` juga selalu menulis "Nothing matches these filters", termasuk untuk data yang memang kosong.
- **Bahasa dan waktu.** Copy UI berbahasa Inggris, sementara persona dan klien berasal dari Indonesia. `<html lang>` bernilai `en`, belum ada struktur i18n, dan tanggal ditulis sebagai string bahasa Inggris (ANALISIS_PROYEK §8.2).
- `prefers-reduced-motion` diabaikan, dan notifikasi "3 unread" berupa angka tetap.

**Rujukan:** shell-a11y-clickable-divs, shell-a11y-dropdowns, staff-a11y-labels, staff-a11y-toggle-state, shared-ui-poster-low-contrast-text, shell-mobile-sidebar, shared-ui-emptystate-copy-fixed, tooling-reduced-motion-ignored, head-calendar-hardcoded-dates; T03, T08, T26, T27, T33.

### 4.10 Keamanan dan privasi

Saat ini permukaan serangannya kecil karena belum ada backend. Namun ada beberapa pola yang akan berisiko begitu data sungguhan masuk:

- **Keputusan akses di klien.** Role ditentukan di browser. Begitu ada API, setiap izin wajib dicek di server.
- **Secret.** Kunci Gemini dan token media sosial tidak boleh berada di bundle front-end (lihat §4.4).
- **CSV injection.** Ekspor CSV belum menetralkan sel yang diawali `=`, `+`, `-`, atau `@`. Begitu judul dan caption berasal dari input user, file yang dibuka di Excel bisa menjalankan formula. Perbaikan T01 di backlog (Blob, quoting, dan BOM) mengatasi pemotongan di `#`, tetapi belum menetralkan formula.
- **Upload.** Logo dibaca sebagai data URL tanpa batas ukuran, dan `accept="image/*"` ikut menerima SVG. Saat logo disimpan di server nanti, validasi tipe dan ukuran, encode ulang gambarnya, dan jangan pernah menyisipkan SVG secara inline.
- **Audit log.** Log harus append-only di server. Saat ini log hanyalah array yang bisa diubah dari klien.
- **Data pribadi.** Nama dan email anggota, serta aset klien yang mungkin dikirim ke penyedia AI, termasuk dalam lingkup UU No. 27/2022 tentang Pelindungan Data Pribadi. Yang perlu disiapkan: dasar pemrosesan, masa retensi, kontrol akses, prosedur insiden, dan perjanjian pemrosesan data dengan vendor.
- **Pihak ketiga.** Google Fonts dimuat dari server Google. Self-hosting font menghilangkan kebocoran IP pengunjung sekaligus mempercepat render pertama. Header keamanan seperti CSP juga perlu diatur di hosting.

**Rujukan:** admin-data-csv-unescaped-fields, admin-data-csv-hash-truncation, shared-ui-google-fonts-css-import; T01.

### 4.11 Observabilitas dan analitik

**Sekarang.** Belum ada pelacakan error, log, maupun analitik produk. `site.json` sebenarnya mendukung `analytics.googleAnalyticsId`, tetapi belum diisi. Semua angka KPI dan metrik di UI berupa literal (X7).

**Yang perlu ditambahkan.** Pelacakan error di front-end (mis. Sentry), log terstruktur dan health check untuk job publikasi di backend, alert saat publikasi gagal atau token hampir kedaluwarsa, serta analitik produk yang menghormati persetujuan pengguna.

### 4.12 Dokumentasi dan proses

| Kekurangan | Detail |
|---|---|
| README | Belum ada sebelumnya. Sudah ditambahkan bersama dokumen ini |
| LICENSE | Belum ada. Status kepemilikan kode belum tertulis |
| CONTRIBUTING, CHANGELOG, template PR dan issue | Belum ada. Bagian Kontribusi di README dan `AGENTS.md` bisa menjadi titik awal |
| Dokumen yang sudah usang | `CLAUDE.md` ("folder ini belum repo git"), ANALISIS_PROYEK §1 dan §2, serta BACKLOG §0 dan §2 masih menyebut folder ini bukan repo git. Kenyataannya sudah ada commit dan remote GitHub, jadi aturan agen paralel kini bisa memakai branch atau worktree |
| Line ending | Semua file di working tree memakai CRLF, sementara index git memakai LF. Skrip bash di `.figma/make/` akan gagal (`bash\r`) kalau folder ini disalin apa adanya ke Linux tanpa lewat git. `.gitattributes` (dikelola platform) hanya berisi aturan LFS, tanpa aturan `eol` |
| Pelacakan pekerjaan | Backlog hanya ada di markdown. GitHub Issues atau Projects akan memudahkan pelacakan status dan pembagian tugas |
| Keputusan produk | Keempat pertanyaan di ANALISIS_PROYEK §8 belum dijawab |

**Rujukan:** tooling-agents-md-drift, tooling-bash-scripts-windows, tooling-format-scope.

---

## 5. Roadmap yang disarankan

Ukuran: **S** = hitungan hari, **M** = sekitar 1–2 minggu, **L** = beberapa minggu, **XL** = lebih dari sebulan.

| Fase | Ukuran | Isi utama | Selesai bila | Butuh keputusan |
|---|---|---|---|---|
| **0. Rapikan fondasi** | S | README (✅ selesai); perbarui dokumen yang usang; skrip `typecheck`; CI GitHub Actions (type-check dan build); LICENSE | Setiap PR otomatis dicek type-check dan build | Izin mengubah `package.json` |
| **1. Demo yang utuh** | M | Backlog gelombang 1–2 (T01–T24); perbaiki pelanggaran axe kritis | Skenario demo berjalan tanpa jalan buntu; 0 pelanggaran axe kritis | Semantik Reject |
| **2. Siap disambung ke backend** | L | Backlog gelombang 3 (T25–T34, termasuk drawer ponsel T33); model domain tunggal dan lapisan repository; router dan URL; waktu sungguhan; ErrorBoundary; lazy-load per layar; Vitest, Playwright, dan linter | Sumber data bisa diganti tanpa menyentuh layar; deep link berfungsi | Izin dependency; arah produk |
| **3. Backend MVP** | XL | SSO Google Workspace; database dan storage; API pengajuan, review, user, dan audit; RBAC di server; notifikasi email | Dua orang di perangkat berbeda melihat data yang sama | Pilihan backend dan hosting |
| **4. Integrasi inti** | XL | Drafting AI lewat backend; Brand Guardian (cek deterministik dulu, lalu AI); publikasi Instagram dan LinkedIn beserta scheduler; TikTok setelah lolos audit; penarikan metrik | Post benar-benar terbit dan tercatat dengan permalink | Urutan platform dan vendor AI |
| **5. Pengerasan** | L | Monitoring dan alert; review keamanan; kepatuhan UU PDP; backup; performa | Siap dipakai klien | — |

Fase 0 dan 1 tidak memerlukan backend. Kalau tujuan proyek tetap demo atau pitch, berhenti di Fase 1 sudah memadai. Kalau demo juga harus tampil baik di ponsel, tarik T33 beserta prasyaratnya (T26, T28, T31) ke Fase 1.

---

## 6. Keputusan yang perlu diambil pemilik proyek

1. **Arah proyek.** Apakah GasKeun tetap demo/pitch, atau akan dikembangkan menjadi produk? Jawaban ini menentukan apakah Fase 2–5 relevan (ANALISIS_PROYEK §8.3).
2. **Aturan dependency.** Apakah larangan "jangan tambah dependency / jangan ubah `package.json`" boleh dilonggarkan untuk router, test runner, linter, dan skrip `typecheck`?
3. **Backend dan hosting.** Layanan backend terkelola (BaaS) atau API sendiri? Tetap di Figma Make, atau pindah ke hosting statis dengan backend terpisah?
4. **Satu tim atau banyak klien.** Teks "Customer workspace: Lumbung Studio" mengisyaratkan multi-tenant, sementara deskripsi produk menyebut tim in-house. Jawabannya menentukan apakah setiap tabel butuh `workspaceId` sejak awal.
5. **Pertanyaan yang sudah tercatat:** semantik Reject, bahasa UI, dan apakah Figma Make menimpa file saat sinkronisasi (ANALISIS_PROYEK §8.1, §8.2, §8.4).
6. **Vendor AI dan kebijakan data.** Gemini disebut di UI. Apakah aset dan teks klien boleh dikirim ke penyedia AI, dan dengan perjanjian apa?

---

## 7. Cara memeriksa ulang

```bash
pnpm install
pnpm exec tsc --noEmit -p .
pnpm exec tsc --noEmit -p . --noUnusedLocals --noUnusedParameters   # informasi saja; tsconfig tidak diubah
pnpm build
```

Smoke test browser dijalankan pada salinan sementara di luar folder proyek, memakai Playwright dan axe-core, sehingga tidak ada dependency yang ditambahkan ke proyek. Langkahnya: `pnpm preview`, buka ke-13 layar lewat jumper "All 13 screens", catat error konsol, ukur tata letak di 390×844, jalankan axe di setiap layar, lalu uji alur Save draft, Submit, Approve, ekspor CSV, reload, dan tombol Back.

## Sumber eksternal

- [TikTok for Developers: Content Posting API, Get Started](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [Meta for Developers: Instagram Platform, Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing)
- [Microsoft Learn: LinkedIn Posts API](https://learn.microsoft.com/linkedin/marketing/community-management/shares/posts-api)
