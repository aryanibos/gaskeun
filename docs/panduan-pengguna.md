# Panduan Pengguna GasKeun

GasKeun adalah demo front-end alur persetujuan konten media sosial untuk tim desain in-house Lumbung Studio. Panduan ini menjelaskan cara memakai ketiga role demo, layar demi layar, lalu menutup dengan alur demo lima menit yang bisa diikuti penguji.

## 1. Sebelum mulai

### 1.1 Sifat demo

- **Tidak ada backend.** Semua data berasal dari `src/data/mockData.ts` dan hanya hidup di memori browser.
- **Reload mengembalikan semuanya ke kondisi awal.** Draf yang diedit, keputusan review, user yang diundang, dan status koneksi platform semuanya hilang saat halaman dimuat ulang.
- **Login hanya memilih role.** Email dan password diabaikan sepenuhnya. Tidak ada autentikasi, validasi, maupun sesi.
- **"Gemini" dan "Brand Guardian" adalah simulasi.** Tidak ada panggilan API. Seluruh hasil pre-check bersifat hard-coded.
- **`Sign out` tidak mereset state.** Tombol ini hanya berpindah ke layar login; data yang sudah diubah tetap ada sampai reload.

### 1.2 Persona demo

| Nama | Role | Label role | Email | Home screen |
|---|---|---|---|---|
| Rina Putri | Staff | Staff Designer | `rina.putri@lumbung.studio` | `staff-upload` |
| Bima Santoso | Head | Head Designer | `bima.santoso@lumbung.studio` | `head-queue` |
| Ayu Lestari | Admin | Workspace Admin | `ayu.lestari@lumbung.studio` | `admin-dashboard` |

Semua akun memakai domain `@lumbung.studio`.

### 1.3 Login dan navigasi dasar

1. Buka aplikasi. Anda mendarat di layar `Sign in to Gaskeun`.
2. Pada bagian `Demo: sign in as`, klik salah satu kartu role: `Staff`, `Head`, atau `Admin`. Kartu yang aktif ditandai border biru dan ikon centang, dan kolom `Work email` langsung berubah mengikuti persona.
3. Klik tombol `Sign in as Staff` (teksnya mengikuti role terpilih). Anda masuk ke home screen role tersebut.
4. `Continue with Google` melakukan hal yang sama: masuk sebagai role yang sedang terpilih.

Setelah masuk, ada tiga cara berpindah. **Menu sidebar** di kiri berisi menu sesuai role aktif. **`ACTIVE ROLE VIEW`** di sidebar berisi tiga tombol `Staff` / `Head` / `Admin`; mengganti role di sini langsung membuka home screen role baru. **`All 13 screens`** di topbar adalah jumper untuk membuka layar mana pun, dan ikut mengganti role mengikuti layar tujuan kecuali untuk `Login & role picker` dan `Brand guidelines`.

Topbar juga memuat pil status `Instagram & LinkedIn connected`, lonceng notifikasi dengan teks `3 unread`, dan avatar persona. Pil dan angka notifikasi tersebut statis.

## 2. Panduan role Staff

### 2.1 Upload & AI draft (`staff-upload`)

**Tujuan.** Menyiapkan poster hiring dan draf caption per platform sebelum dikirim ke Head Designer.

**Elemen utama.** Stepper `Upload & AI draft` → `Platforms & check` → `Head approval`, panel `Artwork preview` berisi poster dan tombol `Replace`, panel `Gemini detected: Hiring poster` dengan field `Position`, `Experience`, `Location`, `Deadline`, lalu panel `AI-drafted post` dengan tombol `Regenerate`, tab `Instagram` / `LinkedIn` / `TikTok`, field `Post title`, textarea caption dengan penghitung karakter, chip `Recommended hashtags`, serta tombol `Save draft` dan `Continue to platforms`.

**Langkah penggunaan.**

1. Ubah `Post title` atau caption pada tab platform yang diinginkan. Perubahan langsung tersimpan di state aplikasi dan bertahan saat Anda berpindah layar, tetapi hilang saat reload.
2. Klik `Regenerate` untuk meminta draf alternatif. Tombol menampilkan spinner sekitar 320 ms, lalu seluruh isi draf platform aktif diganti.
3. Klik `Replace` untuk mengganti berkas contoh. Nama berkas bergiliran di antara tiga contoh.
4. Untuk menghapus hashtag, klik ikon silang pada chip. Untuk menambah, klik `Add`, isi kolom `#NewHashtag`, lalu klik `Add` lagi. Tag tanpa tanda pagar akan ditambahi `#` otomatis.
5. Klik `Continue to platforms` untuk melanjutkan ke langkah kedua.

**Hasil yang terlihat.**

- Setelah `Regenerate`: toast hijau `Gemini regenerated Instagram draft` (nama platform mengikuti tab aktif), dan judul draf Instagram berubah menjadi `Join Lumbung Studio: UI/UX Designer Wanted`.
- Setelah `Replace`: toast `Replaced file with hiring-uiux-designer-alt.png`, dan info berkas di bawah poster ikut berubah.
- Setelah `Save draft`: toast `Saved to Drafts`.

**Batasan.**

- `Regenerate` hanya bergantian antara dua set draf (`INITIAL_AI_DRAFTS` dan `ALTERNATE_AI_DRAFTS`). Regenerate dua kali mengembalikan draf ke versi awal, dan semua editan manual Anda ikut hilang.
- `Save draft` tidak menyimpan apa pun. Toast sukses muncul, tetapi tidak ada baris baru di tab `Drafts` dan isi draf tidak pernah masuk ke `My submissions`.
- Placeholder `[CITY]` dan `[DEADLINE]` memang dibiarkan apa adanya sebagai bagian dari cerita demo.
- Poster menampilkan CTA `Aplly now` beserta badge `Typo detected` sampai Anda memperbaikinya di layar berikutnya.

### 2.2 Platforms & check (`staff-platforms`)

**Tujuan.** Memilih kanal publikasi, menentukan waktu terbit, menjalankan checklist Brand Guardian, lalu mengirim submission ke Head Designer.

**Elemen utama.** Tiga kartu platform dengan status `ON` / `OFF`, kartu `Publishing timing`, banner `Gemini time suggestion: Thu, 15 Oct 2026 at 19:00 WIB`, panel `Brand Guardian checklist`, dan sidebar `Submission summary` berisi thumbnail, `Selected platforms`, kartu `Reviewer`, kolom `Optional note for reviewer`, serta tombol `Submit for approval` dan `Back to AI draft`.

**Langkah penggunaan.**

1. Klik kartu platform untuk menyalakan atau mematikan kanal. Bawaan demo: Instagram dan LinkedIn `ON`, TikTok `OFF` dengan badge `Needs video`.
2. Pilih `Publish right after approval` atau `Schedule with Gemini suggestion`. Pilihan kedua memunculkan input tanggal dan waktu yang sudah terisi `2026-10-15T19:00`.
3. Pada `Brand Guardian checklist`, klik `Fix “Aplly” → “Apply”`.
4. Periksa `Selected platforms` di sidebar. Bila kosong, muncul teks merah `Please select at least one platform` dan tombol submit nonaktif.
5. Isi atau ubah `Optional note for reviewer` bila perlu, lalu klik `Submit for approval`.

**Hasil yang terlihat.**

- Setelah memperbaiki typo: badge `1 FIX` hilang, `3 PASS` berubah menjadi `4 PASS`, item pertama berubah dari `FIX` menjadi `PASS` dengan teks `Fixed! CTA button text now reads "Apply now" cleanly.`, dan CTA pada poster berubah menjadi `Apply now` dengan badge `Fixed`.
- Setelah submit: banner biru `Submitted to Bima Santoso (Head Designer)!` dengan keterangan `“We're hiring: UI/UX Designer” is now at the top of the Head Review Queue.`, disertai tombol `View My submissions` dan `Open Head Review Queue →`.

**Batasan.**

- Submit menimpa item `SUB-1042` yang sudah ada di antrean, bukan menambah item baru. Judul, desainer, dan status `Submitted` tidak berubah; yang diperbarui hanya caption, daftar platform, `submittedAt` menjadi `Just now`, dan catatan reviewer.
- Submit tidak menambah baris di `My submissions`. Baris `MY-201` sudah ada sejak awal dengan judul yang sama.
- Submit menambah satu entri baru di `Activity log` dengan target judul draf Instagram, walaupun Instagram tidak dipilih.
- Perbaikan typo bersifat global: sekali diperbaiki, semua poster tema hiring di seluruh aplikasi ikut berubah sampai reload.

### 2.3 My submissions dan Drafts (`staff-submissions`)

**Tujuan.** Memantau status semua submission, menindaklanjuti permintaan revisi, dan membuka draf.

**Elemen utama.** Judul halaman berubah mengikuti tab: `My submissions` atau `Drafts`. Banner kuning `2 submissions need your revision` muncul selama ada item berstatus Revision. Tab: `All`, `Drafts`, `In review`, `Revision`, `Scheduled`, `Published`, masing-masing dengan angka. Ada kolom pencarian `Search by submission title, ID, or reviewer...`, dropdown `All platforms` dan `All types`, tabel dengan kolom `Title`, `Type`, `Platforms`, `Reviewer`, `Updated`, `Status`, `Action`, serta paginasi `Showing 1–5 of 12`.

**Langkah penggunaan.**

1. Buka `My submissions` dari sidebar untuk melihat seluruh 12 baris.
2. Klik `Drafts` (sidebar atau tab) untuk menyaring 3 draf.
3. Gunakan pencarian atau dropdown untuk mempersempit daftar. Setiap perubahan filter mengembalikan Anda ke halaman pertama.
4. Klik `Filter revisions (2)` pada banner untuk langsung membuka tab `Revision`.
5. Klik `Open` pada baris mana pun untuk kembali ke `staff-upload`.

**Hasil yang terlihat.**

- Jumlah per tab: `All` 12, `Drafts` 3, `In review` 2, `Revision` 2, `Scheduled` 2, `Published` 3.
- Bila filter tidak menemukan apa pun, muncul `Nothing matches these filters` dengan tombol `Clear search and filters`.
- Baris berstatus Revision menampilkan catatan revisi berwarna cokelat di bawah judul, misalnya `Replace "cheapest" with "best value" and add 12px top margin to the logo mark.`

**Batasan.**

- Halaman ini hanya baca. Keputusan Head Designer tidak pernah masuk ke sini, sehingga status `MY-201` tetap `In review` walau Anda sudah approve di layar Head.
- Tombol `Open` selalu membuka `staff-upload` dengan draf hiring, bukan draf baris yang diklik.
- `New submission` juga membuka `staff-upload`; tidak ada form baru yang benar-benar kosong.

### 2.4 Brand guidelines (`brand-guidelines`)

**Tujuan.** Melihat identitas visual Lumbung Studio dan aturan yang dipakai Brand Guardian.

**Elemen utama.** Bagian `Logo rules`, `Client palette swatches` (Sun `#FFE14D`, Ink `#1F1A2E`, Berry `#F0307A`, Paper `#FFFFFF`), `Tone of voice per platform`, `Brand Guardian rule toggles` dengan hitungan `5 / 5 active`, dan `Words to avoid`.

**Langkah penggunaan.**

1. Buka `Brand guidelines` dari sidebar Staff atau Admin.
2. Klik salah satu swatch untuk menyalin hex ke clipboard.
3. Gunakan toggle pada setiap aturan untuk menyalakan atau mematikan pre-check.
4. Tambahkan frasa terlarang lewat kolom `Add restricted word or phrase...` lalu klik `Add phrase`. Hapus dengan ikon silang pada chip.

**Hasil yang terlihat.**

- Setelah menyalin: label berubah dari `Copy` menjadi `Copied` selama sekitar 1,8 detik.
- Hitungan `5 / 5 active` berubah saat toggle dimatikan.
- Frasa baru langsung muncul sebagai chip merah.

**Batasan.**

- Semua perubahan hanya ada di state lokal layar. Begitu Anda berpindah layar, toggle dan daftar kata kembali ke kondisi awal.
- Mematikan aturan tidak mengubah checklist di `staff-platforms`; angka `1 FIX` / `3 PASS` hard-coded. Head juga tidak punya menu ini, walaupun layar bisa dibuka lewat jumper `All 13 screens`.

## 3. Panduan role Head

### 3.1 Review queue (`head-queue`)

**Tujuan.** Meninjau submission, membaca ringkasan AI, lalu menyetujui atau meminta revisi.

**Elemen utama.** Tiga kartu statistik (`Waiting for review` 5 waiting, `Needs revision` 2 revisions, `Brand Guardian ready` 3 low risk), panel `Submissions queue` dengan pencarian `Search title, designer, or ID...`, chip status `All` / `Submitted` / `In review` / `Revision`, dropdown desainer `All designers`, serta panel detail di kanan berisi poster, `AI review summary`, skor risiko, `Automated checks`, `Platform captions`, dan tiga tombol aksi.

**Langkah penggunaan.**

1. Klik salah satu item di daftar kiri. Panel kanan langsung berganti.
2. Baca `AI review summary`: badge risiko, `Brand & compliance risk score`, `What it is`, dan daftar `Automated checks`.
3. Buka atau tutup `Platform captions (2)` untuk membaca caption per kanal.
4. Untuk menyetujui, klik `Approve & Gaskeun!`. Anda langsung dibawa ke layar `Published`.
5. Untuk meminta revisi, klik `Request revision`, isi `Revision note for ...`, lalu klik `Send revision request`.
6. Untuk menolak, klik `Reject`.

**Hasil yang terlihat.**

- Setelah `Send revision request`: banner biru `Revision requested for "..." with note sent to Rina Putri.`, status item berubah menjadi `Revision`, dan kotak catatan tertutup.
- Setelah `Reject`: banner `Rejected submission "...".`, tetapi status item juga berubah menjadi `Revision`.
- Setelah `Approve & Gaskeun!`: berpindah ke `Published` dan hero di sana memakai item yang baru disetujui.
- Bila filter tidak cocok: `Nothing matches these filters`.

**Batasan.**

- `Reject` tidak punya status tersendiri. Perilakunya identik dengan permintaan revisi, hanya berbeda teks banner.
- Approve tidak mengubah status item di antrean. Item tetap ada dengan chip `Submitted`.
- Approve tidak menambah baris di tabel `Published`, karena semua judul antrean sudah ada di data terbit.
- Angka pada tiga kartu statistik adalah literal dan tidak ikut berubah setelah keputusan.
- Filter, pilihan item, dan banner hilang setiap kali layar ditinggalkan.

### 3.2 Published (`published`)

**Tujuan.** Melihat konten yang dianggap sudah tayang, lengkap dengan hero, timeline audit, pratinjau sosial, dan arsip.

**Elemen utama.** Hero navy dengan badge `APPROVED · GASKEUN! – Live on Instagram and LinkedIn`, kartu `Upload to live` 14 min dan `Platforms` 2, panel `Audit-trail timeline` dengan `4 / 4 steps verified`, dua pratinjau (`Live on Instagram` dan `Live on LinkedIn`), serta tabel `All published posts` dengan pencarian, chip platform, dan paginasi `Showing 1–4 of 9`.

**Langkah penggunaan.**

1. Buka `Published` dari sidebar Head.
2. Baca hero dan timeline untuk narasi singkat perjalanan konten.
3. Gunakan `Search published posts...` atau chip `All` / `Instagram` / `LinkedIn` / `TikTok` untuk menyaring tabel.
4. Pindah halaman lewat `Prev`, nomor halaman, atau `Next`.

**Hasil yang terlihat.**

- Hero menampilkan judul item yang terakhir di-approve. Sebelum ada approve, judulnya `We're hiring: UI/UX Designer`.
- Pratinjau Instagram menampilkan `148 likes · Published 2 mins ago`, pratinjau LinkedIn menampilkan `64 reactions` dan `12 reposts`.
- Jumlah baris tabel tetap 9 sebelum dan sesudah approve.

**Batasan.**

- Approve tidak menambah baris. Dedupe dilakukan berdasarkan judul, dan sembilan judul awal sudah mencakup semua judul antrean.
- Angka `14 min`, `2`, `4 / 4 steps verified`, `148 likes`, dan `64 reactions` semuanya literal.
- Badge hero selalu menulis `Live on Instagram and LinkedIn`, walau Anda memilih tiga platform atau hanya TikTok.
- Tombol `View live post` tidak membuka apa pun.

### 3.3 Content calendar (`head-calendar`)

**Tujuan.** Melihat jadwal terbit mingguan dan menerapkan saran waktu dari Gemini.

**Elemen utama.** Tombol `Previous`, `This week`, `Next` untuk tiga minggu (5–11, 12–18, 19–25 Oktober 2026), banner `Gemini scheduling suggestion`, label rentang tanggal, hitungan `X of Y posts this week`, chip platform, dropdown `All statuses`, pencarian `Search week...`, dan grid Senin–Minggu.

**Langkah penggunaan.**

1. Buka `Content calendar`. Minggu aktif secara bawaan adalah `12–18 Oct 2026`.
2. Klik `Apply suggestion` pada banner Gemini.
3. Gunakan chip platform, dropdown status, atau pencarian untuk menyaring kartu dalam minggu berjalan.
4. Klik `Previous` atau `Next` untuk berpindah minggu.

**Hasil yang terlihat.**

- Setelah `Apply suggestion`: banner berubah menjadi `Applied! "11.11 promo teaser" is now prioritized for peak evening engagement.`, tombol berganti menjadi badge `Slot optimized`, dan kartu `11.11 promo teaser` pindah ke hari Selasa pukul `19:00` dengan status `Scheduled`.
- Hari Rabu 14 Oktober ditandai badge `Today`.
- Hari tanpa konten menampilkan teks `No posts`.

**Batasan.**

- Saran hanya mengubah `CAL-09`. Keputusan Head di `Review queue` tidak pernah menyentuh kalender.
- `Apply suggestion` hanya bisa dilakukan sekali per kunjungan; status tombol kembali normal setelah layar ditinggalkan.
- Tombol `Previous` nonaktif pada minggu pertama, `Next` nonaktif pada minggu terakhir.

### 3.4 Team (`head-team`)

**Tujuan.** Memantau beban kerja dan kecepatan approval tujuh desainer.

**Elemen utama.** Banner `Gemini weekly insight`, chip `All` / `Busy` / `Normal` / `Light` dengan angka, pencarian `Search designer or latest post...`, dan kartu desainer berisi avatar, beban kerja, hitungan `In review`, `Revisions`, `Published`, `Latest item`, tombol `Review`, serta `Avg. approval turnaround`.

**Langkah penggunaan.**

1. Buka `Team` dari sidebar Head.
2. Saring berdasarkan beban kerja atau cari nama desainer.
3. Klik `Review` pada kartu mana pun untuk membuka `Review queue`.

**Hasil yang terlihat.**

- Chip menampilkan `All` 7, `Busy` 2, `Normal` 3, `Light` 2.
- Kartu Rina Putri menampilkan `Avg. approval turnaround: 14 min`.
- Paginasi `Showing 1–6 of 7` dengan dua halaman.

**Batasan.**

- Halaman sepenuhnya baca-saja. Tidak ada aksi untuk mengubah beban kerja atau menugaskan item, dan tombol `Review` selalu membuka antrean umum, bukan item milik desainer yang diklik.
- Angka pada kartu tidak terhubung ke antrean yang sebenarnya.

## 4. Panduan role Admin

### 4.1 Dashboard (`admin-dashboard`)

**Tujuan.** Memberi ringkasan cepat kesehatan pipeline, kanal terhubung, anggota, dan aktivitas terbaru.

**Elemen utama.** Badge `Sample data`, kolom `Filter users & recent activity...`, empat kartu KPI (`Submissions` 24, `Avg. approval time` 18 min, `Revision rate` 21%, `Published` 19), grafik `Pipeline by status`, panel `Connected accounts` dengan tombol `Manage`, `Workspace members (Top 5)`, dan `Recent activity (Top 5)`.

**Langkah penggunaan.**

1. Buka `Dashboard`.
2. Ketik nama, email, atau role pada kolom filter untuk menyaring bagian anggota dan aktivitas sekaligus.
3. Klik `Connect` atau `Connected ✓` pada daftar akun untuk mengubah status koneksi.
4. Klik `View all` atau `View all activity` untuk membuka layar Admin terkait.

**Hasil yang terlihat.**

- Angka `24`, `18 min`, `21%`, dan `19` tetap sama berapa pun data yang berubah.
- Tombol `Connected ✓` berubah menjadi `Connect` setelah diklik, dan sebaliknya. Bila filter tidak menemukan hasil, muncul `No users match your search query.` atau `No recent activity entries match your search query.`.

**Batasan.**

- Semua KPI dan grafik pipeline adalah literal berlabel `Sample data`.
- Perubahan status koneksi tidak memengaruhi pil `Instagram & LinkedIn connected` di topbar maupun pilihan platform di layar Staff.
- Angka notifikasi dan badge sidebar tetap statis.

### 4.2 Users & roles (`admin-users`)

**Tujuan.** Mengelola anggota workspace dan role-nya.

**Elemen utama.** Panel `Invite member` dengan kolom email, dropdown role (`Staff (Designer)`, `Head (Reviewer)`, `Admin (Workspace)`), dan tombol `Send invite`; chip role `All` / `Staff` / `Head` / `Admin`; pencarian `Search name or email...`; dropdown status; tabel `Member`, `Role`, `Status`, `Submissions`, `Last active`; serta `Role permission matrix`.

**Langkah penggunaan.**

1. Buka `Users & roles`.
2. Isi email rekan, pilih role, lalu klik `Send invite`.
3. Ubah role anggota lewat dropdown pada kolom `Role`. Perubahan langsung berlaku tanpa tombol simpan.
4. Saring tabel dengan chip role, pencarian, atau dropdown status.

**Hasil yang terlihat.**

- Setelah invite: pesan hijau `Invitation sent to nama@lumbung.studio as Staff`, dan baris baru muncul di tabel dengan status `Invite pending` serta `0` submission.
- Nama diturunkan dari bagian sebelum `@`, dengan titik, garis bawah, atau tanda hubung diubah menjadi spasi dan setiap kata dikapitalisasi. Jumlah pada chip role ikut berubah.

**Batasan.**

- Tidak ada email sungguhan yang dikirim; invite hanya menambah baris di memori.
- Role yang diubah tidak memengaruhi menu sidebar atau izin nyata, karena role aktif ditentukan oleh pilihan login.
- Matriks izin bersifat teks statis.
- Perubahan hilang saat reload.

### 4.3 Connected accounts (`admin-connected`)

**Tujuan.** Mengatur koneksi kanal sosial dan kanal notifikasi.

**Elemen utama.** Tiga kartu platform dengan status `Connected` / `Disconnected`, blok `Auto-publish status`, tombol `Disconnect` atau `Connect TikTok`, lalu panel `Notification channels` berisi `Email notifications` dan `Telegram bot alerts` dengan switch dan tombol `Send test`.

**Langkah penggunaan.**

1. Buka `Connected accounts`.
2. Klik `Disconnect` pada Instagram atau LinkedIn, atau `Connect TikTok` untuk menyalakannya.
3. Nyalakan atau matikan switch notifikasi.
4. Klik `Send test` untuk mencoba salah satu kanal.

**Hasil yang terlihat.**

- Status kartu berubah antara `Connected` dan `Disconnected`; teks `Auto-publish status` ikut berganti menjadi `Connect account to enable 1-click publishing` saat terputus.
- Setelah `Send test`: toast hijau `Sent test notification to design-team@lumbung.studio (Email)` atau `Sent test notification to @GaskeunLumbungBot (Telegram)`.

**Batasan.**

- Tidak ada OAuth sungguhan. Status hanya boolean di memori.
- Switch notifikasi adalah state lokal layar dan kembali ke posisi awal setelah berpindah layar.
- Status koneksi tidak dipakai di layar lain mana pun.

### 4.4 Activity log (`admin-activity`)

**Tujuan.** Menelusuri jejak audit seluruh kejadian workspace dan mengekspornya.

**Elemen utama.** Tombol `Export CSV (24)`, chip `All`, `Submitted`, `AI check`, `Approved`, `Revision`, `Published`, `Admin`, pencarian `Search action, content, or detail...`, dropdown `All people`, tabel `Timestamp`, `Person`, `Category`, `Event`, `Target`, `Audit detail`, dan paginasi `Showing 1–8 of 24`.

**Langkah penggunaan.**

1. Buka `Activity log`.
2. Saring dengan chip kategori, pencarian, atau dropdown orang.
3. Klik `Export CSV (N)` untuk mengunduh hasil yang sedang tersaring.

**Hasil yang terlihat.**

- Setelah submit dari sisi Staff, entri baru muncul di paling atas dengan waktu `Just now` dan aksi `Submitted for immediate publish` atau `Submitted for scheduled publish`.
- Setelah ekspor: toast `Exported 24 activity log rows to CSV.` dan berkas `gaskeun-lumbung-studio-activity-log.csv` terunduh.

**Batasan.**

- Berkas CSV terpotong pada karakter `#` pertama, karena unduhan memakai `data:` URI dan `encodeURI`. Pada data awal, pemotongan terjadi di baris `ACT-03` pada teks `#FFE14D`, sehingga baris setelahnya hilang.
- Keputusan Head (approve, revisi, reject) tidak menambah entri log.
- Ekspor mengikuti filter yang aktif, bukan selalu 24 baris.

## 5. Alur demo 5 menit

Ikuti urutan ini persis. Kolom hasil menjelaskan apa yang benar-benar terjadi di layar, termasuk bagian yang belum tersambung. Tiga perilaku yang tampak seperti bug akan muncul di langkah 3, 11, dan 12; sebutkan sebagai batasan demo agar penguji tidak mengira aplikasinya rusak.

| # | Tindakan | Hasil yang terlihat |
|---|---|---|
| 1 | Buka aplikasi. Pada `Demo: sign in as`, klik `Staff`, lalu klik `Sign in as Staff`. | Kolom `Work email` berisi `rina.putri@lumbung.studio`. Anda masuk ke `New content submission`. |
| 2 | Pada tab `Instagram`, ubah `Post title` menjadi `We're hiring: UI/UX Designer — Oct`. | Judul di kolom input berubah dan langsung masuk state. `Save draft` tidak menyimpannya, jadi jangan mengandalkan tombol itu. |
| 3 | Klik `Regenerate`. | Spinner sekitar 0,3 detik, lalu judul menjadi `Join Lumbung Studio: UI/UX Designer Wanted` dan toast `Gemini regenerated Instagram draft`. Editan langkah 2 hilang. |
| 4 | Klik `Continue to platforms`. | Masuk ke `Platforms & Brand Guardian check`. Sidebar kanan menampilkan `Selected platforms (2)`: Instagram dan LinkedIn. |
| 5 | Klik kartu `TikTok`, lalu pilih `Schedule with Gemini suggestion`. | Hitungan berubah menjadi `3 selected`, badge TikTok berubah dari `Needs video` menjadi `ON`, dan input tanggal muncul dengan nilai `2026-10-15T19:00`. |
| 6 | Pada `Brand Guardian checklist`, klik `Fix “Aplly” → “Apply”`. | Badge `1 FIX` hilang, `3 PASS` menjadi `4 PASS`, dan CTA poster berubah dari `Aplly now` menjadi `Apply now` dengan badge `Fixed`. |
| 7 | Klik `Submit for approval`. | Banner `Submitted to Bima Santoso (Head Designer)!` muncul. Item `SUB-1042` di antrean kini memakai caption hasil regenerate dan tiga platform. |
| 8 | Di sidebar, klik `Head` pada `ACTIVE ROLE VIEW`. | Anda mendarat di `Head Designer review queue`. Item pertama sudah terpilih, chip `Submitted`, waktu `Just now`. |
| 9 | Baca `AI review summary`, lalu buka `Platform captions (3)`. | Caption yang tampil adalah hasil regenerate langkah 3. Judul item tetap `We're hiring: UI/UX Designer`, bukan judul hasil regenerate. |
| 10 | Klik `Approve & Gaskeun!`. | Anda pindah ke `Published`. Hero menampilkan `We're hiring: UI/UX Designer` dengan badge `APPROVED · GASKEUN! – Live on Instagram and LinkedIn`. |
| 11 | Perhatikan tabel `All published posts`. | Tabel tetap berisi 9 baris dengan `Showing 1–4 of 9`. Tidak ada baris baru, karena `PUB-901` sudah memakai judul yang sama. |
| 12 | Klik `Review queue` di sidebar. | Item `SUB-1042` masih ada dengan chip `Submitted`. Approve tidak mengubah status antrean. |

Bila ingin mendemokan `Save draft`, lakukan sebelum langkah 4: toast `Saved to Drafts` muncul, tetapi saat Anda membuka `Drafts`, jumlahnya tetap 3 dan tidak ada baris baru.

## 6. Jebakan demo

Perilaku berikut terlihat seperti bug, dan memang sebagian besar adalah bug yang sudah diketahui. Jelaskan sebagai batasan demo, bukan kesalahan penguji.

| Perilaku | Yang sebenarnya terjadi | Cara menyikapi |
|---|---|---|
| `Save draft` memunculkan toast sukses | Tidak ada baris baru di `Drafts`; handler hanya menyalin array yang sama | Sebut sebagai stub; gunakan `Continue to platforms` untuk melanjutkan |
| `Reject` sama dengan revisi | Status berubah menjadi `Revision`; tidak ada status Rejected | Tekankan perbedaan hanya pada teks banner |
| Approve tidak menambah baris `Published` | Dedupe berdasarkan judul; semua judul antrean sudah ada di data terbit | Tunjukkan hero yang berubah, bukan tabel |
| Item yang di-approve tetap di antrean | `handleApproveItem` tidak menyentuh `queueItems` | Sebut sebagai keputusan yang belum tersinkron |
| CSV terpotong | `data:` URI memakai `encodeURI`, sehingga `#` memotong berkas | Ekspor saat filter sempit, atau jelaskan batasannya |
| Badge dan KPI tidak berubah | Angka `12`, `3`, `5`, `5 waiting`, `3 unread`, dan KPI Admin adalah literal | Sebut sebagai data contoh |
| Pil `Instagram & LinkedIn connected` tidak berubah | Teks topbar statis, tidak membaca `connectedPlatforms` | Ubah status di `Connected accounts` untuk menunjukkan bahwa keduanya terpisah |
| Keputusan Head tidak sampai ke Staff | `My submissions` dan kalender tidak menerima update | Bandingkan kedua layar secara eksplisit |
| Typo tidak kembali setelah diperbaiki | `typoFixed` adalah boolean global yang tidak pernah direset | Perbaiki sekali di awal demo |
| Filter dan toggle hilang saat pindah layar | Layar di-unmount, state lokal ikut hilang | Selesaikan satu layar sebelum berpindah |

## 7. FAQ

| Pertanyaan | Jawaban |
|---|---|
| Apakah data saya tersimpan? | Tidak. Semua state ada di memori; reload mengembalikan draf, keputusan review, user baru, dan status koneksi ke kondisi awal. |
| Apakah email dan password berpengaruh? | Tidak. Login hanya memilih role. Email terisi otomatis mengikuti persona, dan password diabaikan. |
| Bagaimana cara berpindah role? | Klik `Staff`, `Head`, atau `Admin` pada `ACTIVE ROLE VIEW` di sidebar. Cara ini langsung membuka home screen role baru. Alternatifnya `Sign out` lalu pilih role di layar login. |
| Mengapa `Aplly now` masih muncul di poster lain? | Karena perbaikan typo disimpan sebagai satu flag global. Sebelum diperbaiki, semua poster tema hiring menampilkan `Aplly now`; setelah diperbaiki, semuanya menampilkan `Apply now`. |
| Mengapa submission saya tidak muncul di `My submissions`? | Karena submit hanya menimpa `SUB-1042` di antrean Head. Tidak ada penambahan baris ke dataset `My submissions`. |
| Mengapa CSV hanya berisi beberapa baris? | Karena ekspor memakai `data:` URI dan `encodeURI`. Karakter `#` pada teks seperti `#FFE14D` memotong isi berkas, sehingga baris setelahnya hilang. |
| Apakah Gemini dan Brand Guardian benar-benar berjalan? | Tidak. Keduanya simulasi; checklist, skor risiko, ringkasan AI, dan saran jadwal semuanya hard-coded di data mock. |

## Lihat juga

- [Indeks dokumentasi](./README.md)
- [Arsitektur](./arsitektur.md)
- [Referensi data](./referensi-data.md)
- [Status dan rencana](./status-dan-rencana.md)
- [Analisis proyek](./ANALISIS_PROYEK.md)
