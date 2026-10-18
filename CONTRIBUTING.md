# Berkontribusi di GasKeun

Panduan ini berlaku untuk siapa pun yang mengubah kode GasKeun. Baca [README.md](README.md) untuk gambaran produk dan [AGENTS.md](AGENTS.md) untuk konteks lengkap. Jika panduan ini berbeda dengan kode, kode adalah sumber kebenaran; laporkan perbedaannya.

## 1. Menyiapkan lingkungan

Prasyarat: Node 22 dan pnpm 10. Versi yang dipatok ada di `.mise.toml` (Node 22, pnpm 10.34.3).

```bash
mise install        # opsional, jika memakai mise
pnpm install
pnpm dev
```

Dev server memakai port `8443` (`PORT` di `vite.config.ts:35`). Jangan menjalankan server kedua saat server pertama masih hidup. Di PowerShell, untuk port lain:

```powershell
$env:PORT='5173'; $env:FIGMA_DEV_SERVER_HOST='127.0.0.1'; pnpm dev
```

Proyek tidak memiliki test runner maupun linter. Verifikasi dilakukan lewat TypeScript dan build.

## 2. Gate verifikasi

Setiap perubahan wajib melewati dua langkah berikut, berurutan:

```bash
pnpm exec tsc --noEmit -p .
pnpm build
```

`tsc` harus menghasilkan 0 error. `pnpm build` tidak melakukan type-check, jadi build yang sukses bukan pengganti `tsc`. Jika `tsc` gagal, perbaiki dulu sebelum menjalankan build.

Aturan tambahan:

- **Jangan** jalankan `pnpm format`, `oxfmt`, atau `.figma/make/format`. Ketiganya menulis ulang semua file, dan pnpm meneruskan `--` sebagai argumen.
- **Jangan** menambah dependency, router, state library, UI kit, atau test runner kecuali diminta.
- **Jangan** mengedit `vite.config.ts`, isi `.figma/make/` (kecuali `site.json`), `.mise.toml`, `.gitignore`, `.gitattributes`, atau slot `<!-- figma:* -->` di `index.html`.
- Hindari mengedit `package.json` dan `pnpm-lock.yaml`; perubahan di sana memicu reinstall dan restart dev server.

## 3. Konvensi kode

### Export dan struktur file

- Layar memakai default export: `export default function XScreen({ ... }: XScreenProps)`, dengan `interface XScreenProps` di atas komponen (`src/screens/StaffUploadScreen.tsx`).
- Komponen bersama memakai named export: `SharedUI.tsx` dan `LayoutShell.tsx` (`src/components/LayoutShell.tsx:63`, `src/components/SharedUI.tsx:143`).
- Props callback diberi prefix `on`, misalnya `onNavigate`, `onApproveItem`.
- Impor relatif (`'../types'`, `'../components/SharedUI'`). Alias `@` tersedia tetapi tidak dipakai.
- Satu file per layar di `src/screens/`; jangan menambah folder layar baru tanpa alasan kuat.

### Gaya penulisan

- Kutip tunggal dan titik koma. Indentasi 2 spasi.
- String yang mengandung apostrof memakai kutip ganda, misalnya `"We're hiring: UI/UX Designer"`. Di teks JSX, gunakan `&apos;`. Apostrof tanpa escape di string berkutip tunggal merusak build.
- Teks waktu bersifat relatif (`'Just now'`), bukan objek `Date`. Tanggal "hari ini" dalam demo adalah Rabu 14 Oct 2026.
- Tombol memakai `type="button"`, `cursor-pointer`, dan tinggi sekitar 44px. State nonaktif memakai `disabled:opacity-40 disabled:pointer-events-none`.
- Ikon memakai `lucide-react` v1, yang tidak punya ikon brand. Instagram dan LinkedIn diimpor dari `SharedUI`; TikTok memakai ikon `Video`.

### State dan data

- Update state selalu immutable: `setX((prev) => prev.map(...))`, atau `[newItem, ...prev]` untuk menambah di depan.
- State lintas-layar hanya boleh berada di `src/App.tsx`. Layar di-unmount saat navigasi, jadi state lokal (filter, halaman, toast, banner) ikut hilang.
- Toast memakai `useState` lokal dan hilang lewat `setTimeout` 3000–3500 ms.
- Daftar dengan pencarian memakai `useState` untuk search, filter, dan `currentPage`; data dihitung dengan `useMemo`; `pageSize` lokal per layar.
- Setiap perubahan filter wajib memanggil `setCurrentPage(1)` karena `PaginationBar` tidak membatasi halaman.

### Yang disengaja

- Tulisan **"Aplly now"** di `PosterGraphic` dan data demo adalah inti demo "Typo detected → Fixed". Jangan perbaiki.
- Placeholder `[CITY]` dan `[DEADLINE]` harus tetap ada.
- Label "Gemini" dan "Brand Guardian" adalah simulasi. Jangan menambahkan panggilan API sungguhan.
- Id `SUB-1042` dan `CAL-09` dipakai alur demo. Mengganti namanya merusak alur tanpa error tipe.

## 4. Menambah layar

Menambah layar menyentuh lima tempat di tiga file:

1. Tambahkan literal baru ke union `ScreenId` di `src/types.ts:3`.
2. Tambahkan entri di `SCREEN_BREADCRUMBS` (`src/components/LayoutShell.tsx:47`). Objek ini bertipe `Record<ScreenId, ...>`, jadi `tsc` akan gagal jika ada layar yang terlewat.
3. Tambahkan entri di `ALL_SCREENS_LIST` (`src/components/LayoutShell.tsx:63`) agar layar muncul di jumper "All 13 screens".
4. Tambahkan item menu di `roleMenus` (`src/components/LayoutShell.tsx:99`) untuk role yang berhak.
5. Tambahkan blok render di `src/App.tsx` (pola `currentScreen === '...' && <Screen />`, mulai `src/App.tsx:288`).

Setelah itu, buat file layar di `src/screens/` dengan default export, lalu tambahkan handler dan state yang dibutuhkan di `App.tsx`. Jika layar hanya dicapai lewat alur (seperti `staff-platforms`), jangan masukkan ke `roleMenus`.

## 5. Menambah status queue

Status antrean saat ini hanya `'Submitted' | 'In review' | 'Revision'` (`src/types.ts:45`). Untuk menambah status seperti Approved atau Rejected, sentuh empat tempat:

1. Union `QueueItem.status` di `src/types.ts:45`.
2. Union parameter `handleUpdateQueueItemStatus` di `src/App.tsx:176`.
3. Union dan filter status di `src/screens/HeadReviewQueueScreen.tsx:29`.
4. Map `styles` di `StatusChip` (`src/components/SharedUI.tsx:143`). Status yang tidak dikenal jatuh ke gaya Draft, tetapi teksnya tetap tampil.

Periksa juga `handleApproveItem` dan `handleRejectItem` di `src/App.tsx:188` agar perilakunya sesuai status baru.

## 6. Menambah tema poster

Tema poster adalah union `posterTheme` di `src/types.ts:53` dan map `themeConfigs` di `src/components/SharedUI.tsx:366`.

1. Tambahkan literal ke union `posterTheme`.
2. Tambahkan konfigurasi tema di `themeConfigs`.
3. Pastikan `PosterGraphic` masih memakai fallback `themeConfigs.product` (`src/components/SharedUI.tsx:414`) untuk tema yang tidak dikenal.

Jika salah satu langkah terlewat, poster diam-diam jatuh ke tema `product` tanpa error tipe.

## 7. Aturan commit

Gunakan [Conventional Commits](https://www.conventionalcommits.org/) dengan scope yang sesuai area aplikasi. Satu commit berisi satu perubahan logis.

```text
feat(staff): tambah tab Drafts di My submissions
fix(head): hentikan approve ganda pada SUB-1042
fix(admin): pertahankan karakter # pada ekspor CSV
refactor(shared): satukan gaya StatusChip di SharedUI
docs(readme): lengkapi quick start dan peta layar
chore: perbarui .mise.toml ke pnpm 10.34.3
```

Ketentuan:

- Subjek memakai kalimat perintah, tanpa titik di akhir, maksimal sekitar 72 karakter.
- Jelaskan alasan perubahan di badan commit jika tidak terlihat dari diff.
- Jangan mencampur perubahan format menyeluruh dengan perubahan perilaku.
- Jangan menyertakan `node_modules/`, `dist/`, atau file hasil generate.

## 8. Branch dan pull request

1. Buat branch dari `main` dengan nama `feat/<scope>-<ringkas>`, `fix/<scope>-<ringkas>`, atau `docs/<ringkas>`.
2. Kerjakan satu tujuan per branch. Hindari refactor di luar lingkup.
3. Jalankan gate verifikasi sebelum membuka PR.
4. Buka PR ke `main` dengan judul bergaya Conventional Commits dan deskripsi berisi: masalah, perubahan, cara verifikasi, serta layar yang terpengaruh.
5. Jika UI berubah, sertakan tangkapan layar. Simpan aset di `docs/assets/screenshots/` bila memang akan dipakai dokumentasi.
6. Jangan force-push ke branch yang sedang ditinjau. Tanggapi review dengan commit tambahan, lalu rapikan bila disetujui.
7. Jangan menandai PR selesai sebelum `tsc` dan `pnpm build` hijau.

## 9. Checklist PR

- [ ] `pnpm exec tsc --noEmit -p .` menghasilkan 0 error.
- [ ] `pnpm build` sukses.
- [ ] Tidak menjalankan `pnpm format`, `oxfmt`, atau formatter lain.
- [ ] Tidak menambah dependency, router, state library, atau test runner.
- [ ] Tidak mengedit `vite.config.ts`, `.mise.toml`, `.gitignore`, `.gitattributes`, atau slot `<!-- figma:* -->`.
- [ ] Perubahan state tetap immutable dan state lintas-layar berada di `App.tsx`.
- [ ] String "Aplly", placeholder `[CITY]`/`[DEADLINE]`, dan id `SUB-1042`/`CAL-09` tidak berubah.
- [ ] Layar baru sudah terdaftar di `ScreenId`, `SCREEN_BREADCRUMBS`, `ALL_SCREENS_LIST`, `roleMenus`, dan blok render `App.tsx`.
- [ ] Status queue atau tema poster baru sudah lengkap di semua union dan map terkait.
- [ ] Dokumentasi yang terdampak diperbarui, termasuk [README.md](README.md) bila peta layar berubah.
- [ ] Tidak ada kredensial, data pribadi, atau aset berhak cipta yang ikut ter-commit.
- [ ] Deskripsi PR menyebutkan cara verifikasi dan layar yang terpengaruh.

## Lihat juga

- [README.md](README.md)
- [AGENTS.md](AGENTS.md)
- [Panduan pengembangan](docs/panduan-pengembangan.md)
- [Arsitektur](docs/arsitektur.md)
- [Status dan rencana](docs/status-dan-rencana.md)
