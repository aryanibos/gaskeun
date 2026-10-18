# Indeks Dokumentasi GasKeun

Dokumentasi ini menjelaskan GasKeun, demo front-end alur persetujuan konten media sosial untuk tim desain in-house Lumbung Studio. Aplikasinya adalah prototipe React tanpa backend, autentikasi sungguhan, router, maupun AI sungguhan; seluruh data berasal dari mock dan kembali ke kondisi awal setiap reload.

Isi dokumentasi ditujukan untuk empat kelompok pembaca:

- **Penguji dan pemangku kepentingan** yang ingin menjalankan alur demo tanpa membaca kode.
- **Desainer dan penulis** yang perlu memahami perilaku tiap layar, status, dan batasan demo.
- **Pengembang** yang akan mengubah `src/`, baik untuk perbaikan bug maupun penambahan layar.
- **Agen dan reviewer** yang membutuhkan kontrak kerja, temuan terverifikasi, dan kriteria terima.

Dokumen di folder ini adalah rujukan aktif. Nilai, nama, dan perilaku yang ditulis di sini diambil dari kode di `src/`, bukan dari rencana. Jika dokumen dan kode berbeda, kode adalah sumber kebenaran dan dokumen perlu diperbarui.

## 1. Mulai dari sini

Gunakan tabel berikut untuk memilih titik masuk sesuai kebutuhan. Setiap baris mengarah ke bagian yang paling langsung menjawab pertanyaan tersebut.

| Kebutuhan | Mulai dari | Keterangan |
|---|---|---|
| Ingin melihat alur demo dari awal sampai akhir | [Panduan pengguna §5](./panduan-pengguna.md#5-alur-demo-5-menit) | Alur lima menit yang bisa diikuti tanpa persiapan teknis |
| Ingin menjalankan aplikasi di mesin sendiri | [README §6](../README.md#6-menjalankan-proyek) | Prasyarat Node 22, pnpm 10, dan perintah dev |
| Baru bergabung dan perlu konteks produk | [README §1](../README.md#1-ringkasan-produk) | Ringkasan masalah, persona, dan fitur per role |
| Akan mengubah kode untuk pertama kali | [AGENTS.md](../AGENTS.md) | Aturan kerja, batasan file, dan jebakan saat mengedit |
| Perlu memahami state dan navigasi | [Arsitektur](./arsitektur.md) | `App.tsx`, `ScreenId`, if-chain render, dan aliran data nyata |
| Mencari nilai, tipe, atau relasi data mock | [Referensi data](./referensi-data.md) | Sepuluh konstanta seed, skema `types.ts`, dan id hard-coded |
| Mencari props atau perilaku komponen | [Referensi komponen](./referensi-komponen.md) | `LayoutShell`, sembilan export `SharedUI`, dan props layar |
| Menilai kondisi proyek dan prioritas perbaikan | [Status dan rencana](./status-dan-rencana.md) | Status per area, known issues terprioritas, dan peta jalan |
| Mencari tugas yang siap dikerjakan | [Backlog Haiku](./BACKLOG_HAIKU.md) | 34 tugas kecil dengan kriteria terima |
| Mencari bukti temuan sampai `file:line` | [Temuan lengkap](./TEMUAN_LENGKAP.md) | 187 temuan terverifikasi, sebagian dalam bahasa Inggris |
| Butuh tangkapan layar untuk presentasi | [Bagian 5](#5-tangkapan-layar) | Tiga belas berkas PNG di `docs/assets/screenshots/` |

## 2. Peta dokumen

### 2.1 Dokumen rujukan aktif

| Dokumen | Isi | Pembaca utama |
|---|---|---|
| [Arsitektur](./arsitektur.md) | Prinsip arsitektur, peta modul, 17 `useState` di `App.tsx`, routing tanpa router, aliran data antar role, lapisan styling, alur submit dan approve, serta utang teknis | Pengembang |
| [Panduan pengguna](./panduan-pengguna.md) | Sifat demo, persona, panduan layar demi layar untuk Staff, Head, dan Admin, alur demo lima menit, jebakan demo, dan FAQ | Penguji, desainer, pemangku kepentingan |
| [Panduan pengembangan](./panduan-pengembangan.md) | Persiapan lingkungan, alur kerja harian, konvensi kode, dan gate verifikasi | Pengembang, kontributor |
| [Referensi data](./referensi-data.md) | Prinsip data, ringkasan sepuluh dataset, contoh record, skema tipe, relasi lintas dataset, kontradiksi, id hard-coded, serta konvensi id dan waktu | Pengembang, QA |
| [Referensi komponen](./referensi-komponen.md) | Peta komponen, dokumentasi `SharedUI` dan `LayoutShell`, props 13 layar, token desain, dan kelas `.gaskeun-*` | Pengembang, desainer |
| [Status dan rencana](./status-dan-rencana.md) | Status per area pada 18 Oktober 2026, hasil verifikasi, known issues terprioritas, peta jalan tiga fase, dan risiko | Reviewer, pemilik produk, pengembang |

### 2.2 Dokumen analisis dan arsip

Ketiga dokumen berikut mendahului rangkaian rujukan di atas. Isinya masih relevan sebagai bukti dan bahan kerja, tetapi sebagian istilah dan nomor barisnya sudah bergeser.

| Dokumen | Isi | Catatan |
|---|---|---|
| [Analisis proyek](./ANALISIS_PROYEK.md) | Analisis arsitektur, aliran data, dan jebakan hasil kerja multi-agen | Ringkasan paling padat untuk memahami kondisi awal proyek |
| [Backlog Haiku](./BACKLOG_HAIKU.md) | 34 tugas kecil siap kerja beserta kriteria terima | Nomor baris dapat berubah; cari lokasi lewat nama fungsi atau teks unik |
| [Temuan lengkap](./TEMUAN_LENGKAP.md) | 187 temuan dengan `file:line`, severity, dan status verifikasi | Isi teknis sengaja dibiarkan dalam bahasa Inggris agar kutipan kode tetap presisi |

### 2.3 Dokumen di luar folder ini

| Dokumen | Isi |
|---|---|
| [README](../README.md) | Ringkasan produk, fitur per role, peta layar, tangkapan layar, cara menjalankan, dan status proyek |
| [CONTRIBUTING](../CONTRIBUTING.md) | Persiapan lingkungan, gate verifikasi, konvensi, aturan commit, dan checklist PR |
| [AGENTS](../AGENTS.md) | Kontrak kerja untuk agen: peta layar, state, data, styling, jebakan, dan batasan file |

## 3. Jalur baca yang disarankan

### 3.1 Penguji dan pemangku kepentingan

1. [README §1](../README.md#1-ringkasan-produk) untuk memahami masalah yang disimulasikan.
2. [Panduan pengguna §5](./panduan-pengguna.md#5-alur-demo-5-menit) untuk mencoba alur utama.
3. [Status dan rencana §1](./status-dan-rencana.md#1-ringkasan-status) untuk membedakan fitur nyata, simulasi, dan yang belum tersambung.
4. [Panduan pengguna §6](./panduan-pengguna.md#6-jebakan-demo) sebelum presentasi, agar tidak salah menyimpulkan perilaku demo.

### 3.2 Desainer dan penulis

1. [Panduan pengguna](./panduan-pengguna.md) sesuai role yang sedang diuji.
2. [Referensi komponen §5](./referensi-komponen.md#5-token-desain) untuk token warna dan tipografi.
3. [Panduan pengguna §2.4](./panduan-pengguna.md#24-brand-guidelines-brand-guidelines) untuk aturan brand yang dipakai pemeriksaan simulasi.

### 3.3 Pengembang dan reviewer

1. [AGENTS.md](../AGENTS.md) dan [CONTRIBUTING](../CONTRIBUTING.md) untuk aturan kerja dan gate verifikasi.
2. [Arsitektur](./arsitektur.md) untuk memahami state, navigasi, dan aliran data sebelum mengedit.
3. [Referensi data](./referensi-data.md) dan [referensi komponen](./referensi-komponen.md) saat menyentuh dataset atau UI bersama.
4. [Status dan rencana](./status-dan-rencana.md) untuk memilih pekerjaan berdampak, lalu [backlog](./BACKLOG_HAIKU.md) untuk tugas yang sudah dipecah.
5. [Temuan lengkap](./TEMUAN_LENGKAP.md) bila butuh bukti dan lokasi pasti suatu masalah.

## 4. Cakupan per layar

Dokumentasi pengguna dan referensi komponen memakai 13 `ScreenId` yang sama dengan `ALL_SCREENS_LIST`. Tabel berikut memetakan layar ke bagian panduan yang membahasnya.

| # | ScreenId | Role | Bagian panduan pengguna |
|---|---|---|---|
| 1 | `login` | Publik | [§1.3](./panduan-pengguna.md#13-login-dan-navigasi-dasar) |
| 2 | `staff-upload` | Staff | [§2.1](./panduan-pengguna.md#21-upload--ai-draft-staff-upload) |
| 3 | `staff-platforms` | Staff | [§2.2](./panduan-pengguna.md#22-platforms--check-staff-platforms) |
| 4 | `head-queue` | Head | [§3.1](./panduan-pengguna.md#31-review-queue-head-queue) |
| 5 | `published` | Head | [§3.2](./panduan-pengguna.md#32-published-published) |
| 6 | `admin-dashboard` | Admin | [§4.1](./panduan-pengguna.md#41-dashboard-admin-dashboard) |
| 7 | `staff-submissions` | Staff | [§2.3](./panduan-pengguna.md#23-my-submissions-dan-drafts-staff-submissions) |
| 8 | `brand-guidelines` | Staff, Admin | [§2.4](./panduan-pengguna.md#24-brand-guidelines-brand-guidelines) |
| 9 | `head-calendar` | Head | [§3.3](./panduan-pengguna.md#33-content-calendar-head-calendar) |
| 10 | `head-team` | Head | [§3.4](./panduan-pengguna.md#34-team-head-team) |
| 11 | `admin-users` | Admin | [§4.2](./panduan-pengguna.md#42-users--roles-admin-users) |
| 12 | `admin-connected` | Admin | [§4.3](./panduan-pengguna.md#43-connected-accounts-admin-connected) |
| 13 | `admin-activity` | Admin | [§4.4](./panduan-pengguna.md#44-activity-log-admin-activity) |

Layar `staff-platforms` hanya dicapai lewat alur submit, bukan dari menu sidebar. Semua layar selain `login` dirender di dalam `LayoutShell`.

## 5. Tangkapan layar

Berkas PNG berada di `docs/assets/screenshots/`. Ukuran dan isinya sesuai kondisi demo pada 18 Oktober 2026.

| Layar | Berkas | Yang terlihat |
|---|---|---|
| Login | [login.png](./assets/screenshots/login.png) | Tiga kartu role dan opsi logo kustom |
| Staff Upload | [staff-upload.png](./assets/screenshots/staff-upload.png) | Poster hiring dan draf AI per platform |
| Staff Platforms | [staff-platforms.png](./assets/screenshots/staff-platforms.png) | Pemilihan platform, jadwal, checklist Brand Guardian, typo |
| My submissions | [staff-submissions.png](./assets/screenshots/staff-submissions.png) | Tab status, pencarian, dan tabel submission |
| Brand guidelines | [brand-guidelines.png](./assets/screenshots/brand-guidelines.png) | Palet, tipografi, dan aturan brand |
| Head Review Queue | [head-queue.png](./assets/screenshots/head-queue.png) | Antrean, filter, dan panel detail |
| Published | [published.png](./assets/screenshots/published.png) | Hero item terakhir yang disetujui dan tabel terbit |
| Content calendar | [head-calendar.png](./assets/screenshots/head-calendar.png) | Jadwal tiga minggu dan saran jadwal |
| Team | [head-team.png](./assets/screenshots/head-team.png) | Beban kerja tujuh desainer |
| Admin Dashboard | [admin-dashboard.png](./assets/screenshots/admin-dashboard.png) | KPI, pipeline status, dan ringkasan workspace |
| Users & roles | [admin-users.png](./assets/screenshots/admin-users.png) | Daftar user, perubahan role, dan undangan |
| Connected accounts | [admin-connected.png](./assets/screenshots/admin-connected.png) | Status koneksi platform dan preferensi notifikasi |
| Activity log | [admin-activity.png](./assets/screenshots/admin-activity.png) | Log aktivitas, filter, dan ekspor CSV |

## 6. Konvensi dokumentasi

- **Bahasa.** Dokumentasi ditulis dalam bahasa Indonesia formal dan ringkas, tanpa emoji. Istilah teknis, nama tipe, dan potongan kode dipertahankan apa adanya.
- **Struktur.** Setiap dokumen memakai satu H1, H2 bernomor, dan H3 untuk subbagian. Referensi disajikan sebagai tabel bila memuat lebih dari tiga pasangan nilai.
- **Tautan.** Tautan antar dokumen di `docs/` memakai bentuk relatif `./nama.md`. Tautan ke berkas di root memakai `../`. Tautan ke bagian memakai anchor slug dari judul.
- **Sumber nilai.** Angka, nama persona, jumlah dataset, dan perilaku layar harus dapat ditelusuri ke `src/`. Jangan menulis nilai perkiraan.
- **Batasan demo.** Setiap dokumen yang menyebut fitur wajib membedakan tiga kondisi: berfungsi, simulasi, dan belum tersambung.
- **Perubahan kode.** Jika sebuah perubahan mengubah perilaku, tipe, atau dataset, perbarui dokumen terkait pada commit yang sama.

## 7. Menjaga indeks ini

Indeks ini perlu disesuaikan ketika terjadi salah satu hal berikut:

1. **Dokumen baru ditambahkan.** Tambahkan baris di [§2.1](#21-dokumen-rujukan-aktif) atau [§2.2](#22-dokumen-analisis-dan-arsip), lalu tautkan dari [§1](#1-mulai-dari-sini) bila relevan untuk pembaca baru.
2. **Layar ditambahkan atau diganti nama.** Perbarui [§4](#4-cakupan-per-layar) dan tangkapan layar terkait. Penambahan layar juga menyentuh lima tempat di kode; lihat [AGENTS.md](../AGENTS.md).
3. **Status proyek berubah.** Perbarui ringkasan di [status dan rencana](./status-dan-rencana.md) lebih dulu, lalu sesuaikan deskripsi di indeks ini bila cakupannya berubah.
4. **Dokumen lama dipensiunkan.** Pindahkan barisnya ke [§2.2](#22-dokumen-analisis-dan-arsip) dan beri catatan pengganti, jangan hapus tanpa jejak.

## Lihat juga

- [README proyek](../README.md)
- [Arsitektur](./arsitektur.md)
- [Panduan pengguna](./panduan-pengguna.md)
- [Status dan rencana](./status-dan-rencana.md)
- [CONTRIBUTING](../CONTRIBUTING.md)
