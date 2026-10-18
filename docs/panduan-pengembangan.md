# Panduan pengembangan GasKeun

Dokumen ini adalah panduan kerja harian untuk mengubah kode GasKeun: menyiapkan lingkungan, menjalankan gate verifikasi, menempatkan state, mengikuti resep perubahan, dan menghindari jebakan yang sudah diketahui. Sumber kebenaran tetap kode di `src/`; bila panduan ini berbeda dengan kode, kode yang menang dan perbedaannya perlu dilaporkan.

## 1. Prasyarat & setup

GasKeun memakai Node 22 dan pnpm 10.34.3. Versi tersebut dipatok di `.mise.toml:1-3`; jangan mengubah file itu. Jika mise tidak tersedia, pasang Node 22 dan pnpm 10.34.3 secara manual, lalu pastikan `node -v` dan `pnpm -v` sesuai.

```powershell
mise install
pnpm install
pnpm dev
```

`pnpm dev` menjalankan Vite pada port `8443` dengan `strictPort: true` (`vite.config.ts:34-36`). Artinya, kalau port sedang dipakai, server gagal start, bukan berpindah port. Jangan menjalankan server kedua saat server pertama masih hidup.

Di Windows, untuk memakai port lain atau mengikat ke localhost saja:

```powershell
$env:PORT='5173'; $env:FIGMA_DEV_SERVER_HOST='127.0.0.1'; pnpm dev
```

`pnpm preview` juga membaca `PORT` dan default ke `8443` (`vite.config.ts:43-46`). Berbeda dari dev, preview tidak menyetel `strictPort`, jadi port bisa bergeser bila sedang dipakai. Hentikan dev server sebelum menjalankan preview agar tidak bentrok.

## 2. Perintah & gate verifikasi

| Perintah | Fungsi | Hasil yang diharapkan |
|---|---|---|
| `pnpm dev` | Dev server dengan HMR | `Local: http://localhost:8443/`, port `8443` |
| `pnpm exec tsc --noEmit -p .` | Type-check seluruh proyek | Selesai tanpa output, exit code 0 |
| `pnpm build` | Build produksi ke `dist/` | Sukses; satu chunk JS sekitar 391 kB (103 kB gzip) dan CSS sekitar 43 kB (8 kB gzip) |
| `pnpm preview` | Menyajikan hasil build | Server preview; port dasar `8443` |

Urutannya wajib: `tsc` dulu, lalu `build`. `pnpm build` hanya menjalankan `vite build` (`package.json:8`); Vite melakukan transpile tanpa type-check, sehingga build yang hijau bukan bukti tipe aman. Jika `tsc` gagal, perbaiki dulu sebelum menjalankan build.

Larangan formatter:

- **Jangan** jalankan `pnpm format`. Script itu memanggil `oxfmt` (`package.json:10`) yang menulis ulang seluruh file.
- **Jangan** jalankan `oxfmt` langsung atau `.figma/make/format`.
- pnpm meneruskan `--` sebagai argumen ke oxfmt, sehingga opsi yang dimaksudkan untuk pnpm bisa berakhir sebagai argumen oxfmt.
- Jangan menambahkan formatter, linter, test runner, router, state library, atau UI kit baru.

Tidak ada test otomatis. Verifikasi perilaku dilakukan dengan membuka layar yang berubah di browser dan menjalankan alurnya secara manual.

## 3. Struktur folder

| File atau folder | Tanggung jawab |
|---|---|
| `src/main.tsx` | Entrypoint React; me-mount `App` ke `#root` dan mengimpor `index.css`. Tanpa state. |
| `src/App.tsx` | Seluruh state lintas-layar, handler `handleX`, routing if-chain, dan komposisi props layar. |
| `src/types.ts` | Tipe domain: `Role`, `ScreenId`, `PlatformName`, `SubmissionStatus`, `QueueItem`, dan lainnya. Tanpa nilai runtime. |
| `src/index.css` | Import font, Tailwind, dan kelas global `.gaskeun-*`. |
| `src/data/mockData.ts` | `ROLE_PROFILES`, seluruh konstanta `INITIAL_*`, dan `ALTERNATE_AI_DRAFTS`. Tanpa fungsi. |
| `src/components/` | `LayoutShell.tsx` (sidebar, topbar, jumper) dan `SharedUI.tsx` (komponen presentational bersama). |
| `src/screens/` | 13 layar, satu file per layar, default export, state lokal untuk filter/halaman/toast. |
| `docs/` | Dokumentasi proyek: arsitektur, referensi, panduan, temuan, dan backlog. |
| `public/` | Aset statis yang disajikan apa adanya, saat ini `favicon.svg`. |

`index.html` adalah shell Vite dengan slot `<!-- figma:* -->`; slot itu diisi platform dan tidak boleh diedit. File konfigurasi di root (`vite.config.ts`, `tsconfig.json`, `package.json`) bukan tempat perubahan fitur.

## 4. Di mana state diletakkan

Aturan dasarnya: state yang hanya dipakai satu layar dan boleh hilang saat navigasi tetap lokal; state yang harus bertahan atau dipakai lintas layar diangkat ke `App.tsx`.

| Kriteria | Lokasi |
|---|---|
| Filter, pencarian, halaman, tab aktif sementara, toast, banner, modal | State lokal layar |
| Data domain yang dibaca beberapa layar (antrean, draf, user, log) | `App.tsx` |
| Nilai yang harus bertahan setelah pindah layar | `App.tsx` |
| Nilai yang mengubah sidebar, topbar, breadcrumb, atau role | `App.tsx` |

Contoh state lokal yang benar ada di `src/screens/StaffUploadScreen.tsx:40-45` (platform aktif, toast, status regenerating), `src/screens/HeadReviewQueueScreen.tsx:57-67` (filter, halaman, item terpilih, banner), dan `src/screens/StaffSubmissionsScreen.tsx:38-40` (`currentPage`, `pageSize`). State lintas-layar ada di `src/App.tsx:43-91`.

Kapan state harus diangkat:

1. Nilainya perlu bertahan ketika pengguna membuka layar lain lalu kembali.
2. Lebih dari satu layar membaca atau menulis nilai yang sama.
3. Perubahan nilai harus terlihat di shell, sidebar, atau layar lain.
4. Nilai itu bagian dari data domain, bukan sekadar preferensi tampilan.

Konsekuensi unmount: layar dirender lewat rantai kondisi `currentScreen === '...' && <Screen />` di `src/App.tsx:288-382`. Hanya satu blok yang menghasilkan elemen. Saat `currentScreen` berubah, komponen lama di-unmount dan seluruh state lokalnya hilang. Filter antrean yang dipilih di Head Review Queue tidak akan bertahan setelah pindah ke Published.

Contoh yang salah, karena menduplikasi sumber kebenaran:

```tsx
// HeadReviewQueueScreen.tsx - jangan lakukan ini
const [items, setItems] = useState(itemsProp);

const approve = (id: string) => {
  setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Revision' } : item)));
};
```

Perubahan di atas tidak pernah sampai ke `App.tsx`, sehingga layar Published dan sidebar tidak ikut berubah. Contoh yang benar:

```tsx
// App.tsx
const [queueItems, setQueueItems] = useState<QueueItem[]>(INITIAL_QUEUE_ITEMS);

const handleUpdateQueueItemStatus = (id: string, status: QueueItem['status']) => {
  setQueueItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, status } : item))
  );
};
```

Layar menerima `items` dan `onUpdateItemStatus` sebagai props, lalu memanggil handler tersebut. Tiga prop meneruskan setter mentah dan merupakan pengecualian yang disengaja: `onSelectRole={setCurrentRole}` (`src/App.tsx:270`, `:309`), `onUploadLogo={setCustomLogoUrl}` (`:273`, `:285`), dan `onTabChange={setActiveStaffTab}` (`:346`). Layar yang memakai `setCurrentRole` mentah wajib memanggil `onNavigate` sendiri karena setter itu tidak membuka home screen role.

## 5. Resep perubahan

### 5.1 Menambah layar - 5 titik

1. Tambahkan literal baru ke union `ScreenId` di `src/types.ts:3-16`.
2. Tambahkan entri di `SCREEN_BREADCRUMBS` (`src/components/LayoutShell.tsx:47`). Objek ini bertipe `Record<ScreenId, ...>`, jadi `tsc` gagal bila ada layar yang terlewat.
3. Tambahkan entri di `ALL_SCREENS_LIST` (`src/components/LayoutShell.tsx:63`) agar layar muncul di jumper. Perbarui juga teks "All 13 screens" di `src/components/LayoutShell.tsx:410` menjadi jumlah baru.
4. Tambahkan item di `roleMenus` (`src/components/LayoutShell.tsx:99`) untuk role yang berhak. Layar yang hanya dicapai lewat alur, seperti `staff-platforms`, tidak perlu masuk menu.
5. Buat file layar di `src/screens/`, impor di `src/App.tsx:29-41`, lalu tambahkan blok render di `src/App.tsx:288-382`.

```tsx
// types.ts
  | 'head-insights';

// LayoutShell.tsx
'head-insights': { section: 'Head', page: 'Insights' },
{ id: 'head-insights', num: 14, label: '14. Head - Insights', role: 'Head' },

// App.tsx
{currentScreen === 'head-insights' && <HeadInsightsScreen />}
```

File layar memakai default export dan `interface HeadInsightsScreenProps` di atas komponen. Props callback diberi prefix `on`.

### 5.2 Menambah status queue - 4 titik

1. Union `QueueItem.status` di `src/types.ts:45`.
2. Union parameter `handleUpdateQueueItemStatus` di `src/App.tsx:176-186`.
3. Union `statusFilter` (`src/screens/HeadReviewQueueScreen.tsx:58`) dan array chip filter (`:226`); union props `onUpdateItemStatus` ada di `:29`.
4. Map `styles` di `StatusChip` (`src/components/SharedUI.tsx:143-153`).

```tsx
// types.ts
status: 'Submitted' | 'In review' | 'Revision' | 'Approved';

// App.tsx
status: 'Submitted' | 'In review' | 'Revision' | 'Approved',

// SharedUI.tsx
Approved: { bg: '#E5F5EC', text: '#146C3C', dot: '#16A34A' },
```

Periksa juga `handleApproveItem` (`src/App.tsx:188`) dan `handleRejectItem` (`src/App.tsx:210`) agar status baru tidak bertabrakan dengan perilaku lama. Status yang tidak ada di `styles` tetap tampil teksnya, tetapi gayanya jatuh ke Draft.

### 5.3 Menambah tema poster - 2 titik

1. Union `posterTheme` di `src/types.ts:53`.
2. Map `themeConfigs` di `src/components/SharedUI.tsx:366-413`.

```tsx
// types.ts
posterTheme: 'hiring' | 'product' | 'outing' | 'promo' | 'sharing' | 'batik' | 'casestudy' | 'event';

// SharedUI.tsx
event: {
  bg: '#0B1F4D',
  badge: 'COMMUNITY EVENT',
  title: 'Community meetup',
  subtitle: 'Design systems in practice',
  accent: '#BBFB52',
},
```

Biarkan fallback `themeConfigs[theme] || themeConfigs.product` di `src/components/SharedUI.tsx:414` tetap ada. Tema `hiring` ditangani cabang khusus sebelum `themeConfigs` (`src/components/SharedUI.tsx:289`); tema baru hanya perlu cabang sendiri bila layout-nya berbeda, bukan sekadar warna dan teks.

### 5.4 Menambah handler dan prop

1. Definisikan handler di `App.tsx` dekat handler sejenis, memakai update immutable.
2. Teruskan sebagai prop di blok render layar (`src/App.tsx:313-322` untuk Head Review Queue).
3. Deklarasikan prop di `interface XScreenProps` layar dan destructure di parameter komponen.
4. Panggil handler dari `onClick` atau `onChange`, bukan menulis state App secara langsung.

```tsx
// App.tsx
const handleMarkInReview = (id: string) => {
  handleUpdateQueueItemStatus(id, 'In review');
};

// blok render App.tsx
<HeadReviewQueueScreen onMarkInReview={handleMarkInReview} />

// HeadReviewQueueScreen.tsx
onMarkInReview: (id: string) => void;
<button type="button" onClick={() => onMarkInReview(item.id)}>Mark in review</button>
```

Jika handler membutuhkan state baru, tambahkan `useState` di `App.tsx:43-91`, bukan di layar, agar nilainya bertahan saat navigasi.

## 6. Konvensi kode

- **Gaya dasar:** kutip tunggal, titik koma, indentasi 2 spasi. Pengecualian hanya `src/main.tsx:1-10` yang tidak memakai titik koma.
- **Apostrof:** string dengan apostrof memakai kutip ganda, misalnya `"We're hiring: UI/UX Designer"`. Di teks JSX, gunakan `&apos;`. Apostrof tanpa escape di string berkutip tunggal merusak build.
- **Update state:** selalu immutable. Contoh: `setQueueItems((prev) => prev.map(...))` (`src/App.tsx:176-186`) dan nested spread di `handleUpdateDraft` (`src/App.tsx:114-125`). Untuk menambah di depan, pakai `[newItem, ...prev]`.
- **Prefix `on`:** semua props callback memakai `onX`, misalnya `onNavigate`, `onApproveItem`, `onTogglePlatform`. Handler di App memakai `handleX`.
- **Toast:** state lokal, hilang lewat `setTimeout` 3000-3500 ms. Contoh `src/screens/StaffUploadScreen.tsx:44` dan `:52`, serta `src/screens/AdminUsersScreen.tsx:69`.
- **Pagination:** setiap perubahan search, filter, atau tab wajib memanggil `setCurrentPage(1)`. Contoh `src/screens/StaffSubmissionsScreen.tsx:45` dan `:97`. `PaginationBar` (`src/components/SharedUI.tsx:196`) tidak membatasi halaman, jadi halaman bisa melewati total data bila tidak di-reset.
- **Waktu:** teks relatif seperti `'Just now'`, bukan objek `Date`. Tanggal demo "hari ini" adalah Rabu 14 Oct 2026 (`src/App.tsx:199`).
- **Export:** layar memakai default export; `SharedUI.tsx` dan `LayoutShell.tsx` memakai named export. Impor relatif (`'../types'`), bukan alias `@`.
- **Bahasa:** teks UI berbahasa Inggris sesuai data demo; komentar dan dokumentasi berbahasa Indonesia. Jangan menambahkan emoji.

## 7. Styling

Tailwind CSS v4 dipasang lewat `@tailwindcss/vite` dan tidak memakai `tailwind.config` maupun `postcss.config`. Kustomisasi tema, bila benar-benar diperlukan, masuk ke `src/index.css` dengan `@theme`. Warna memakai hex arbitrer dan harus memakai nilai yang sudah ada.

| Peran | Hex | Contoh pemakaian |
|---|---|---|
| Teks utama (ink) | `#0B1F4D` | `text-[#0B1F4D]` |
| Teks sekunder (muted) | `#52607E` | `text-[#52607E]` |
| Primary / hover | `#1450E0` / `#1044C4` | Tombol dan tautan aktif |
| Border / border input | `#E6ECF5` / `#D5DEEE` | Kartu dan field |
| Latar halaman | `#F5F7FC` | Latar utama |
| Panel AI | `#F2F6FF` / `#D9E4FF` | `.gaskeun-ai-panel` |
| Sukses | `#146C3C` / `#E5F5EC` | Chip Published |
| Peringatan | `#7A5300` / `#FFF4D6` | Chip Revision |
| Aksen | `#BBFB52` (lime), `#08D9F0` (cyan) | Aksen visual |

Palet brand klien - Sun `#FFE14D`, Ink `#1F1A2E`, Berry `#F0307A`, Paper `#FFFFFF` - hanya boleh dipakai di poster dan halaman Brand guidelines. Jangan memakainya untuk chrome aplikasi, sidebar, atau tombol.

Kelas global `.gaskeun-card`, `.gaskeun-btn-primary`, `.gaskeun-btn-secondary`, `.gaskeun-ai-panel`, dan `.gaskeun-h1` didefinisikan di `src/index.css:13-61` **tanpa** `@layer`. Gaya tanpa layer mengalahkan utility Tailwind pada elemen yang sama. Menambahkan `bg-*` atau `border-*` ke elemen ber-`gaskeun-card` tidak akan berefek; bungkus dengan elemen anak atau pakai `style` bila memang perlu override.

Font Plus Jakarta Sans dimuat lewat `@import` di baris pertama `src/index.css:1`, sebelum `@import 'tailwindcss'` di `:2`. Urutan ini tidak boleh dibalik; `@import` setelah aturan lain diabaikan.

Tombol memakai `type="button"`, `cursor-pointer`, dan tinggi sekitar 44 px. State nonaktif memakai `disabled:opacity-40 disabled:pointer-events-none`. Ikon memakai `lucide-react` v1 yang tidak punya ikon brand; Instagram dan LinkedIn diimpor dari `SharedUI`, TikTok memakai ikon `Video`.

## 8. Jebakan

| Jebakan | Dampak | Cara menghindari |
|---|---|---|
| File platform-managed: `vite.config.ts`, `.figma/make/` (kecuali `site.json`), `.mise.toml`, `.gitignore`, `.gitattributes`, slot `<!-- figma:* -->` di `index.html` | Perubahan hilang atau ditimpa platform; dev server bisa restart | Jangan edit. Metadata situs hanya lewat `.figma/make/site.json`. |
| Id `SUB-1042` (`src/App.tsx:143`) dan `CAL-09` (`src/App.tsx:219`) | Alur submit dan saran kalender rusak tanpa error tipe | Pertahankan id; grep seluruh `src/` sebelum mengganti nama atau id. |
| Inisial `RP` dipakai Rina Putri dan Raka Pratama (`src/data/mockData.ts:29`, `:240`, `:693`, `:749`) | Avatar atau data orang tertukar bila inisial dipakai sebagai key | Pakai `id`, email, atau nama lengkap sebagai key; inisial hanya untuk tampilan. |
| `StatusChip` tidak mengenal status baru (`src/components/SharedUI.tsx:143`) | Teks status tampil, tetapi gayanya jatuh ke Draft | Tambahkan entri di map `styles`; jangan mengandalkan fallback. |
| `PosterGraphic` tidak mengenal tema baru (`src/components/SharedUI.tsx:414`) | Poster diam-diam memakai tema `product` tanpa error tipe | Tambahkan tema ke union dan `themeConfigs`; cek fallback tetap `product`. |
| Tombol pemilih role di `LoginScreen` berada di dalam `<form>` (`src/screens/LoginScreen.tsx:292`) | Tanpa `type="button"`, klik role men-submit form dan memuat ulang halaman | Selalu tulis `type="button"` pada tombol non-submit, terutama di dalam form. |

Jebakan lain yang sering muncul: `Rina Putri`, `Bima Santoso`, dan angka checklist Brand Guardian tersebar sebagai literal di banyak file. Cari dengan grep sebelum mengubahnya. Tulisan "Aplly now", placeholder `[CITY]`/`[DEADLINE]`, dan label simulasi "Gemini"/"Brand Guardian" memang disengaja; jangan diperbaiki.

## 9. Definition of done & checklist PR

Sebuah perubahan dianggap selesai bila perilaku yang diminta berjalan end-to-end, `tsc` bersih, build sukses, dan layar terkait sudah dicoba di browser. Dokumentasi yang terdampak juga harus diperbarui. Aturan commit, branch, dan review lengkap ada di [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

- [ ] `pnpm exec tsc --noEmit -p .` menghasilkan 0 error.
- [ ] `pnpm build` sukses.
- [ ] Perubahan dicoba di browser pada layar dan alur yang terpengaruh.
- [ ] Tidak menjalankan `pnpm format`, `oxfmt`, atau formatter lain.
- [ ] Tidak menambah dependency, router, state library, UI kit, atau test runner.
- [ ] Tidak mengedit file platform-managed atau slot `<!-- figma:* -->`.
- [ ] State lintas-layar berada di `App.tsx`; update state tetap immutable.
- [ ] Layar baru terdaftar di `ScreenId`, `SCREEN_BREADCRUMBS`, `ALL_SCREENS_LIST`, `roleMenus`, dan blok render `App.tsx`.
- [ ] Status queue atau tema poster baru sudah lengkap di semua union dan map terkait.
- [ ] Id `SUB-1042`/`CAL-09`, tulisan "Aplly", dan placeholder `[CITY]`/`[DEADLINE]` tidak berubah.
- [ ] Deskripsi PR menyebutkan masalah, perubahan, cara verifikasi, dan layar yang terpengaruh.

## Lihat juga

- [Arsitektur](./arsitektur.md)
- [Referensi komponen](./referensi-komponen.md)
- [Referensi data](./referensi-data.md)
- [Status dan rencana](./status-dan-rencana.md)
