@AGENTS.md

# GasKeun — aturan kerja agen

Analisis lengkap: `docs/ANALISIS_PROYEK.md` · Tugas: `docs/BACKLOG_HAIKU.md` · Semua temuan: `docs/TEMUAN_LENGKAP.md`.
Baca §4 (aliran data) dan §6 (jebakan) di ANALISIS_PROYEK sebelum mengedit kode.

- Verifikasi setiap perubahan: `pnpm exec tsc --noEmit -p .` (wajib 0 error; `vite build` tidak type-check), lalu `pnpm build`.
- JANGAN jalankan `pnpm format` / `oxfmt` / `.figma/make/format` (menulis ulang semua file).
- JANGAN edit `vite.config.ts`, `.figma/make/*` (kecuali `site.json`), `.mise.toml`, atau slot `<!-- figma:* -->` di index.html. JANGAN tambah dependency.
- Semua state lintas-layar ada di `src/App.tsx` (handler `handleX` → prop `onX`); tidak ada router — layar unmount saat navigasi.
- "Aplly" di PosterGraphic dan placeholder `[CITY]`/`[DEADLINE]` itu DISENGAJA — jangan diperbaiki.
- Ikon Instagram/Linkedin dari `src/components/SharedUI` (lucide v1 tak punya ikon brand). SharedUI & LayoutShell = named export; layar = default export.
- Id ajaib `'SUB-1042'` dan `'CAL-09'` dipakai alur demo — jangan di-rename.
- Kelas `.gaskeun-*` (index.css) mengalahkan utility Tailwind pada elemen yang sama sampai dipindah ke `@layer components`.
- Impor relatif (`'../types'`), kutip tunggal, titik koma, 2 spasi; string berapostrof pakai kutip ganda.
- Hanya ubah file yang tercantum di tugas. Agen paralel tidak boleh menyentuh file yang sama (folder ini belum repo git).
