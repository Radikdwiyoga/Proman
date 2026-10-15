# Product Requirement Document (PRD): ProMan-AI

> **Status Dokumen:** Aktif — Diselaraskan dengan implementasi dan pembaruan sistem terkini.  
> **Versi Dokumen:** 2.2.0  
> **Tanggal Pembaruan:** 15 Oktober 2026  

---

## 1. Ringkasan Eksekutif

**ProMan-AI** adalah platform manajemen proyek modern enterprise berbasis web yang beroperasi secara *real-time* di atas ekosistem **Firebase (Firestore, Authentication, Hosting, dan Cloud Functions)** dengan integrasi kecerdasan buatan (*AI-native*) langsung pada alur kerja tim. Aplikasi ini mengotomatisasi pekerjaan administratif rutin (pemecahan inisiatif kerja, estimasi jam kerja, perumusan ringkasan status berkala), mendeteksi potensi risiko keterlambatan proyek secara prediktif, serta memberikan rekomendasi alokasi beban kerja yang seimbang bagi seluruh anggota tim.

Saat ini ProMan-AI telah beroperasi penuh dengan fitur utama mencakup:
*   **Multi-View Project Workspace:** Papan Kanban interaktif dengan drag & drop dan *context-aware quick add*, Timeline/Gantt Chart dengan indikator risiko AI, Kalender Kerja Modern dengan *Weekly Time Grid* dan *Mini-Calendar*, serta Daftar & Tabel tugas yang dapat disortir.
*   **Universal AI Engine:** Didukung oleh arsitektur *multi-LLM provider* berantai (**Groq** → **OpenRouter** → **ProMan Local Heuristic Simulator**) yang menjamin fitur AI selalu aktif, cepat, dan mandiri tanpa ketergantungan mutlak pada API key eksternal.
*   **2-Tier Role-Based Access Control (RBAC):** Sistem otorisasi sederhana, terstruktur, dan tegas yang membagi pengguna ke dalam peran **Super Admin** dan **Member Standar**.
*   **Modern Executive Design & Dual Theme:** Mengusung identitas visual *Deep Forest Green & Signal Emerald*, tipografi universal Arial, kontras tinggi di tema gelap (*dark mode*), serta halaman login *split-screen* modern.
*   **Notifikasi Multi-Saluran:** Integrasi otomatis ke **Telegram Bot** (client-side) dan **Email via Cloud Functions** (Nodemailer/SMTP) lengkap dengan pengingat tenggat harian.

---

## 2. Visi & Tujuan Produk

*   **Visi:** Menjadi asisten manajerial proyek paling adaptif, presisi, dan mudah digunakan yang membebaskan tim profesional dari friksi administratif.
*   **Tujuan Bisnis:**
    *   Mencapai efisiensi waktu hingga 45% dalam proses perencanaan inisiatif dan pembuatan laporan eksekutif melalui bantuan AI.
    *   Menghadirkan platform manajemen proyek universal yang relevan untuk tim teknologi, operasional bisnis, manufaktur, korporasi, hingga agensi kreatif.
    *   Mempertahankan tingkat kepuasan pengguna (*user satisfaction*) di atas 90% dengan antarmuka yang bersih, intuitif, dan bebas gangguan.
*   **Tujuan Pengguna:**
    *   Mencegah kelelahan kerja (*burnout*) melalui pemantauan kapasitas dan pemerataan beban kerja tim.
    *   Mendeteksi *bottleneck* lebih awal dengan dashboard risiko prediktif sebelum proyek mengalami keterlambatan nyata.
    *   Menjaga fokus kerja harian dengan jadwal kerja berbasis blok waktu (*Weekly Time Grid*).

---

## 3. Sistem Peran & Aksesibilitas (2-Tier RBAC)

Sistem menyederhanakan pengelolaan hak akses pengguna ke dalam **2 tingkatan peran resmi**:

```
                  ┌─────────────────────────────────────────┐
                  │          PROMAN AI RBAC MODEL           │
                  └────────────────────┬────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│         SUPER ADMIN           │             │        MEMBER STANDAR         │
├───────────────────────────────┤             ├───────────────────────────────┤
│ • Full System Configuration   │             │ • Project Management & Tasks  │
│ • User Management & Approvals │             │ • Kanban, Timeline, Calendar  │
│ • Password Reset & Security   │             │ • AI Task Breakdown & Copilot │
│ • AI Engine & Zero-Retention  │             │ • Subtask & Progress Updates  │
│ • Audit Logs & System Telemetry│            │ • Commenting & Collaboration  │
└───────────────────────────────┘             └───────────────────────────────┘
```

### Matriks Kebijakan Hak Akses (Access Control Matrix)

| Fitur / Tindakan | Super Admin | Member Standar | Catatan Kebijakan |
| :--- | :---: | :---: | :--- |
| **Persetujuan Pendaftar Baru (Pending)** | ✅ Ya | ❌ Tidak | Khusus Super Admin untuk keamanan organisasi |
| **Manajemen Pengguna (CRUD & Ubah Role)** | ✅ Ya | ❌ Tidak | Dikelola melalui tab Manajemen Pengguna di Admin Settings |
| **Konfigurasi AI Provider & Zero-Retention** | ✅ Ya | ❌ Tidak | Pengaturan API Key Groq/OpenRouter & privasi data |
| **Meninjau Riwayat Audit Log Sistem** | ✅ Ya | ❌ Tidak | Pemantauan aktivitas dan log keamanan aplikasi |
| **Pembuatan & Pengaturan Proyek Baru** | ✅ Ya | ✅ Ya | Kolaborasi terbuka untuk inisiatif baru |
| **Manajemen Tugas (Buat, Edit, Pindah, Hapus)** | ✅ Ya | ✅ Ya | Hak penuh dalam papan kerja operasional |
| **Penggunaan AI Breakdown & Copilot Assistant**| ✅ Ya | ✅ Ya | Tersedia untuk seluruh anggota tim |
| **Akses Schedule & Kalender Kerja** | ✅ Ya | ✅ Ya | Visibilitas jadwal dan blok waktu kegiatan |
| **Pengaturan Profil Pribadi & Password** | ✅ Ya | ✅ Ya | Setiap pengguna berhak memperbarui profilnya |

---

## 4. Fitur Utama & Rincian Fungsionalitas

### A. Autentikasi & Manajemen Akun

*   **Modern Split-Screen Login Page:**
    *   Sisi kiri menampilkan kartu visual *Deep Forest Green* dengan logo resmi Proman AI, metrik efisiensi proyek, testimoni manajerial, dan penegasan privasi *Zero-Retention*.
    *   Sisi kanan menyediakan tab navigasi cepat untuk **Masuk**, **Daftar Akun Baru**, dan **Lupa Password**.
    *   **Demo Quick-Fill:** Tombol pill 1-klik untuk masuk sebagai akun demo **Super Admin** atau **Member Standar**.
*   **Registrasi & Alur Verifikasi Akun:** Pengguna baru dapat mendaftar mandiri. Akun baru masuk ke antrean **Pending** dan membutuhkan persetujuan Super Admin sebelum dapat mengakses sistem.
*   **Keamanan & Sesi:** 
    *   Auto-logout saat sesi idle mencapai **10 menit** guna melindungi data sensitif di lingkungan bersama.
    *   *Password strength meter* (Lemah, Cukup, Kuat, Sangat Kuat).
    *   Pembaruan password langsung dengan re-autentikasi Firebase dan sinkronisasi Firestore.

### B. Workspace Proyek & Multi-View

1.  **Papan Kanban (Full-Width Canvas):**
    *   5 kolom alur kerja: `Backlog → To Do → In Progress → Review → Done`.
    *   **Context-Aware Quick Add:** Mengklik tombol "+ Tambah Cepat" pada kolom tertentu langsung mengisi status awal tugas sesuai kolom tersebut (misal: klik di kolom *In Progress* langsung membuka modal dengan status *In Progress*).
    *   Desain *full-canvas* tanpa border sudut melengkung berlebihan di pinggiran luar, memaksimalkan area kerja.
    *   Dukungan *drag & drop* lancar, tag prioritas, multi-assignee, indikator risiko keterlambatan AI, dan checklist sub-tugas.

2.  **Modern Schedule & Calendar View:**
    *   **Top Bar:** Pemilih navigasi bulan/hari ini, filter status tugas, serta tombol aksi primer **`+ Create Event`** berbentuk pill kuning hangat (`#FEE36E`).
    *   **Panel Kiri:** Mini kalender interaktif untuk lompat tanggal cepat, daftar agenda tugas hari ini (*Today's Agenda*), dan kartu ringkasan jadwal.
    *   **Panel Kanan (Main Work Area):**
        *   **Weekly Time Grid:** Tampilan grid waktu 8 kolom (08:00 – 18:00) yang memetakan tugas ke blok waktu harian berdasarkan rentang jam kerja.
        *   **Monthly Calendar Grid:** Tampilan kalender bulanan penuh dengan kartu tugas ringkas di setiap sel tanggal.

3.  **Timeline & Gantt Chart:**
    *   Pemetaan jadwal dengan skala zoom Harian dan Mingguan.
    *   Highlight penanda garis waktu "Hari Ini" (*Current Day Marker*).
    *   Peringatan risiko delay otomatis pada bar Gantt tugas yang terancam meleset dari target.

4.  **Daftar & Tabel:**
    *   Tabel terstruktur dengan pengurutan kolom dinamis (judul, status, prioritas, penanggung jawab, tenggat).

5.  **Global Board ("Semua Project"):**
    *   Tampilan portofolio lintas proyek yang menampilkan metrik *Global Health Score* dan pemfilteran cepat (Tugas Saya, Prioritas Urgent, berdasarkan proyek).

### C. Universal AI Engine (USP)

Sistem AI beroperasi dengan pendekatan **multi-LLM berantai**: **Groq** (`openai/gpt-oss-120b`) → **OpenRouter** (model gratis/hemat) → **ProMan Local Heuristic Simulator**.

1.  **Universal AI Task Breakdown:**
    *   Menerima prompt inisiatif dalam bahasa alami tanpa terbatas pada domain spesifik.
    *   Secara otomatis memecah inisiatif menjadi 4–6 sub-tugas terstruktur, menentukan perkiraan waktu, tingkat prioritas, kategori pekerjaan, dan merekomendasikan assignee dengan beban kerja terendah.
    *   Hasil dapat langsung dimasukkan ke papan proyek dengan 1 klik.
2.  **AI Smart Estimator & Auto Due-Date:**
    *   Menganalisis deskripsi dan kompleksitas tugas untuk memberikan estimasi jam kerja yang realistis dan saran tanggal jatuh tempo (memperhitungkan jam kerja harian dan hari libur).
3.  **AI Technical Solution & Troubleshooting Advisor:**
    *   Memberikan rekomendasi diagnosis, langkah penyelesaian masalah, serta checklist teknis yang dapat langsung disematkan ke sub-tugas atau kolom komentar.
4.  **Predictive Risk & Delay Analysis Dashboard:**
    *   Menghitung skor kesehatan proyek (0–100) dan probabilitas keterlambatan.
    *   Menyediakan tombol mitigasi 1-klik (*Alihkan tugas*, *Pecah tugas*, *Beri buffer waktu*).
5.  **Smart Resource Allocation & Workload Planner:**
    *   Memantau kapasitas jam kerja mingguan per anggota tim untuk mendeteksi beban berlebih (*overload > 100%*) dan risiko *burnout*.
6.  **Auto-Status Summarization:**
    *   Menghasilkan laporan eksekutif komprehensif dalam hitungan detik.
    *   Mendukung ekspor langsung ke format Teks (`.txt`), cetak/unduh **PDF**, atau salin ke *clipboard*.
7.  **Project Copilot (Interactive AI Assistant):**
    *   Asisten chat cerdas yang memahami konteks seluruh data proyek secara real-time untuk menjawab pertanyaan tim, memberikan panduan, dan mengeksekusi tautan aksi langsung.

### D. Notifikasi & Kolaborasi

*   **Telegram Bot Integration:** Notifikasi real-time saat pembuatan tugas, perpindahan status, pembaruan rincian tugas, dan penambahan komentar.
*   **Email Notification (Cloud Functions):** Pengiriman email otomatis saat tugas di-assign, diperbarui, serta pengingat harian (*daily digest*) pukul 08:00 WIB untuk tugas yang mendekati deadline (≤ 2 hari).
*   **Ruang Komentar Tugas:** Riwayat diskusi kontekstual per tugas dengan catatan waktu dan identitas penulis.

### E. Tata Kelola & Pengaturan (Admin Settings)

*   **Informasi Organisasi:** Pengaturan nama perusahaan dan zona waktu operasional.
*   **AI Engine & Zero-Retention:** Konfigurasi API Key serta penegasan bahwa data proyek tidak pernah disimpan atau digunakan untuk melatih model AI publik.
*   **Manajemen Pengguna & RBAC:** Antrean persetujuan pendaftar baru, pengubahan role (Super Admin vs Member Standar), penyesuaian kapasitas jam kerja, serta visualisasi matriks kebijakan hak akses.
*   **Audit Log:** Catatan kronologis seluruh aksi penting di dalam aplikasi untuk kebutuhan audit transparansi dan keamanan.

---

## 5. Kebutuhan Non-Fungsional & Kualitas Sistem

| Parameter | Target & Spesifikasi | Status Implementasi |
| :--- | :--- | :---: |
| **Sinkronisasi Real-Time** | Firestore real-time listener dengan target latensi update ≤ 240ms | ✅ Aktif |
| **Ketahanan AI (Resilience)** | Fallback berantai 3 tingkat menjamin 100% waktu aktif fitur AI | ✅ Aktif |
| **Privasi Data AI** | Mode *Zero-Retention* aktif secara baku tanpa opsi opt-out | ✅ Aktif |
| **Tipografi & Tampilan** | Font universal Arial, WCAG 2.1 AA contrast, perbaikan penuh kontras dropdown tema gelap | ✅ Aktif |
| **Keamanan Sesi** | Auto session timeout 10 menit inactivity | ✅ Aktif |
| **Responsivitas Perangkat** | Optimal di desktop (1440px+), tablet (768px–1439px), dan mobile (< 768px) dengan drawer navigasi | ✅ Aktif |
| **Arsitektur Kode & Build** | React 19 + TypeScript + Vite 6 + Tailwind CSS v4, kompilasi bebas error | ✅ Aktif |

---

## 6. Arsitektur Teknologi

```
┌────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (CLIENT SPA)                         │
│  React 19 • TypeScript • Vite 6 • Tailwind CSS v4 • Lucide Icons      │
│  UI: Split Auth • Kanban • Schedule/Time-Grid • Gantt • AI Dashboards │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND-AS-A-SERVICE                            │
│  Firebase Authentication (Session Management & Credentials)           │
│  Cloud Firestore (Real-time Snapshot Sync & Data Persistence)         │
│  Firebase Hosting (Global CDN Edge Deployment)                         │
│  Cloud Functions (Email via Nodemailer/SMTP + Scheduled Daily Digest) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         AI INFERENCE LAYER                             │
│  Tier 1: Groq API (High-speed OSS Models)                              │
│  Tier 2: OpenRouter API (Alternative Redundant Provider)               │
│  Tier 3: ProMan Local Heuristic Simulator (Deterministic Fallback)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Status Rilis & Roadmap

### ✅ Rilis Saat Ini (v2.2.0 - Stabil & Terintegrasi)
*   Sistem otorisasi disederhanakan ke **2-Tier RBAC** (Super Admin & Member Standar) lengkap dengan matriks kebijakan hak akses.
*   Pembaruan visual total: Logo resmi Proman AI, halaman login modern dengan demo quick-fill, layout papan Kanban *full-canvas*, dan fitur *Schedule/Calendar View* dengan *Weekly Time Grid* dan *Mini-Calendar*.
*   Penyempurnaan universal pada *AI Task Breakdown Engine* tanpa bias domain/industri tertentu.
*   Perbaikan kontras dropdown dan komponen interaktif pada tema gelap (*dark mode*).
*   Integrasi multi-saluran: Telegram Bot & Email Cloud Functions aktif.

### 🚀 Rencana Pengembangan Mendatang (Backlog)
*   **Cloud File Attachments:** Unggah dan simpan berkas lampiran tugas langsung ke Firebase Storage.
*   **Rich @Mention Notifications:** Notifikasi khusus saat anggota tim ditandai langsung di kolom komentar tugas.
*   **Integrasi Ekosistem Eksternal:** Webhook ke Slack, Microsoft Teams, dan GitHub commit syncing.
*   **Voice-to-Task Transcription:** Mengonversi rekaman suara atau rangkuman rapat menjadi sub-tugas proyek secara otomatis.