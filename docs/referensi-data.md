# Referensi Data Mock GasKeun

Dokumen ini menjelaskan seluruh data demo GasKeun: sumber, jumlah, bentuk record, skema tipe, relasi antar-dataset, id yang dipakai langsung oleh kode, serta konvensi waktu. Semua nilai diambil dari `src/data/mockData.ts` dan `src/types.ts`.

## 1. Prinsip Data

1. Seluruh data aplikasi berasal dari satu berkas, yaitu `src/data/mockData.ts`. Tidak ada backend, API, database, atau autentikasi sungguhan.
2. Data hanya hidup di memori. `App.tsx` menyalin konstanta seed ke `useState` saat mount, lalu seluruh perubahan dilakukan pada state tersebut.
3. Tidak ada persistensi. `localStorage`, `sessionStorage`, dan cookie tidak dipakai untuk data domain. Satu-satunya nilai yang bertahan di sesi adalah `customLogoUrl`, berupa data URL di state dan hilang saat reload.
4. Reload halaman mengembalikan seluruh dataset ke kondisi awal. Sign out hanya berpindah ke layar `login`; state tidak di-reset.
5. Seed bersifat read-only. Handler di `App.tsx` memakai update immutable (`map`, spread) dan tidak memutasi array seed.
6. Dataset tidak memakai foreign key. Relasi antar-dataset disambungkan lewat judul post dan nama orang berupa string biasa.
7. Tidak ada validasi runtime terhadap bentuk record. Jaminan tipe hanya berasal dari anotasi `QueueItem[]`, `PublishedPostItem[]`, dan seterusnya di berkas seed.

## 2. Ringkasan Dataset

| Konstanta | Jumlah | Id prefix/rentang | Tipe item | Layar konsumen |
|---|---|---|---|---|
| `ROLE_PROFILES` | 3 | key `Staff`, `Head`, `Admin` | Profil persona | Login, LayoutShell, App |
| `INITIAL_QUEUE_ITEMS` | 7 | `SUB-1036`–`SUB-1042` | `QueueItem` | Head Review Queue, Published (hero) |
| `INITIAL_PUBLISHED_POSTS` | 9 | `PUB-893`–`PUB-901` | `PublishedPostItem` | Published |
| `INITIAL_STAFF_SUBMISSIONS` | 12 | `MY-201`–`MY-212` | `StaffSubmissionItem` | My submissions, Drafts |
| `INITIAL_CALENDAR_POSTS` | 14 | `CAL-01`–`CAL-14` | `CalendarPostItem` | Content calendar |
| `INITIAL_TEAM_DESIGNERS` | 7 | `DES-1`–`DES-7` | `TeamDesignerItem` | Team |
| `INITIAL_USERS_LIST` | 12 | `USR-01`–`USR-12` | `MemberUserItem` | Users & roles, Dashboard |
| `INITIAL_ACTIVITY_LOG` | 24 | `ACT-01`–`ACT-24` | `ActivityLogEntry` | Activity log, Dashboard |
| `INITIAL_AI_DRAFTS` | 3 | key `Instagram`, `LinkedIn`, `TikTok` | `PlatformDraft` | Staff Upload, Staff Platforms |
| `ALTERNATE_AI_DRAFTS` | 3 | key `Instagram`, `LinkedIn`, `TikTok` | `PlatformDraft` | Staff Upload (Regenerate) |

Distribusi status seed: queue 3 `Submitted`, 2 `In review`, 2 `Revision`; staff submissions 2 `In review`, 2 `Revision`, 3 `Draft`, 2 `Scheduled`, 3 `Published`; calendar 5 `Published`, 2 `In review`, 3 `Scheduled`, 1 `Submitted`, 2 `Revision`, 1 `Draft`. Activity log memuat 6 `Submitted`, 3 `AI check`, 3 `Approved`, 2 `Revision`, 6 `Published`, dan 4 `Admin`.

## 3. Konstanta dan Contoh Record

Bagian ini memuat field utama setiap konstanta beserta contoh ringkas. Caption panjang dipotong dengan elipsis. Skema lengkap ada di Bagian 4.
### 3.1 `ROLE_PROFILES`

Didefinisikan di `src/data/mockData.ts:14` sebagai `Record<Role, {...}>`.

| Field | Tipe | Contoh (Staff) |
|---|---|---|
| `name` | `string` | `Rina Putri` |
| `roleLabel` | `string` | `Staff Designer` |
| `email` | `string` | `rina.putri@lumbung.studio` |
| `initials` | `string` | `RP` |
| `avatarBg` | `string` | `linear-gradient(135deg, #1450E0 0%, #08D9F0 100%)` |
| `homeScreen` | `'staff-upload' \| 'head-queue' \| 'admin-dashboard'` | `staff-upload` |
```json
{ "Staff": { "name": "Rina Putri", "roleLabel": "Staff Designer", "initials": "RP", "homeScreen": "staff-upload" } }
```

Persona lain: `Head` = Bima Santoso, `Head Designer`, `BS`, `head-queue`; `Admin` = Ayu Lestari, `Workspace Admin`, `AL`, `admin-dashboard`.
### 3.2 `INITIAL_QUEUE_ITEMS`

Didefinisikan di `src/data/mockData.ts:119`. Urutan seed menurun dari `SUB-1042` ke `SUB-1036`.

| Field | Tipe | Contoh (SUB-1042) |
|---|---|---|
| `id` | `string` | `SUB-1042` |
| `title` | `string` | `We're hiring: UI/UX Designer` |
| `designer` | `string` | `Rina Putri` |
| `submittedAt` | `string` | `10 mins ago` |
| `status` | `'Submitted' \| 'In review' \| 'Revision'` | `Submitted` |
| `riskLevel` | `'LOW RISK' \| 'MEDIUM RISK'` | `LOW RISK` |
| `riskScore` | `number` | `12` |
| `platforms` | `PlatformName[]` | `["Instagram", "LinkedIn"]` |
| `type` | `ContentType` | `Poster` |
| `posterTheme` | union 7 tema | `hiring` |
| `captions` | objek per platform | Instagram dan LinkedIn, tanpa TikTok |
| `revisionNote` | `string` opsional | tidak ada pada `SUB-1042` |
```json
{ "id": "SUB-1042", "title": "We're hiring: UI/UX Designer", "designer": "Rina Putri", "status": "Submitted", "riskLevel": "LOW RISK", "riskScore": 12, "platforms": ["Instagram", "LinkedIn"], "type": "Poster", "posterTheme": "hiring", "captions": { "Instagram": "Ready to craft interfaces…", "LinkedIn": "We are expanding our in-house design team…" } }
```
### 3.3 `INITIAL_PUBLISHED_POSTS`

Didefinisikan di `src/data/mockData.ts:323`. Urutan seed menurun dari `PUB-901` ke `PUB-893`.

| Field | Tipe | Contoh (PUB-901) |
|---|---|---|
| `id` | `string` | `PUB-901` |
| `title` | `string` | `We're hiring: UI/UX Designer` |
| `designer` | `string` | `Rina Putri` |
| `platforms` | `PlatformName[]` | `["Instagram", "LinkedIn"]` |
| `publishedAt` | `string` | `Just now · 14 Oct 2026, 14:22` |
| `reach` | `string` | `1,420` |
| `posterTheme` | `string` | `hiring` |
```json
{ "id": "PUB-901", "title": "We're hiring: UI/UX Designer", "designer": "Rina Putri", "platforms": ["Instagram", "LinkedIn"], "publishedAt": "Just now · 14 Oct 2026, 14:22", "approvalDuration": "14 min", "reach": "1,420", "engagement": "6.8%", "posterTheme": "hiring" }
```
### 3.4 `INITIAL_STAFF_SUBMISSIONS`

Didefinisikan di `src/data/mockData.ts:426`. Dataset ini adalah daftar "My submissions" milik Rina Putri.

| Field | Tipe | Contoh (MY-201) |
|---|---|---|
| `id` | `string` | `MY-201` |
| `title` | `string` | `We're hiring: UI/UX Designer` |
| `type` | `ContentType` | `Poster` |
| `status` | `SubmissionStatus` | `In review` |
| `updatedAt` | `string` | `10 mins ago` |
| `reviewer` | `string` | `Bima Santoso` |
| `revisionNote` | `string` opsional | tidak ada pada `MY-201` |
```json
{ "id": "MY-201", "title": "We're hiring: UI/UX Designer", "type": "Poster", "platforms": ["Instagram", "LinkedIn"], "status": "In review", "updatedAt": "10 mins ago", "reviewer": "Bima Santoso" }
```
### 3.5 `INITIAL_CALENDAR_POSTS`

Didefinisikan di `src/data/mockData.ts:540`. Tiga minggu, masing-masing tujuh hari.

| Field | Tipe | Contoh (CAL-06) |
|---|---|---|
| `id` | `string` | `CAL-06` |
| `title` | `string` | `We're hiring: UI/UX Designer` |
| `weekIndex` | `0 \| 1 \| 2` | `1` |
| `dayIndex` | `number` | `2` |
| `time` | `string` | `14:30` |
| `platforms` | `PlatformName[]` | `["Instagram", "LinkedIn"]` |
| `status` | `SubmissionStatus` | `In review` |
```json
{ "id": "CAL-06", "title": "We're hiring: UI/UX Designer", "designer": "Rina Putri", "weekIndex": 1, "dayIndex": 2, "time": "14:30", "platforms": ["Instagram", "LinkedIn"], "status": "In review" }
```
### 3.6 `INITIAL_TEAM_DESIGNERS`

Didefinisikan di `src/data/mockData.ts:689`. Tujuh kartu desainer, enam per halaman.

| Field | Tipe | Contoh (DES-1) |
|---|---|---|
| `id` | `string` | `DES-1` |
| `name` | `string` | `Rina Putri` |
| `title` | `string` | `Senior Visual & Brand Designer` |
| `workload` | `'Busy' \| 'Normal' \| 'Light'` | `Busy` |
| `publishedCount` | `number` | `6` |
| `latestItem` | `string` | `We're hiring: UI/UX Designer` |
| `latestStatus` | `SubmissionStatus` | `Submitted` |
| `avgTurnaround` | `string` | `14 min` |
```json
{ "id": "DES-1", "name": "Rina Putri", "initials": "RP", "avatarBg": "#1450E0", "title": "Senior Visual & Brand Designer", "workload": "Busy", "inReviewCount": 2, "revisionsCount": 1, "publishedCount": 6, "latestItem": "We're hiring: UI/UX Designer", "latestStatus": "Submitted", "avgTurnaround": "14 min" }
```
### 3.7 `INITIAL_USERS_LIST`

Didefinisikan di `src/data/mockData.ts:791`. Dua belas anggota, enam per halaman.

| Field | Tipe | Contoh (USR-01) |
|---|---|---|
| `id` | `string` | `USR-01` |
| `name` | `string` | `Rina Putri` |
| `email` | `string` | `rina.putri@lumbung.studio` |
| `role` | `Role` | `Staff` |
| `status` | `'Active' \| 'Invite pending' \| 'Deactivated'` | `Active` |
| `lastActive` | `string` | `2 mins ago` |
| `submissionsCount` | `number` | `12` |
```json
{ "id": "USR-01", "name": "Rina Putri", "email": "rina.putri@lumbung.studio", "initials": "RP", "avatarBg": "#1450E0", "role": "Staff", "status": "Active", "lastActive": "2 mins ago", "submissionsCount": 12 }
```
### 3.8 `INITIAL_ACTIVITY_LOG`

Didefinisikan di `src/data/mockData.ts:927`. Dua puluh empat entri, delapan per halaman.

| Field | Tipe | Contoh (ACT-01) |
|---|---|---|
| `id` | `string` | `ACT-01` |
| `timestamp` | `string` | `14 Oct 2026, 14:22` |
| `person` | `string` | `Bima Santoso` |
| `actionCategory` | union 6 kategori | `Published` |
| `actionLabel` | `string` | `Approved & auto-published` |
| `targetTitle` | `string` | `We're hiring: UI/UX Designer` |
```json
{ "id": "ACT-01", "timestamp": "14 Oct 2026, 14:22", "person": "Bima Santoso", "personRole": "Head", "actionCategory": "Published", "actionLabel": "Approved & auto-published", "targetTitle": "We're hiring: UI/UX Designer", "detail": "Published live to Instagram (@lumbung.studio) and LinkedIn" }
```
### 3.9 `INITIAL_AI_DRAFTS`

Didefinisikan di `src/data/mockData.ts:51` sebagai `Record<PlatformName, PlatformDraft>`. Draf awal untuk poster hiring.

| Field | Tipe | Contoh (Instagram) |
|---|---|---|
| `tone` | `string` | `Energetic, visual-first & studio-friendly` |
| `title` | `string` | `We're hiring: UI/UX Designer` |
| `caption` | `string` | `Ready to craft interfaces that millions love? …` |
| `hashtags` | `string[]` | 6 tag, diawali `#LumbungStudio` |
| `maxChars` | `number` | `2200` |
```json
{ "tone": "Energetic, visual-first & studio-friendly", "title": "We're hiring: UI/UX Designer", "caption": "Ready to craft interfaces that millions love? …", "hashtags": ["#LumbungStudio", "#UIUXDesigner", "#DesignJobs", "#ProductDesign", "#CreativeCareers", "#HiringNow"], "maxChars": 2200 }
```

`maxChars` per platform: Instagram 2200, LinkedIn 3000, TikTok 400.
### 3.10 `ALTERNATE_AI_DRAFTS`

Didefinisikan di `src/data/mockData.ts:91`. Set kedua yang dipakai tombol Regenerate; bentuknya sama dengan `INITIAL_AI_DRAFTS`.

| Field | Tipe | Contoh (Instagram) |
|---|---|---|
| `tone` | `string` | `Bold, direct & community-driven` |
| `title` | `string` | `Join Lumbung Studio: UI/UX Designer Wanted` |
| `caption` | `string` | `Great design happens when sharp systems meet bold craft. …` |
| `hashtags` | `string[]` | 5 tag, diawali `#LumbungStudio` |
| `maxChars` | `number` | `2200` |
```json
{ "tone": "Bold, direct & community-driven", "title": "Join Lumbung Studio: UI/UX Designer Wanted", "caption": "Great design happens when sharp systems meet bold craft. …", "hashtags": ["#LumbungStudio", "#HiringUIUX", "#DesignCommunity", "#DigitalProduct", "#StudioLife"], "maxChars": 2200 }
```

## 4. Skema `src/types.ts`
### 4.1 Alias Tipe

`Role` = `'Staff' | 'Head' | 'Admin'`; `ScreenId` = 13 literal layar dari `login` sampai `admin-activity`; `SubmissionStatus` = 6 status; `PlatformName` = `'Instagram' | 'LinkedIn' | 'TikTok'` (huruf I kapital); `ContentType` = `'Poster' | 'Carousel' | 'Video' | 'Story'`.
### 4.2 Interface

Kolom "Wajib" berarti field harus ada pada setiap record. Hanya field bertanda `?` yang opsional.

| Interface | Field | Tipe | Wajib | Keterangan |
|---|---|---|---|---|
| `PlatformDraft` | `tone` | `string` | Wajib | Gaya bahasa draf. |
| `PlatformDraft` | `title` | `string` | Wajib | Judul draf per platform. |
| `PlatformDraft` | `caption` | `string` | Wajib | Caption, boleh memuat `\n\n`. |
| `PlatformDraft` | `hashtags` | `string[]` | Wajib | Daftar tagar. |
| `PlatformDraft` | `maxChars` | `number` | Wajib | Batas karakter platform. |
| `QueueItem` | `id` | `string` | Wajib | Prefix `SUB-`. |
| `QueueItem` | `title` | `string` | Wajib | Judul post. |
| `QueueItem` | `designer` | `string` | Wajib | Nama desainer. |
| `QueueItem` | `designerInitials` | `string` | Wajib | Inisial, tidak unik. |
| `QueueItem` | `designerColor` | `string` | Wajib | Hex warna avatar. |
| `QueueItem` | `submittedAt` | `string` | Wajib | Waktu relatif. |
| `QueueItem` | `status` | `'Submitted' \| 'In review' \| 'Revision'` | Wajib | Tidak ada Approved/Rejected. |
| `QueueItem` | `riskLevel` | `'LOW RISK' \| 'MEDIUM RISK'` | Wajib | Label risiko. |
| `QueueItem` | `riskScore` | `number` | Wajib | Skor 0–100. |
| `QueueItem` | `platforms` | `PlatformName[]` | Wajib | Platform tujuan. |
| `QueueItem` | `type` | `ContentType` | Wajib | Tipe konten. |
| `QueueItem` | `aiWhatItIs` | `string` | Wajib | Ringkasan AI. |
| `QueueItem` | `aiChecks` | `string[]` | Wajib | Hasil pemeriksaan AI. |
| `QueueItem` | `aiRecommendation` | `string` | Wajib | Rekomendasi AI. |
| `QueueItem` | `posterTheme` | `'hiring' \| 'product' \| 'outing' \| 'promo' \| 'sharing' \| 'batik' \| 'casestudy'` | Wajib | Tema `PosterGraphic`. |
| `QueueItem` | `captions.Instagram` | `string` | Wajib | Caption Instagram. |
| `QueueItem` | `captions.LinkedIn` | `string` | Wajib | Caption LinkedIn. |
| `QueueItem` | `captions.TikTok` | `string` | Opsional | Hanya ada jika TikTok dipakai. |
| `QueueItem` | `revisionNote` | `string` | Opsional | Catatan revisi Head. |
| `PublishedPostItem` | `id` | `string` | Wajib | Prefix `PUB-`. |
| `PublishedPostItem` | `title` | `string` | Wajib | Judul post. |
| `PublishedPostItem` | `designer` | `string` | Wajib | Nama desainer. |
| `PublishedPostItem` | `platforms` | `PlatformName[]` | Wajib | Platform terbit. |
| `PublishedPostItem` | `publishedAt` | `string` | Wajib | Waktu terbit. |
| `PublishedPostItem` | `approvalDuration` | `string` | Wajib | Durasi approval. |
| `PublishedPostItem` | `reach` | `string` | Wajib | Angka dengan pemisah ribuan. |
| `PublishedPostItem` | `engagement` | `string` | Wajib | Persentase. |
| `PublishedPostItem` | `posterTheme` | `string` | Wajib | Longgar, bukan union. |
| `StaffSubmissionItem` | `id` | `string` | Wajib | Prefix `MY-`. |
| `StaffSubmissionItem` | `title` | `string` | Wajib | Judul post. |
| `StaffSubmissionItem` | `type` | `ContentType` | Wajib | Tipe konten. |
| `StaffSubmissionItem` | `platforms` | `PlatformName[]` | Wajib | Platform tujuan. |
| `StaffSubmissionItem` | `status` | `SubmissionStatus` | Wajib | Enam status. |
| `StaffSubmissionItem` | `updatedAt` | `string` | Wajib | Waktu relatif atau absolut. |
| `StaffSubmissionItem` | `reviewer` | `string` | Wajib | Nama reviewer. |
| `StaffSubmissionItem` | `revisionNote` | `string` | Opsional | Catatan revisi. |
| `CalendarPostItem` | `id` | `string` | Wajib | Prefix `CAL-`. |
| `CalendarPostItem` | `title` | `string` | Wajib | Judul post. |
| `CalendarPostItem` | `designer` | `string` | Wajib | Nama desainer. |
| `CalendarPostItem` | `weekIndex` | `0 \| 1 \| 2` | Wajib | 0: 5–11 Oct, 1: 12–18 Oct, 2: 19–25 Oct 2026. |
| `CalendarPostItem` | `dayIndex` | `number` | Wajib | 0 = Senin sampai 6 = Minggu. |
| `CalendarPostItem` | `time` | `string` | Wajib | Format `HH:mm`, 24 jam. |
| `CalendarPostItem` | `platforms` | `PlatformName[]` | Wajib | Platform tujuan. |
| `CalendarPostItem` | `status` | `SubmissionStatus` | Wajib | Enam status. |
| `TeamDesignerItem` | `id` | `string` | Wajib | Prefix `DES-`. |
| `TeamDesignerItem` | `name` | `string` | Wajib | Nama lengkap. |
| `TeamDesignerItem` | `initials` | `string` | Wajib | Inisial, tidak unik. |
| `TeamDesignerItem` | `avatarBg` | `string` | Wajib | Hex warna avatar. |
| `TeamDesignerItem` | `title` | `string` | Wajib | Jabatan. |
| `TeamDesignerItem` | `workload` | `'Busy' \| 'Normal' \| 'Light'` | Wajib | Beban kerja. |
| `TeamDesignerItem` | `inReviewCount` | `number` | Wajib | Jumlah item in review. |
| `TeamDesignerItem` | `revisionsCount` | `number` | Wajib | Jumlah revisi. |
| `TeamDesignerItem` | `publishedCount` | `number` | Wajib | Jumlah terbit. |
| `TeamDesignerItem` | `latestItem` | `string` | Wajib | Judul item terbaru. |
| `TeamDesignerItem` | `latestStatus` | `SubmissionStatus` | Wajib | Status item terbaru. |
| `TeamDesignerItem` | `avgTurnaround` | `string` | Wajib | Durasi rata-rata. |
| `MemberUserItem` | `id` | `string` | Wajib | Prefix `USR-`. |
| `MemberUserItem` | `name` | `string` | Wajib | Nama anggota. |
| `MemberUserItem` | `email` | `string` | Wajib | Domain `@lumbung.studio`. |
| `MemberUserItem` | `initials` | `string` | Wajib | Inisial, tidak unik. |
| `MemberUserItem` | `avatarBg` | `string` | Wajib | Hex warna avatar. |
| `MemberUserItem` | `role` | `Role` | Wajib | Staff, Head, atau Admin. |
| `MemberUserItem` | `status` | `'Active' \| 'Invite pending' \| 'Deactivated'` | Wajib | Status akun. |
| `MemberUserItem` | `lastActive` | `string` | Wajib | Waktu relatif atau absolut. |
| `MemberUserItem` | `submissionsCount` | `number` | Wajib | Jumlah submission. |
| `ActivityLogEntry` | `id` | `string` | Wajib | Prefix `ACT-`. |
| `ActivityLogEntry` | `timestamp` | `string` | Wajib | Format absolut. |
| `ActivityLogEntry` | `person` | `string` | Wajib | Nama pelaku. |
| `ActivityLogEntry` | `personRole` | `Role \| 'System'` | Wajib | Peran pelaku. |
| `ActivityLogEntry` | `actionCategory` | `'Submitted' \| 'AI check' \| 'Approved' \| 'Revision' \| 'Published' \| 'Admin'` | Wajib | Kategori filter. |
| `ActivityLogEntry` | `actionLabel` | `string` | Wajib | Label aksi. |
| `ActivityLogEntry` | `targetTitle` | `string` | Wajib | Judul post atau nama target. |
| `ActivityLogEntry` | `detail` | `string` | Wajib | Keterangan bebas. |

Tidak ada field tambahan pada record seed di luar daftar di atas. Anotasi array bertipe di `mockData.ts` menolak properti berlebih saat kompilasi.

## 5. Relasi Lintas Dataset
### 5.1 Contoh Post yang Muncul di Empat Dataset

Post "We're hiring: UI/UX Designer" adalah contoh paling lengkap:

| Dataset | Id | Status | Pemilik | Waktu |
|---|---|---|---|---|
| Queue | `SUB-1042` | `Submitted` | Rina Putri | `10 mins ago` |
| Staff submissions | `MY-201` | `In review` | Rina Putri | `10 mins ago` |
| Calendar | `CAL-06` | `In review` | Rina Putri | Wed 14 Oct 2026, 14:30 |
| Published | `PUB-901` | Terbit | Rina Putri | `Just now · 14 Oct 2026, 14:22` |
| Activity log | `ACT-01`–`ACT-04` | Published/Approved/AI check/Submitted | Bima Santoso dan Rina Putri | 14 Oct 2026, 14:08–14:22 |
| Draf AI | `INITIAL_AI_DRAFTS.Instagram` | Draf | Rina Putri | Tidak ada waktu |
### 5.2 Judul yang Berulang Antar-Dataset

| Judul | Queue | Submissions | Calendar | Published |
|---|---|---|---|---|
| `We're hiring: UI/UX Designer` | `SUB-1042` | `MY-201` | `CAL-06` | `PUB-901` |
| `Product launch carousel` | `SUB-1041` | `MY-203` | `CAL-04`, `CAL-07` | `PUB-899` |
| `11.11 promo teaser` | `SUB-1040` | `MY-202` | `CAL-09`, `CAL-14` | `PUB-894` |
| `Friday sharing session` | `SUB-1039` | `MY-206` | `CAL-03`, `CAL-08` | `PUB-898` |
| `Team outing recap` | `SUB-1038` | `MY-207` | `CAL-01`, `CAL-12` | `PUB-896` |
| `Q3 client case study` | `SUB-1037` | `MY-208` | `CAL-02`, `CAL-11` | `PUB-897` |
| `Studio open house invite` | `SUB-1036` | `MY-205` | `CAL-10` | `PUB-895` |
| `Year-end greeting card` | Tidak ada | `MY-204` | `CAL-13` | `PUB-893` |
| `National Batik Day greeting` | Tidak ada | `MY-209` | `CAL-05` | `PUB-900` |

Tiga judul hanya ada di My submissions: `We're hiring: UI/UX Designer (Story cut)` (`MY-210`), `Product launch carousel (Teaser)` (`MY-211`), dan `Friday sharing session (Motion Systems)` (`MY-212`).
### 5.3 Daftar Kontradiksi

1. **Status hiring bertabrakan.** `SUB-1042` berstatus `Submitted`, `MY-201` dan `CAL-06` berstatus `In review`, tetapi `PUB-901` dan `ACT-01` menyatakan post sudah terbit pada 14:22.
2. **Studio open house sudah terbit tetapi masih revisi.** `SUB-1036` dan `MY-205` berstatus `Revision`, sedangkan `PUB-895` menyatakan terbit 03 Oct 2026.
3. **Year-end greeting card masih draf tetapi sudah terbit.** `MY-204` dan `CAL-13` berstatus `Draft`, sedangkan `PUB-893` dan `ACT-24` menyatakan terbit 28 Sep 2026.
4. **Tipe Team outing recap berbeda.** `SUB-1038` bertipe `Carousel`, `MY-207` bertipe `Video`, dan `ACT-22` menyebut "video recap".
5. **Kepemilikan 11.11 promo teaser berbeda.** `SUB-1040`, `CAL-09`, `CAL-14`, dan `ACT-06` menyebut Sari Wulandari, tetapi `PUB-894` dan `MY-202` berada di daftar Rina Putri.
6. **Kepemilikan Year-end greeting card berbeda.** `PUB-893` menyebut Nadia Kusuma, sedangkan `CAL-13` menyebut Rina Putri.
7. **My submissions memuat judul milik desainer lain.** Enam judul di `INITIAL_STAFF_SUBMISSIONS` juga dikreditkan ke Dimas Arya, Sari Wulandari, Tomi Hartono, Nadia Kusuma, Raka Pratama, dan Maya Anggraini di dataset lain.
8. **Judul yang sama dijadwalkan dua kali.** `Product launch carousel` ada di `CAL-04` dan `CAL-07`; `Friday sharing session` di `CAL-03` dan `CAL-08`; `Team outing recap` di `CAL-01` dan `CAL-12`; `Q3 client case study` di `CAL-02` dan `CAL-11`; `11.11 promo teaser` di `CAL-09` dan `CAL-14`.
9. **`latestApprovedItem` bukan hasil approval.** Nilai awalnya `INITIAL_QUEUE_ITEMS[0]` (`SUB-1042`, status `Submitted`) di `src/App.tsx:65`, sehingga hero Published menampilkan item yang belum di-approve.
10. **Approve tidak menambah baris Published.** `handleApproveItem` melakukan dedupe berdasarkan `title` (`src/App.tsx:191`). Semua judul queue sudah ada di `INITIAL_PUBLISHED_POSTS`, sehingga approve tidak pernah menambah baris.

Kontradiksi ini disengaja sebagai bahan demo dan dicatat lengkap di `./TEMUAN_LENGKAP.md`.

## 6. Id yang Hard-Coded di Kode

| Id | Lokasi | Peran | Akibat jika diubah |
|---|---|---|---|
| `SUB-1042` | `src/data/mockData.ts:121` | Record seed item hiring. | Item tidak lagi cocok dengan handler submit. |
| `SUB-1042` | `src/App.tsx:143` | Target `handleSubmitForApproval`; hanya item ini yang ditimpa. | Submit menjadi no-op tanpa error tipe; queue dan activity log tidak sinkron. |
| `SUB-1042` | `src/screens/HeadReviewQueueScreen.tsx:63` | Fallback `selectedId` saat `items` kosong. | Fallback menunjuk id yang tidak ada; panel detail tidak menemukan item. |
| `CAL-09` | `src/data/mockData.ts:625` | Record seed 11.11 promo. | Saran kalender tidak menemukan target. |
| `CAL-09` | `src/App.tsx:219` | Target `handleApplyCalendarSuggestion`. | Tombol Apply suggestion menjadi no-op tanpa error tipe. |

Perubahan id tidak menghasilkan error kompilasi karena id bertipe `string`. Perbaikannya harus menyentuh seed dan seluruh literal di kode secara bersamaan.

## 7. Konvensi Id
### 7.1 Id Seed

| Prefix | Dataset | Pola | Contoh |
|---|---|---|---|
| `SUB-` | Queue | 4 digit, menurun | `SUB-1036`–`SUB-1042` |
| `PUB-` | Published | 3 digit, menurun | `PUB-893`–`PUB-901` |
| `MY-` | Staff submissions | 3 digit, menaik | `MY-201`–`MY-212` |
| `CAL-` | Calendar | 2 digit, menaik | `CAL-01`–`CAL-14` |
| `DES-` | Team | 1 digit, menaik | `DES-1`–`DES-7` |
| `USR-` | Users | 2 digit, menaik | `USR-01`–`USR-12` |
| `ACT-` | Activity log | 2 digit, menaik | `ACT-01`–`ACT-24` |

Tidak ada id yang sama antar-dataset. Id seed tidak boleh dipakai ulang untuk record baru.
### 7.2 Id Runtime

Pola yang benar-benar dipakai kode berbeda per dataset:

| Dataset | Ekspresi | Lokasi | Catatan |
|---|---|---|---|
| Activity log | `` `ACT-${Date.now()}` `` | `src/App.tsx:161` | Epoch milidetik 13 digit, misalnya `ACT-1791987720000`. Tidak sebanding secara leksikografis dengan `ACT-01`. |
| Published | `` `PUB-${900 + prev.length + 1}` `` | `src/App.tsx:195` | Dengan 9 seed, id berikutnya `PUB-910`; `PUB-902`–`PUB-909` tidak pernah dipakai. |
| Users | `` `USR-${usersList.length + 1}` `` | `src/App.tsx:246` | Dengan 12 seed, undangan berikutnya `USR-13`. |

Klaim umum `PREFIX-${Date.now()}` hanya berlaku untuk activity log. `PUB-` dan `USR-` memakai penghitung berbasis panjang array, sehingga id bisa bertabrakan jika jumlah record berubah sebelum pembuatan id berikutnya. Karena state tidak dipersistensi, tabrakan hanya bertahan sampai reload.

## 8. Konvensi Waktu dan Tanggal

1. Tanggal demo "hari ini" adalah **Rabu 14 Oct 2026**. Kalender menandai hari ini sebagai `weekIndex === 1 && dayIndex === 2`.
2. Tiga minggu kalender: minggu 0 = 5–11 Oct 2026, minggu 1 = 12–18 Oct 2026, minggu 2 = 19–25 Oct 2026.
3. Waktu relatif dipakai untuk aktivitas terbaru: `Just now`, `10 mins ago`, `1 hour ago`, `2 hours ago`, `Yesterday`, `2 days ago`.
4. Waktu absolut dipakai untuk arsip: `14 Oct 2026, 14:22`, `12 Oct 2026`, `18 Sep 2026`.
5. `publishedAt` menggabungkan keduanya dengan pemisah titik tengah: `Just now · 14 Oct 2026, 14:22`. Nilai runtime dari `handleApproveItem` hanya `Just now · 14 Oct 2026`, tanpa jam.
6. `CalendarPostItem.time` memakai `HH:mm` 24 jam, misalnya `09:00`, `14:30`, `19:30`.
7. `MemberUserItem.lastActive` dapat berisi waktu relatif, status koneksi (`Online`), atau keterangan undangan (`Invited 2 days ago`).
8. Tidak ada objek `Date` di dataset. Semua waktu adalah string yang ditampilkan apa adanya; tidak ada parsing, sortir kronologis, atau konversi zona waktu.
9. Format tampilan mengikuti string seed. Jangan mengubahnya menjadi `ISO 8601` tanpa menyesuaikan layar.

## 9. Cara Aman Mengubah atau Menambah Data

1. **Tentukan dataset dan konsumennya.** Cari nama konstanta di `src/App.tsx` dan layar terkait. Periksa apakah layar memakai id, judul, atau status secara langsung.
2. **Cocokkan dengan interface.** Tambahkan semua field wajib dari `src/types.ts`. Field opsional hanya `captions.TikTok` dan `revisionNote`. Untuk status queue, gunakan hanya `Submitted`, `In review`, atau `Revision`.
3. **Periksa judul dan nama yang dipakai bersama.** Cari judul di seluruh `src/data/mockData.ts`. Jika judul sama muncul di queue, submissions, calendar, dan published, ubah semuanya atau sengaja biarkan berbeda dan catat kontradiksinya.
4. **Jaga id dan urutan seed.** Gunakan prefix dan nomor berikutnya yang belum dipakai. Jangan mengubah `SUB-1042` atau `CAL-09` tanpa memperbarui `src/App.tsx` dan `HeadReviewQueueScreen.tsx`. Perhatikan bahwa pagination, badge, dan KPI tertentu masih berupa angka literal.
5. **Verifikasi.** Jalankan `pnpm exec tsc --noEmit -p .` lalu `pnpm build`. Buka layar yang terpengaruh dan periksa jumlah baris, filter status, serta panel detail. Jangan menjalankan formatter.

## Lihat juga

- [Arsitektur](./arsitektur.md)
- [Referensi komponen](./referensi-komponen.md)
- [Panduan pengguna](./panduan-pengguna.md)
- [Temuan lengkap](./TEMUAN_LENGKAP.md)
- [README proyek](../README.md)
