import { Task, User, Subtask, ExecutiveSummary, TaskEffortEstimation, AISolutionAdvice } from '../types';

// 0. AI Smart Task Estimator & Auto-Due Date Simulator
export function simulateTaskEffortEstimation(
  title: string,
  description: string,
  assigneeId: string,
  startDateStr: string,
  users: User[]
): TaskEffortEstimation {
  const text = `${title} ${description}`.toLowerCase();
  
  let hours = 8;
  let complexity: TaskEffortEstimation['complexityLevel'] = 'Sedang';
  let rationale = '';

  if (
    text.includes('arsitektur') || 
    text.includes('migrasi') || 
    text.includes('keamanan') || 
    text.includes('audit') || 
    text.includes('ekspansi') || 
    text.includes('cabang') ||
    text.includes('infrastruktur') ||
    text.includes('rekrutmen massal')
  ) {
    hours = 32;
    complexity = 'Sangat Kompleks';
    rationale = 'Tugas mencakup analisis arsitektur mendalam, koordinasi kepatuhan sistem, dan dependensi kritis lintas divisi.';
  } else if (
    text.includes('backend') || 
    text.includes('database') || 
    text.includes('integrasi') || 
    text.includes('api') || 
    text.includes('rekrutmen') || 
    text.includes('kampanye') ||
    text.includes('refactor') ||
    text.includes('auth')
  ) {
    hours = 16;
    complexity = 'Kompleks';
    rationale = 'Memerlukan perancangan skema data, pengujian integrasi endpoint, penanganan error, dan validasi fungsional menyeluruh.';
  } else if (
    text.includes('desain') || 
    text.includes('ui') || 
    text.includes('frontend') || 
    text.includes('sop') || 
    text.includes('notula') ||
    text.includes('landing page') ||
    text.includes('konten')
  ) {
    hours = 8;
    complexity = 'Sedang';
    rationale = 'Membutuhkan implementasi antarmuka, penyesuaian komponen responsif, uji tampilan, dan review aset grafis.';
  } else {
    hours = 4;
    complexity = 'Rendah';
    rationale = 'Pekerjaan operasional standar dengan ruang lingkup yang terdefinisi jelas dan risiko dependensi minimal.';
  }

  // Calculate realistic due date (assuming 6-8 working hours/day, skipping Sundays)
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const workDaysNeeded = Math.max(1, Math.ceil(hours / 6));
  const cur = new Date(start);
  let daysAdded = 0;
  while (daysAdded < workDaysNeeded) {
    cur.setDate(cur.getDate() + 1);
    // Skip Sunday (0)
    if (cur.getDay() !== 0) {
      daysAdded++;
    }
  }
  const suggestedDueDate = cur.toISOString().split('T')[0];

  const matchedAssignee = users.find(u => u.id === assigneeId) || users[0];

  return {
    estimatedHours: hours,
    complexityLevel: complexity,
    suggestedDueDate,
    recommendedAssigneeId: matchedAssignee?.id,
    rationale,
  };
}

// 0.5 AI Smart Troubleshooting & Solution Advisor Simulator
export function simulateAISolutionAdvice(task: Task, userQuestion?: string): AISolutionAdvice {
  const text = `${task.title} ${task.description} ${userQuestion || ''}`.toLowerCase();

  if (text.includes('auth') || text.includes('login') || text.includes('oauth') || text.includes('token') || text.includes('jwt') || text.includes('keamanan')) {
    return {
      id: `advice-${Date.now()}`,
      taskId: task.id,
      summaryDiagnosis: 'Modul Autentikasi & Otorisasi memerlukan kepatuhan standar keamanan token (JWT/OAuth2), penanganan status session expired, dan validasi role permission di sisi server.',
      actionSteps: [
        'Pastikan penyimpanan token menggunakan HttpOnly Cookie atau state memory yang aman dari serangan XSS.',
        'Implementasikan middleware verifikasi token pada setiap endpoint REST API / Firestore Security Rules.',
        'Sediakan mekanisme refresh token otomatis sebelum access token kedaluwarsa.',
        'Tambahkan logging audit untuk setiap percobaan login yang gagal atau aktivitas mencurigakan.'
      ],
      technicalTips: [
        'Gunakan library resmi seperti Firebase Auth SDK atau OAuth2 Provider standar.',
        'Hindari menyimpan data sensitif (password, secret key) di LocalStorage browser.',
        'Beri feedback error yang jelas bagi pengguna namun tidak membocorkan detail keamanan ke publik.'
      ],
      potentialPitfalls: [
        'Lupa menangani race condition saat multiple API request dikirim bersamaan dengan token expired.',
        'Tidak mencocokkan status verifikasi email/approval admin sebelum memberikan hak akses penuh.'
      ],
      suggestedNewSubtasks: [
        'Validasi format input email & kekuatan password di frontend & backend',
        'Uji coba skenario login token expired dan auto-logout',
        'Pengetesan hak akses role Super Admin vs Member Standar'
      ]
    };
  }

  if (text.includes('database') || text.includes('api') || text.includes('backend') || text.includes('server') || text.includes('endpoint')) {
    return {
      id: `advice-${Date.now()}`,
      taskId: task.id,
      summaryDiagnosis: 'Pembangunan API & Database membutuhkan arsitektur skema data yang efisien, indeks query optimal, dan penanganan exception terstruktur.',
      actionSteps: [
        'Rancang struktur payload request/response dengan validasi tipe data yang ketat.',
        'Tambahkan pagination dan filter query agar beban baca database tetap hemat & cepat.',
        'Gunakan blok Try-Catch terpusat dengan return status code HTTP yang standar (200, 400, 401, 404, 500).',
        'Lakukan pengujian endpoint menggunakan Postman / Automated Integration Tests.'
      ],
      technicalTips: [
        'Manfaatkan composite index di Firestore untuk query multidimensi.',
        'Gunakan asynchronous async/await untuk operasi I/O database.'
      ],
      potentialPitfalls: [
        'Query N+1 problem yang membebani kuota pembacaan database.',
        'Payload respon terlalu besar tanpa kompresi gzip.'
      ],
      suggestedNewSubtasks: [
        'Pembuatan skema validasi request schema',
        'Setup Firestore composite indexes',
        'Integration testing respon endpoint'
      ]
    };
  }

  if (text.includes('ui') || text.includes('frontend') || text.includes('desain') || text.includes('layout') || text.includes('mobile') || text.includes('responsif')) {
    return {
      id: `advice-${Date.now()}`,
      taskId: task.id,
      summaryDiagnosis: 'Pekerjaan Frontend UI menuntut konsistensi visual, adaptabilitas berbagai ukuran layar (Mobile / Desktop), serta interaksi pengguna yang intuitif.',
      actionSteps: [
        'Gunakan utility CSS Tailwind yang konsisten dengan palet warna tema (Dark/Light mode).',
        'Uji responsivitas pada viewport 360px (Mobile) hingga 1920px (Desktop Ultrawide).',
        'Sediakan indikator loading skeleton atau spinner saat data sedang diambil dari server.',
        'Pastikan elemen tombol dan input form memiliki area sentuh (touch target) minimal 44x44px di HP.'
      ],
      technicalTips: [
        'Gunakan flex-wrap dan overflow-x-auto untuk tabel dan tab navigasi panjang di HP.',
        'Manfaatkan Lucide React Icons untuk memperjelas aksi pengguna.'
      ],
      potentialPitfalls: [
        'Elemen fixed width (misal w-96) yang menyebabkan horizontal overflow/rusak di layar kecil.',
        'Kontras warna teks terlalu redup sehingga sulit dibaca di bawah sinar matahari.'
      ],
      suggestedNewSubtasks: [
        'Uji responsivitas di mode mobile device toolbar',
        'Pengecekan kontras warna tema terang dan gelap',
        'Validasi interaksi sentuh dan transisi animasi'
      ]
    };
  }

  // General Operations / Management Advice
  return {
    id: `advice-${Date.now()}`,
    taskId: task.id,
    summaryDiagnosis: 'Inisiatif operasional ini memerlukan koordinasi terpadu antar penanggung jawab, checklist SOP yang ketat, dan dokumentasi berkas yang transparan.',
    actionSteps: [
      'Identifikasi stakeholder utama dan buat matriks tanggung jawab (RACI).',
      'Susun timeline harian dengan batasan waktu yang terukur (Timeboxing).',
      'Lakukan sinkronisasi harian singkat (Daily Standup) untuk memantau kemajuan sub-tugas.',
      'Dokumentasikan seluruh kesepakatan dan hasil akhir dalam bentuk laporan resmi.'
    ],
    technicalTips: [
      'Lakukan koordinasi dengan rekan tim jika ada sub-pekerjaan baru yang perlu didelegasikan.',
      'Cantumkan lampiran dokumen atau bukti kerja pada tiket tugas.'
    ],
    potentialPitfalls: [
      'Kurang komunikasi antar tim yang menyebabkan duplikasi pekerjaan.',
      'Tidak menetapkan kriteria penerimaan hasil kerja (Acceptance Criteria) yang jelas sejak awal.'
    ],
    suggestedNewSubtasks: [
      'Koordinasi awal dengan PIC terkait',
      'Verifikasi kepatuhan checklist SOP',
      'Penyusunan laporan penyelesaian akhir'
    ]
  };
}

export function calculateUserWorkloads(users: User[], tasks: Task[]): User[] {
  return users.map(user => {
    const activeTasks = tasks.filter(t => t.status !== 'done' && (t.assigneeIds || []).includes(user.id));
    const totalHours = activeTasks.length * 8;

    return {
      ...user,
      allocatedHours: totalHours,
    };
  });
}

export interface ProjectRiskSummary {
  overallScore: number;
  status: 'healthy' | 'warning' | 'critical';
  atRiskTasksCount: number;
  overloadedMembersCount: number;
  totalDelayPredictedDays: number;
  keyInsights: string[];
  recommendations: {
    taskId: string;
    taskTitle: string;
    riskScore: number;
    reason: string;
    suggestion: string;
    actionType: string;
    targetAssigneeId?: string;
    suggestedBufferDays?: number;
    predictedDelayDays?: number;
    isOverdue?: boolean;
    overdueDays?: number;
  }[];
}

export function analyzeProjectRisks(tasks: Task[], users: User[]): ProjectRiskSummary {
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const userMap = new Map(users.map(u => [u.id, u]));
  
  const recommendations: ProjectRiskSummary['recommendations'] = [];
  let totalDelayDays = 0;
  let highRiskCount = 0;

  activeTasks.forEach(task => {
    let score = task.aiRisk?.riskScore || 0;
    let reason = task.aiRisk?.reason || '';
    let suggestion = task.aiRisk?.mitigationSuggestion || '';
    let delay = task.aiRisk?.predictedDelayDays || 0;

    // --- Overdue detection: detect tasks already past their dueDate ---
    let overdueDays = 0;
    let isOverdue = false;
    if (task.dueDate) {
      const today = new Date();
      const due = new Date(task.dueDate);
      if (due < today) {
        const msPerDay = 24 * 60 * 60 * 1000;
        overdueDays = Math.ceil((today.getTime() - due.getTime()) / msPerDay);
        if (overdueDays > 0) {
          isOverdue = true;
          delay = overdueDays;
          score = Math.max(score, 70);
          reason = `Tugas sudah melewati tenggat ${overdueDays} hari yang lalu.`;
          suggestion = `Segera pecahkan tugas ini menjadi sub-tugas yang lebih kecil dan realokasikan ke anggota tim dengan kapasitas tersedia.`;
        }
      }
    }

    if (!task.aiRisk && !isOverdue) {
      const primaryAssignee = userMap.get((task.assigneeIds || [])[0]);
      const isOverloaded = primaryAssignee && (primaryAssignee.allocatedHours > primaryAssignee.capacityHours);
      const isUrgent = task.priority === 'urgent';
      const isHigh = task.priority === 'high';

      if (isOverloaded && (isUrgent || isHigh)) {
        score = 80;
        reason = `Beban kerja ${primaryAssignee.name} mencapai ${primaryAssignee.allocatedHours}/${primaryAssignee.capacityHours} jam. Tenggat mendekati batas akhir.`;
        suggestion = 'Alihkan sebagian sub-tugas ke anggota tim dengan kapasitas lebih longgar atau tambah buffer.';
        delay = 3;
      } else if (isOverloaded) {
        score = 55;
        reason = `${primaryAssignee.name} memiliki kapasitas padat minggu ini.`;
        suggestion = 'Pantau perkembangan harian.';
        delay = 1;
      } else {
        score = 20;
        reason = 'Alokasi waktu dan kecepatan kerja dalam batas aman.';
        suggestion = 'Pertahankan jadwal saat ini.';
        delay = 0;
      }
    }

    if (score >= 60) {
      highRiskCount++;
      totalDelayDays += delay;
      recommendations.push({
        taskId: task.id,
        taskTitle: task.title,
        riskScore: score,
        reason: reason || 'Terdeteksi potensi keterlambatan pada tugas ini.',
        suggestion: suggestion || 'Pertimbangkan untuk menambah buffer waktu.',
        actionType: task.aiRisk?.actionType || 'extend_buffer',
        targetAssigneeId: task.aiRisk?.suggestedAssigneeId || users.find(u => u.allocatedHours < u.capacityHours)?.id,
        suggestedBufferDays: task.aiRisk?.suggestedBufferDays || 3,
        predictedDelayDays: delay,
        isOverdue: isOverdue,
        overdueDays: isOverdue ? overdueDays : 0,
      });
    }
  });

  const overloadedCount = users.filter(u => u.allocatedHours > u.capacityHours).length;
  
  let overallScore = 90;
  if (highRiskCount > 0) overallScore -= highRiskCount * 15;
  if (overloadedCount > 0) overallScore -= overloadedCount * 10;
  overallScore = Math.max(20, Math.min(100, overallScore));

  let status: ProjectRiskSummary['status'] = 'healthy';
  if (overallScore < 60) status = 'critical';
  else if (overallScore < 80) status = 'warning';

  return {
    overallScore,
    status,
    atRiskTasksCount: highRiskCount,
    overloadedMembersCount: overloadedCount,
    totalDelayPredictedDays: totalDelayDays,
    keyInsights: [
      `${highRiskCount} tugas membutuhkan perhatian manajerial segera.`,
      `${overloadedCount} anggota tim berada di atas batas kapasitas maksimal (100%).`,
      `Prediksi model akurasi menunjukkan potensi penghematan waktu hingga ${totalDelayDays * 8} jam dengan redistribusi.`,
    ],
    recommendations,
  };
}

export function generateExecutiveSummary(tasks: Task[], users: User[]): ExecutiveSummary {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const riskInfo = analyzeProjectRisks(tasks, users);
  
  let health: ExecutiveSummary['overallHealth'] = 'On Track';
  if (riskInfo.status === 'critical') health = 'Delayed';
  else if (riskInfo.status === 'warning') health = 'At Risk';

  const highlights = [
    `Penyelesaian tugas mencapai ${doneTasks} dari total ${totalTasks} tiket (${completionRate}% selesai).`,
    `${inProgressTasks} tiket inisiatif utama saat ini sedang dalam proses eksekusi aktif.`,
    `Seluruh modul operasional dan sinkronisasi cloud real-time beroperasi stabil.`,
  ];

  const bottlenecks = riskInfo.recommendations.map(r => `${r.taskTitle}: ${r.reason}`);
  if (bottlenecks.length === 0) {
    bottlenecks.push('Tidak ditemukan bottleneck kritis pada periode saat ini.');
  }

  const recommendations = [
    'Pastikan review sub-tugas sebelum memindahkan tiket ke status Done.',
    'Redistribusikan tugas dari anggota yang overload (>40 jam) ke rekan tim lain.',
    'Gunakan analisis risiko untuk memitigasi potensi keterlambatan tugas.',
  ];

  const briefOverview = `Proyek berada dalam status **${health}** (${completionRate}% selesai). Seluruh inisiatif operasional dan teknis telah berjalan sesuai rencana. Tim saat ini sedang memfokuskan mitigasi beban kerja agar target pencapaian tetap sesuai jadwal.`;

  return {
    id: `summary-${Date.now()}`,
    projectId: 'proj-1',
    dateRange: 'Periode Berjalan (Agustus 2026)',
    generatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    headline: `Laporan Eksekutif Status Proyek (${completionRate}% Selesai)`,
    overallHealth: health,
    completionRate,
    keyHighlights: highlights,
    bottlenecksAndRisks: bottlenecks,
    recommendationsForAlex: recommendations,
    stakeholderBriefForBudi: briefOverview,
  };
}
