# Status dan Rencana GasKeun

Dokumen ini merangkum kondisi GasKeun pada 18 Oktober 2026: apa yang benar-benar berjalan, apa yang hanya simulasi, temuan yang paling berdampak, dan urutan perbaikan yang disarankan. Isinya mengacu pada kode di `src/` dan pada hasil verifikasi yang dijalankan ulang, bukan pada rencana atau asumsi.

GasKeun adalah prototipe front-end untuk alur persetujuan konten media sosial. Tidak ada backend, autentikasi sungguhan, router, test runner, maupun panggilan AI. Seluruh data berasal dari `src/data/mockData.ts` dan kembali ke kondisi awal setiap reload.

## 1. Ringkasan status

Tabel berikut membedakan tiga kondisi: **berfungsi** (perilaku nyata di dalam sesi), **simulasi** (tampilan atau data statis yang tidak mengubah state), dan **belum tersambung** (aksi pengguna tidak mencapai data yang seharusnya).

| Area | Status | Keterangan |
|---|---|---|
| Login dan pemilihan role | Berfungsi (demo) | Tiga role dapat dipilih. Email dan password diabaikan; `handleSignIn` hanya menyimpan role dan membuka home screen role tersebut. |
| Staff Upload | Berfungsi sebagian | Judul, caption, dan hashtag dapat diedit. Regenerate hanya bergantian antara dua set draf. Save draft tidak menyimpan apa pun. |
| Staff Platforms | Berfungsi (demo) | Pemilihan platform, checklist Brand Guardian, perbaikan typo, dan submit berjalan di memori. Submit hanya menimpa `SUB-1042`. |
| Head Review Queue | Berfungsi (demo) | Filter, pencarian, panel detail, approve, request revision, dan reject berjalan. Approve tidak mengeluarkan item dari antrean; reject berperilaku sama dengan revisi. |
| Published | Simulasi (belum tersambung) | Hero memakai `latestApprovedItem`, yang sudah terisi item seed sebelum ada approve. Approve tidak menambah baris karena dedupe memakai judul. |
| Staff My submissions dan Drafts | Belum tersambung | Data seed dapat difilter dan dicari, tetapi tidak menerima submit baru maupun keputusan Head. Save draft tidak menambah baris. |
| Head Content calendar | Sebagian (belum tersambung) | Jadwal seed tampil dan saran `CAL-09` dapat diterapkan. Approve dan revisi tidak memperbarui status kalender. |
| Head Team | Baca saja (simulasi) | `teamDesigners` tidak memiliki setter; layar hanya menampilkan data seed. |
| Brand guidelines | Statis (simulasi) | Konten panduan dan palet klien ditampilkan tanpa interaksi data. |
| Admin Dashboard | Sebagian (belum tersambung) | Sebagian KPI dan badge adalah literal; recent activity membaca `activityLogs`. |
| Admin Users | Berfungsi lokal | Ubah role dan undang user mengubah state di memori. Tidak ada validasi email ganda atau guard admin terakhir. |
| Admin Connected accounts | Berfungsi lokal (belum tersambung ke topbar) | Status koneksi dan switch notifikasi mengubah state Admin. Topbar tidak membaca state tersebut. |
| Admin Activity log | Sebagian (belum tersambung) | 24 entri seed ditambah entri submit. Aksi Head dan Admin tidak tercatat. Ekspor CSV terpotong di karakter `#`. |
| Navigasi dan shell | Berfungsi | 13 layar dapat dibuka lewat sidebar, jumper, dan notifikasi. Tidak ada URL, history, deep link, atau guard role. |
| Data dan persistensi | Simulasi | Tidak ada fetch atau penyimpanan. Reload mengembalikan seluruh data ke seed; logo kustom juga hilang. |
| AI dan Brand Guardian | Simulasi | Label "Gemini" dan "Brand Guardian" hard-coded. Tidak ada panggilan API, antrean, atau model. |

Kesimpulan singkat: alur yang terlihat di layar berjalan, tetapi integrasi antar-layar belum. Staff, Head, dan Admin masing-masing mengubah potongan state sendiri, dan hanya sebagian perubahan itu terlihat oleh layar lain.

## 2. Verifikasi

Verifikasi dijalankan pada 18 Oktober 2026 dari root repo, dengan Node v24.19.0 dan pnpm 10.33.2. Hasil di bawah adalah keluaran sebenarnya, bukan perkiraan.

| Perintah | Hasil | Tanggal |
|---|---|---|
| `pnpm exec tsc --noEmit -p .` | Exit 0, 0 error. Tidak ada keluaran diagnostik. | 2026-10-18 |
| `pnpm build` | Exit 0. Vite 8.0.5, 1925 modul ditransformasi, selesai dalam 535 ms. | 2026-10-18 |

Artefak build:

| Berkas | Ukuran | Gzip |
|---|---|---|
| `dist/index.html` | 0.99 kB | 0.45 kB |
| `dist/assets/index-BntEqetL.css` | 42.92 kB | 8.13 kB |
| `dist/assets/index-C3Z6ePcV.js` | 390.93 kB | 102.54 kB |
| `dist/robots.txt` | 0.02 kB | 0.04 kB |

Catatan penting: `pnpm build` menjalankan Vite tanpa type-check. Karena itu `tsc --noEmit` tetap wajib dijalankan terpisah setiap kali ada perubahan TypeScript. Tidak ada test otomatis, linter, atau CI di repo ini; verifikasi perilaku dilakukan manual di browser.

## 3. Known issues terprioritas

Daftar lengkap berisi 187 temuan di [`TEMUAN_LENGKAP.md`](./TEMUAN_LENGKAP.md). Lima belas temuan berikut dipilih karena berdampak langsung pada alur demo atau pada kepercayaan terhadap data yang ditampilkan. Nomor baris dapat bergeser setelah edit; cari ulang dengan nama fungsi atau teks unik.

| id | Tingkat | Ringkasan | file:line | Dampak demo |
|---|---|---|---|---|
| `shell-save-draft-noop` | P1 | Save draft hanya menyalin array dan menampilkan toast sukses; tidak ada baris Draft baru. | `src/App.tsx:294-296` | Staff melihat konfirmasi palsu; tab Drafts tetap 3 baris. |
| `shell-approve-leaves-item-in-queue` | P1 | Approve tidak menghapus item dari `queueItems` dan tidak mengubah statusnya. | `src/App.tsx:188-207` | Item yang sudah disetujui tetap tampil dan dapat di-approve berulang. |
| `shell-approve-dedupe-by-title` | P1 | Dedupe Published memakai judul, sedangkan seed memakai judul yang sama. | `src/App.tsx:191-192` | Banner sukses muncul untuk post yang tidak ada di tabel. |
| `head-no-staff-propagation` | P1 | Keputusan Head tidak memperbarui `staffSubmissions`. | `src/App.tsx:69-71,294-296` | `MY-201` tetap "In review" setelah approve atau revisi. |
| `head-no-calendar-propagation` | P1 | Approve, revisi, dan reject tidak memperbarui `calendarPosts`. | `src/App.tsx:188-214` | `CAL-06` tetap "In review" meski post sudah disetujui. |
| `head-no-activity-log` | P1 | Hanya submit yang menulis ke `activityLogs`. | `src/App.tsx:173,176-214` | Activity log dan Dashboard tidak menampilkan aksi Head. |
| `admin-data-csv-hash-truncation` | P1 | Ekspor CSV memakai `data:` URI dan `encodeURI`, sehingga `#` memotong file. | `src/screens/AdminActivityLogScreen.tsx:63-79` | CSV berhenti di `#FFE14D` pada ACT-03; data setelahnya hilang. |
| `shell-reject-equals-revision` | P2 | Reject memberi status `Revision`, sama seperti request revision. | `src/App.tsx:210-214` | Tidak ada beda hasil antara menolak dan meminta revisi. |
| `shell-submit-not-in-staff-submissions` | P2 | Submit tidak memperbarui baris Staff; `MY-201` tetap memakai data seed. | `src/App.tsx:140-174` | Judul, platform, dan waktu di My submissions tidak sinkron dengan antrean. |
| `staff-submit-ignores-typo` | P2 | Submit hanya dicek terhadap jumlah platform, bukan status typo. | `src/screens/StaffPlatformsScreen.tsx:487-491` | Post dengan "Aplly" tetap dapat dikirim; badge "Ready" tidak jujur. |
| `staff-placeholders-submitted-unresolved` | P2 | `[CITY]` dan `[DEADLINE]` tidak pernah ditandai atau diisi. | `src/data/mockData.ts:56` | Post dengan placeholder dapat lolos checklist dan dikirim. |
| `head-approve-no-guards` | P2 | Tombol Approve selalu aktif, termasuk untuk item Revision dan poster hiring bertypo. | `src/screens/HeadReviewQueueScreen.tsx:531-536` | Poster "Aplly now" dapat tampil di preview Published. |
| `shared-ui-unlayered-css-overrides-utilities` | P2 | Kelas `.gaskeun-*` tidak berada di `@layer`, sehingga mengalahkan utility Tailwind. | `src/screens/StaffPlatformsScreen.tsx:132` | Banner sukses tampil putih, bukan biru muda dengan border biru. |
| `shared-ui-activitylog-chip-mislabel` | P2 | `StatusChip` menampilkan teks status pengganti, bukan kategori asli. | `src/screens/AdminActivityLogScreen.tsx:91-96` | "Approved" tampil sebagai "Published", "Admin" sebagai "Draft". |
| `shell-connected-pill-static` | P2 | Pill topbar selalu "Instagram & LinkedIn connected". | `src/components/LayoutShell.tsx:455-465` | Memutus Instagram di Admin tidak mengubah pill. |

## 4. Peta jalan bertahap

Urutan fase mengikuti ketergantungan, bukan tingkat kepentingan semata. Fase 1 harus selesai lebih dulu karena memperbaiki kebenaran data yang menjadi dasar semua layar. Fase 2 memperbaiki pengalaman dan aksesibilitas di atas data yang sudah konsisten. Fase 3 baru merapikan struktur kode.

Setiap item merujuk ke id tugas di [`BACKLOG_HAIKU.md`](./BACKLOG_HAIKU.md). Tugas yang menyentuh `src/App.tsx` berada di jalur App dan harus dikerjakan berurutan.

### 4.1 Fase 1: integritas data dan alur

| Item | Backlog | Kriteria terima ringkas |
|---|---|---|
| Ekspor CSV utuh | T01 | Filter "All" menghasilkan 25 baris; ACT-03 memuat `#FFE14D` dan `→`; field berkutip tidak merusak kolom. |
| Approve keluar dari antrean dan dedupe per id sumber | T02 | Approve `SUB-1041` menambah baris Published dan menyisakan 6 item antrean; submit ulang memunculkan `SUB-1042`. |
| Rekonsiliasi data mock | T07 | Tidak ada judul yang muncul di queue dan Published sekaligus; panjang seluruh array seed tidak berubah. |
| Helper `logActivity` untuk semua aksi | T10 | Approve, invite, dan disconnect masing-masing menambah satu baris di Activity log dan Dashboard. |
| Save draft yang nyata | T11 | Tab Drafts naik dari 3 ke 4; klik kedua tidak membuat duplikat. |
| Propagasi keputusan ke Staff dan kalender | T12 | `MY-201` dan `CAL-06` mengikuti status submit, revisi, dan approve. |
| Submit sesuai platform dan judul terpilih | T15 | Head hanya melihat caption platform yang dipilih, lengkap dengan hashtag; judul queue sama dengan hasil edit. |
| Role ditentukan dari layar | T17 | Sidebar selalu cocok dengan layar tujuan; langkah ketiga stepper Staff Upload tidak dapat diklik. |

### 4.2 Fase 2: UX dan aksesibilitas

| Item | Backlog | Kriteria terima ringkas |
|---|---|---|
| Kelas `.gaskeun-*` masuk `@layer components` | T03 | Banner sukses berwarna `#E6EFFF` dengan border biru; focus outline terlihat; reduced motion dihormati. |
| Guard submit dan badge "Ready" | T05 | Submit nonaktif sampai typo diperbaiki; submit kedua tidak mungkin; banner memakai `aria-live`. |
| Clamp pagination | T06 | Setelah filter berubah, tabel menampilkan halaman valid terakhir, bukan halaman kosong. |
| Label dan aria pada form | T08 | Klik label memfokuskan field; tidak ada input tanpa nama aksesibel. |
| `latestApprovedItem` nullable | T14 | Published tanpa approve hanya menampilkan kartu info dan tabel, tanpa hero palsu. |
| Badge sidebar dan pill koneksi berbasis data | T19 | Disconnect Instagram mengubah pill menjadi "LinkedIn connected"; save draft menaikkan badge Drafts. |
| `handleSignOut` mereset state | T20 | Setelah sign out dan masuk kembali, poster kembali ke "Typo detected". |
| `StatusChip` dengan label dan chip kategori bersama | T24 | Chip Approved, AI check, dan Admin tampil dengan warna dan label yang benar di dua layar Admin. |

### 4.3 Fase 3: kualitas kode

| Item | Backlog | Kriteria terima ringkas |
|---|---|---|
| Ekspor tipe `QueueStatus` dan `PosterTheme` | T25 | Union duplikat di App dan Head Queue dihapus; tsc 0 error. |
| A11y LayoutShell | T26 | Elemen klik menjadi `button`; `aria-expanded` dan `aria-current` terpasang; hanya satu dropdown terbuka. |
| A11y Head Review Queue | T27 | Baris antrean menjadi `button` dengan `aria-pressed`; textarea berlabel; timer banner memakai `useRef`. |
| Ekstrak `WorkflowStepper` dan `readImageAsDataUrl` | T28 | Tidak ada salinan stepper atau pembaca gambar di layar; prop mati `GaskeunLogo` dihapus. |
| Token warna `@theme` | T29 | Token didefinisikan di `index.css`; tampilan tidak berubah sebelum migrasi TSX. |
| Pecah LayoutShell | T31 | Sidebar dan Topbar berada di `components/layout/*`; API publik `LayoutShell` tetap. |
| Ekstrak handler App ke hooks | T32 | `useStaffFlow`, `useReviewFlow`, dan `useAdminState` memisahkan tanggung jawab tanpa mengubah perilaku. |
| Bersihkan impor dan simbol mati | T34 | `noUnusedLocals` tidak melaporkan temuan di file yang disentuh; tsconfig tidak diubah. |

Tugas pendukung yang dapat dikerjakan menyusul tanpa mengubah urutan fase: T04 (copy TikTok dan gate Send test), T09 (judul tab dan favicon), T13 (catatan Staff terpisah), T16 (saran kalender), T18 (validasi invite), T21 (StaffPlatforms menerima data nyata), T22 dan T23 (Published dan guard Head), T30 (migrasi hex per layar), serta T33 (drawer mobile).

## 5. Risiko dan batasan yang disengaja

Bagian ini menegaskan hal-hal yang **tidak boleh diperbaiki tanpa permintaan eksplisit**. Semuanya adalah bagian dari narasi demo atau keputusan platform.

| Item | Alasan dipertahankan | Perlakuan |
|---|---|---|
| Typo "Aplly now" | Inti demo "Typo detected → Fixed". Nilainya dikendalikan `typoFixed` dan sengaja tersebar di beberapa file. | Jangan perbaiki ejaan, jangan ganti menjadi "Apply" di data seed, dan jangan hapus flag `typoFixed`. |
| Placeholder `[CITY]` dan `[DEADLINE]` | Menunjukkan konten yang belum final dan menjadi bagian alur pemeriksaan. | Jangan isi dengan nilai nyata, jangan hapus, dan jangan ubah menjadi field dinamis tanpa permintaan. |
| Label "Gemini" dan "Brand Guardian" | Simulasi AI dan pemeriksaan brand; tidak ada API di baliknya. | Jangan menambahkan panggilan API, kunci, atau dependensi AI. Perlakukan sebagai teks demo. |
| Login tanpa autentikasi | Demo memilih role, bukan memverifikasi identitas. | Jangan menambahkan backend auth, token, atau validasi password. |
| Tanpa router dan URL | Navigasi memakai `currentScreen` di `App.tsx`. | Jangan menambahkan react-router atau deep link tanpa keputusan produk. |
| Data mock dan reset saat reload | Tidak ada penyimpanan; semua perubahan hanya di memori. | Jangan menambahkan localStorage atau database tanpa permintaan. |
| Id alur hard-coded | `SUB-1042` dan `CAL-09` dirujuk langsung oleh handler. | Jangan mengganti nama id; kalau perlu, sentuh semua referensi dan tambahkan konstanta bersama. |
| File yang dikelola platform | `vite.config.ts`, `.figma/make/*`, `.mise.toml`, dan slot `<!-- figma:* -->` di `index.html`. | Jangan diedit, kecuali `site.json` untuk tugas T09. |
| Tanpa test dan linter | Repo demo; verifikasi dilakukan manual dan lewat tsc. | Jangan menambahkan test runner atau linter tanpa persetujuan. |
| Formatter `oxfmt` | Menulis ulang seluruh file dan mengganggu diff. | Jangan jalankan `pnpm format`, `oxfmt`, atau `.figma/make/format`. |

Risiko teknis yang tersisa setelah fase 1-3: bundle JavaScript 390.93 kB (102.54 kB gzip) masih satu chunk, belum ada code splitting; seluruh state lintas-layar tetap berada di satu komponen sampai T32 selesai; dan tidak ada jaring pengaman test untuk regresi alur. Risiko ini diterima untuk skala demo, tetapi harus dicatat di setiap PR yang menambah layar atau status baru.

## 6. Cara memakai dokumen ini saat review atau PR

Dokumen ini adalah titik rujukan tunggal untuk menjawab "apakah perubahan ini sudah benar dan apakah berada dalam lingkup".

1. **Petakan perubahan ke area dan id.** Cocokkan berkas yang berubah dengan tabel status di bagian 1, lalu cari id temuan di bagian 3 atau id tugas di backlog. PR tanpa id yang jelas biasanya mencampur beberapa lingkup.
2. **Periksa prasyarat fase.** Item Fase 2 dan Fase 3 mengandaikan item Fase 1 yang menjadi dasar datanya sudah selesai. Tugas di jalur App (`src/App.tsx`) tidak boleh dikerjakan paralel dengan tugas App lain.
3. **Jalankan verifikasi yang sama.** Setiap PR wajib mencantumkan hasil `pnpm exec tsc --noEmit -p .` dan `pnpm build`, beserta tanggal dan ukuran chunk bila berubah. Jangan menyalin hasil dari dokumen ini; jalankan ulang.
4. **Cocokkan dengan kriteria terima.** Kriteria di bagian 4 dan di backlog bersifat dapat diamati. "Sudah diimplementasikan" bukan bukti; tunjukkan layar, baris data, atau keluaran perintah yang berubah.
5. **Jaga batas yang disengaja.** Tolak perubahan yang menyentuh "Aplly", `[CITY]`, `[DEADLINE]`, label Gemini/Brand Guardian, atau file platform tanpa persetujuan tertulis di PR.
6. **Perbarui dokumen ini bila status berubah.** Setelah sebuah item backlog selesai, pindahkan ringkasannya dari bagian 3 atau 4 ke tabel status, dan catat tanggal verifikasi baru. Dokumen yang tidak diperbarui lebih berbahaya daripada tidak ada dokumen.

Urutan review yang disarankan: kebenaran data (apakah state berubah dan tersinkron), lalu perilaku yang terlihat (apakah layar menampilkan hasil yang sama), lalu aksesibilitas, dan terakhir kerapian kode. Jangan membalik urutan ini; refactor sebelum data benar hanya memindahkan bug.

## Lihat juga

- [`../README.md`](../README.md) — gambaran produk dan cara menjalankan aplikasi.
- [`arsitektur.md`](./arsitektur.md) — struktur modul, aliran state, dan batas antar-layar.
- [`referensi-data.md`](./referensi-data.md) — dataset mock, id, dan kontradiksi yang diketahui.
- [`BACKLOG_HAIKU.md`](./BACKLOG_HAIKU.md) — 34 tugas kecil beserta kriteria terima.
- [`TEMUAN_LENGKAP.md`](./TEMUAN_LENGKAP.md) — 187 temuan dengan lokasi dan saran perbaikan.
