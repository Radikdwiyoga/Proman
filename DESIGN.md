---
name: Proman AI - Modern Forest & Cyber-Precision
colors:
  # Primary Brand Palette (Deep Forest Green & Emerald Accents)
  forest-deep: '#0F261C'
  forest-main: '#163628'
  forest-light: '#1B4332'
  forest-subtle: '#245640'
  forest-accent: '#FEE36E'
  forest-accent-hover: '#FCD34D'
  
  # Light Mode Surfaces (Clean Warm Neutral)
  light-canvas: '#F4F6F4'
  light-surface: '#FFFFFF'
  light-surface-subtle: '#F8FAF8'
  light-border: '#E2E8F0'
  light-border-subtle: '#EEF2F6'
  light-text-primary: '#0F172A'
  light-text-secondary: '#475569'
  light-text-muted: '#94A3B8'
  
  # Dark Mode Surfaces (Deep Carbon & Slate)
  dark-canvas: '#0D1117'
  dark-surface: '#161B22'
  dark-surface-elevated: '#1F242C'
  dark-border: '#30363D'
  dark-border-subtle: 'rgba(255, 255, 255, 0.08)'
  dark-text-primary: '#F0F6FC'
  dark-text-secondary: '#8B949E'
  dark-text-muted: '#6E7681'
  
  # Signals & Statuses
  primary-emerald: '#10B981'
  primary-emerald-hover: '#34D399'
  primary-emerald-glow: 'rgba(16, 185, 129, 0.3)'
  warning-amber: '#F59E0B'
  danger-crimson: '#EF4444'
  info-sky: '#0EA5E9'
  purple-accent: '#8B5CF6'

typography:
  primaryFontFamily: "Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  codeFontFamily: "'JetBrains Mono', Consolas, Monaco, monospace"
---

# Proman AI — Design System & UI Specifications

> **Status:** Aktif & Terverifikasi dengan Implementasi Terkini  
> **Versi:** 2.2.0 (Post-Redesign)  
> **Target Audiens:** Enterprise Project Managers, Engineering Leads, Super Admin & Member Standar  

---

## 1. Brand Identity & Visual Philosophy

**Proman AI** memadukan estetika **Modern Corporate Productivity** dengan sentuhan **Deep Forest Green** dan **Signal Emerald Precision**. Filosofi visual ini dirancang untuk menghadirkan kenyamanan visual maksimal bagi pengguna yang bekerja intensif seharian, sekaligus mempertahankan ketegasan data manajerial tingkat enterprise.

### Prinsip Desain Utama:
1. **Zero Clutter & Universal Utility:** Antarmuka bersih, bebas dari terminologi yang terikat pada niche tertentu. Aplikasi dirancang serbaguna (*general-purpose*) untuk bidang teknologi, manufaktur, operasional, korporasi, hingga tim kreatif.
2. **Deep Forest & Warm Accent:** Warna identitas utama menggunakan kombinasi hijau hutan mendalam (*Deep Forest Green* `#163628`) berpadu dengan aksen emas/kuning hangat (*Warm Accent* `#FEE36E`) untuk elemen pemicu tindakan primer (*Call-to-Action*), serta *Signal Emerald* (`#10B981`) untuk status sehat dan kecerdasan AI.
3. **Dual Theme Harmony:** Dukungan penuh untuk **Light Mode** (segar, hangat, bersih) dan **Dark Mode** (kontras tinggi, tidak membuat mata lelah, tidak ada teks redup atau terpotong pada dropdown).
4. **Full-Width Workspace Canvas:** Menghilangkan margin dan sudut melengkung berlebihan di pinggiran layout utama sehingga tabel, kalender, dan board memanfaatkan 100% ruang pandang layar.

---

## 2. Palet Warna & Token Visual

### 2.1 Brand & Accent
* **Deep Forest Green (`#163628` / `#0F261C`):** Digunakan untuk sidebar brand, kartu selamat datang, banner login, dan aksen navigasi utama.
* **Warm Yellow / Accent Gold (`#FEE36E`, hover `#FCD34D`):** Digunakan untuk tombol utama seperti `+ Create Event` pada Kalender, pill status khusus, dan highlight interaktif. Teks di atas warna ini selalu menggunakan warna gelap kontras (`#163628`).
* **Signal Emerald (`#10B981` / `#059669`):** Merepresentasikan kesehatan proyek optimal, eksekusi AI yang sukses, indikator sinkronisasi real-time, dan status *Done*.

### 2.2 Tema Terang (Light Mode)
* **Background Utama:** `#F4F6F4` / `#F8FAF8` (nuansa hangat lembut, menghindari warna putih murni yang menyilaukan mata).
* **Container & Card:** `#FFFFFF` dengan garis tepi halus (`#E2E8F0`).
* **Teks Primer:** `#0F172A` (Slate 900) untuk keterbacaan optimal.
* **Teks Sekunder:** `#475569` (Slate 600) untuk label dan metadata.

### 2.3 Tema Gelap (Dark Mode)
* **Background Utama:** `#0D1117` (Deep Slate Carbon).
* **Surface Panel & Kartu:** `#161B22` / `#1F242C`.
* **Border & Separator:** `#30363D` dan `rgba(255, 255, 255, 0.08)`.
* **Teks Primer:** `#F0F6FC` (High-readability bright slate).
* **Dropdowns & Form Controls:** Menggunakan background terdefinisi tegas (`#161B22` / `#1E293B`) dengan warna teks `#F0F6FC` dan option hover states untuk mencegah isu teks tidak terbaca (dark-on-dark).

---

## 3. Tipografi

Sistem tipografi aplikasi menggunakan font standar **Arial** sebagai font utama keluarga antarmuka (dengan fallback ke `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`), dipadukan dengan **JetBrains Mono** untuk data teknis, estimasi numerik, dan status badge.

| Elemen | Font Family | Ukuran / Bobot | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Headline XL** | Arial | 32px – 40px / Bold (700) | Judul halaman landing, welcome header |
| **Headline LG** | Arial | 24px – 28px / SemiBold (600) | Judul modal besar, view header |
| **Headline MD** | Arial | 18px – 20px / SemiBold (600) | Header kolom board, judul kartu KPI |
| **Body LG / MD** | Arial | 14px – 16px / Regular (400) | Teks deskripsi tugas, komentar, formulir |
| **Body SM / XS** | Arial | 12px – 13px / Regular & Medium | Sub-tugas checklist, label input, metadata |
| **Code / Metrics** | JetBrains Mono | 11px – 13px / Medium (500) | Jam estimasi, ID tugas, timestamp, badge |

---

## 4. Arsitektur Komponen Antarmuka Utama

### 4.1 Halaman Autentikasi (Split Login & Auth Hub)
* **Layout:** Dua kolom (Split Screen).
  * **Kolom Kiri (Brand Showcase):** Berlatar belakang *Forest Green* mendalam dengan pola geometri halus, logo resmi Proman AI, statistik enterprise, kutipan testimoni, dan kartu ringkasan efisiensi tim.
  * **Kolom Kanan (Interactive Card):** Panel autentikasi modern dengan tab navigasi cepat: **Masuk (Sign In)**, **Daftar Akun Baru (Register)**, dan **Lupa Password**.
* **Quick Demo Credentials:** Tombol pill 1-klik untuk login cepat sebagai **Super Admin** atau **Member Standar** untuk memudahkan demonstrasi dan pengujian sistem.
* **Keamanan Input:** Indikator kekuatan kata sandi (*Password Strength Meter*), toggle visibilitas kata sandi, dan penanganan status akun (*Active*, *Pending*, *Rejected*).

### 4.2 Papan Kanban & Quick Add Task
* **Full-Canvas Layout:** Papan Kanban membentang penuh (*edge-to-edge*) tanpa pembatasan sudut melengkung berlebih di sisi luar layar, memaksimalkan visibilitas 5 kolom (`Backlog`, `To Do`, `In Progress`, `Review`, `Done`).
* **Context-Aware Quick Add:** Tombol "+ Tambah Cepat" pada setiap kolom secara otomatis menginisiasi pembuatan tugas dengan status awal yang sesuai dengan kolom yang diklik (misalnya: klik di *In Progress* langsung membuka modal dengan status *In Progress*).
* **Kartu Tugas:** Menampilkan chip prioritas (Urgent, High, Medium, Low), avatar assignee ganda, indikator deadline/overdue, progress sub-tugas checklist, dan badge AI Risk bila terdeteksi keterlambatan.

### 4.3 Schedule & Calendar View (Modern Dual-Panel Architecture)
* **Top Bar Controls:**
  * Navigasi bulan (Previous, Next, Today).
  * Tampilan toggle mode (**Bulan / Month** dan **Minggu / Week**).
  * Filter status interaktif (Semua, To Do, In Progress, Review, Done).
  * Tombol CTA Menonjol: **`+ Create Event`** dalam format pill kuning hangat (`#FEE36E`).
* **Split View Layout:**
  * **Panel Kiri (Side Widget):** Mini kalender bulan interaktif untuk navigasi tanggal cepat, kartu agenda tugas hari ini (*Today's Tasks*), dan kartu ringkasan metrik jadwal.
  * **Panel Kanan (Main Work Area):**
    * **Weekly Time Grid:** Grid waktu 8 kolom (label jam 08:00 – 18:00 di sebelah kiri dan 7 kolom hari kerja di sebelah kanan). Tugas ditampilkan sebagai blok waktu berwarna interaktif dengan badge prioritas dan avatar.
    * **Monthly Grid:** Tampilan kalender penuh 35/42 slot dengan kartu tugas di setiap tanggal dan indikator "Hari Ini".

### 4.4 AI Task Breakdown & Asisten Cerdas (Universal Engine)
* **Universal Prompt Input:** Area masukan prompt tanpa batasan bidang (misal: "Pengembangan arsitektur backend", "Peluncuran inisiatif regional", "Pembaruan infrastruktur cloud").
* **Saran Contoh Dinamis:** Contoh prompt yang universal, relevan, dan terbebas dari contoh kaku.
* **1-Click Generation & Assignment:** AI membagi inisiatif menjadi sub-tugas dengan estimasi jam, tingkat prioritas, dan rekomendasi assignee berdasarkan beban kerja riil tim saat ini.

### 4.5 Manajemen Pengguna & Matriks Hak Akses (RBAC)
* **Struktur Peran 2-Tier:**
  * 👑 **Super Admin:** Akses penuh konfigurasi sistem, manajemen pengguna, persetujuan akun pendaftar baru, pengaturan API key AI, dan log audit.
  * 👤 **Member Standar:** Pengguna operasional untuk membuat/mengelola tugas, berkolaborasi di board, kalender, dan menggunakan AI Copilot.
* **Tabel Matriks Kebijakan:** Kartu panduan visual di Admin Settings yang merinci izin akses Super Admin vs Member Standar secara transparan.

### 4.6 Sistem Internasionalisasi & Bilingual (ID/EN)
* **Dukungan 2 Bahasa Utama:** Bahasa Indonesia (`id`) sebagai bahasa *default* dan Bahasa Inggris (`en`).
* **Peralihan Cepat (Language Switcher):**
  * **Halaman Login & Register:** Tombol pill toggle bendera (`🇮🇩 ID` / `🇬🇧 EN`) di sudut kanan atas kartu autentikasi.
  * **Navbar Utama:** Tombol pill ikon bola dunia (`Globe2`) di samping pengalih tema gelap/terang.
  * **Profil Pengguna (Sidebar):** Opsi pemilihan bahasa di dalam pop-up menu profil dan mode mini bar.
* **Penyimpanan Status:** Preferensi bahasa tersimpan permanen di `localStorage` (`proman_selected_language`).

---

## 5. Responsivitas & Aksesibilitas (a11y)

1. **Mobile Drawer Navigation:** Sidebar dapat disembunyikan (*auto-hide*) dan beralih ke drawer geser saat dibuka di perangkat mobile (< 768px).
2. **Kontras Warna WCAG 2.1 AA:** Seluruh kombinasi warna teks dan latar belakang (termasuk tombol kuning berteks gelap `#163628`) memenuhi standar kontras minimal 4.5:1.
3. **Form Focus & State Feedback:** Semua input teks, select dropdown, dan checkbox memiliki *ring focus* warna emerald yang jelas (`#10B981`) dan animasi transisi halus (150ms).