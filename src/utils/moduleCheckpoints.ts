export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface DetectiveStage {
  statement: string;
  isFact: boolean;
  factLabel: string;
  mythLabel: string;
  explanation: string;
}

export interface SpeedOption {
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SpeedStage {
  question: string;
  options: SpeedOption[];
  timerSeconds?: number;
}

export interface GamifiedQuest {
  id: string;
  moduleTitle: string;
  badge: string;
  xpReward: number;
  stage1Match: {
    instruction: string;
    pairs: MatchPair[];
  };
  stage2Detective: DetectiveStage;
  stage3Speed: SpeedStage;
}

export const MODULE_GAMIFIED_QUESTS: Record<string, GamifiedQuest> = {
  'orientasi-pplg-01-pengantar-skill-passport': {
    id: 'quest-or01',
    moduleTitle: 'Pengantar Skill Passport & Standar Portofolio',
    badge: '🎮 Mini-Game Quest: Modul 1',
    xpReward: 15,
    stage1Match: {
      instruction: 'Pasangkan 3 Konsep Skill Passport dengan Definisi yang Tepat (Klik Kartu Kiri lalu Kartu Kanan):',
      pairs: [
        { id: 'p1', left: 'Skill Passport', right: 'Buku rekam jejak portofolio & kompetensi industri' },
        { id: 'p2', left: 'Evidence Google Drive', right: 'Bukti fisik file PDF laporan & link repositori tugas' },
        { id: 'p3', left: 'Standar KKM 73', right: 'Ambang batas nilai minimal ketuntasan uji kompetensi' },
      ],
    },
    stage2Detective: {
      statement: 'Klaim: "Di industri software modern, recruiter hanya melihat nilai angka di ijazah dan tidak peduli pada portofolio proyek yang pernah kalian buat."',
      isFact: false,
      factLabel: '✅ FAKTA INDUSTRI',
      mythLabel: '❌ MITOS / SALAH BESAR',
      explanation: 'MITOS! Di industri IT, portofolio nyata di GitHub/GDrive dan bukti karya adalah faktor nomor 1 yang menentukan kelulusan wawancara kerja.',
    },
    stage3Speed: {
      question: 'Mengapa izin akses link Google Drive tugas harus disetel ke "Siapa saja yang memiliki link dapat melihat"?',
      options: [
        {
          label: 'Agar guru pengampu dan penguji kompetensi dapat memverifikasi isi evidence karya tanpa terhalang gembok akses (Private).',
          isCorrect: true,
          explanation: 'Tepat sekali! Evidence yang terkunci tidak dapat divalidasi dan akan menghambat verifikasi kelulusan.',
        },
        {
          label: 'Agar file otomatis terhapus setelah 24 jam.',
          isCorrect: false,
          explanation: 'Izin akses view tidak menghapus file sama sekali.',
        },
        {
          label: 'Hanya agar tampilan link terlihat lebih panjang.',
          isCorrect: false,
          explanation: 'Pengaturan akses murni untuk izin pembacaan dokumen oleh asesor.',
        },
      ],
      timerSeconds: 25,
    },
  },

  'orientasi-pplg-02-profesi-peluang-karier': {
    id: 'quest-or02',
    moduleTitle: '8 Profesi Utama & Sinergi Tim Industri PPLG',
    badge: '🎮 Mini-Game Quest: Modul 2',
    xpReward: 15,
    stage1Match: {
      instruction: 'Pasangkan Profesi Software dengan Tanggung Jawab Kerjanya:',
      pairs: [
        { id: 'p1', left: 'Frontend Developer', right: 'Membangun antarmuka web interaktif di browser (HTML/CSS/JS)' },
        { id: 'p2', left: 'Backend Engineer', right: 'Mengelola database server, API endpoint, dan logika bisnis' },
        { id: 'p3', left: 'QA / Software Tester', right: 'Menguji bug, performa sistem, dan memastikan zero-error' },
      ],
    },
    stage2Detective: {
      statement: 'Klaim: "Aplikasi besar seperti Gojek dan Tokopedia dapat dirancang, diprogram, dan dirilis ke jutaan pengguna hanya oleh 1 orang programmer saja."',
      isFact: false,
      factLabel: '✅ FAKTA TIM',
      mythLabel: '❌ MITOS / TIDAK REALISTIS',
      explanation: 'MITOS! Aplikasi skala industri dikembangkan oleh Tim Produk lintas disiplin (Product Manager, UI/UX, Frontend, Backend, DevOps, QA).',
    },
    stage3Speed: {
      question: 'Profesi mana yang bertugas menjembatani riset kenyamanan pengguna ke dalam bentuk desain wireframe dan prototype interaktif?',
      options: [
        {
          label: 'UI/UX Designer (Product Designer)',
          isCorrect: true,
          explanation: 'Benar! UI/UX Designer merancang arsitektur interaksi, wireframe visual, dan prototype sebelum dikodekan oleh programmer.',
        },
        {
          label: 'Database Administrator',
          isCorrect: false,
          explanation: 'DBA fokus pada tuning query dan keamanan server basis data.',
        },
        {
          label: 'Network Security Engineer',
          isCorrect: false,
          explanation: 'Security Engineer fokus pada proteksi jaringan dan firewall.',
        },
      ],
      timerSeconds: 25,
    },
  },

  'orientasi-pplg-03-ekosistem-industri-pplg': {
    id: 'quest-or03',
    moduleTitle: 'Ekosistem Industri & Model Bisnis Software',
    badge: '🎮 Mini-Game Quest: Modul 3',
    xpReward: 15,
    stage1Match: {
      instruction: 'Pasangkan Tipe Perusahaan Software dengan Karakteristiknya:',
      pairs: [
        { id: 'p1', left: 'Software House', right: 'Mengerjakan aplikasi pesanan klien pihak ketiga (Agency/Vendor)' },
        { id: 'p2', left: 'Product Company', right: 'Mengembangkan produk digital milik sendiri (Contoh: Spotify)' },
        { id: 'p3', left: 'Open Source Community', right: 'Mengembangkan framework bebas pakai secara kolaboratif global' },
      ],
    },
    stage2Detective: {
      statement: 'Klaim: "Model bisnis SaaS (Software as a Service) menjual software dengan skema langganan bulanan/tahunan berbasis Cloud ketimbang sekali beli putus."',
      isFact: true,
      factLabel: '✅ FAKTA MODEL BISNIS',
      mythLabel: '❌ SALAH / BUKAN SAAS',
      explanation: 'FAKTA! SaaS (seperti Netflix, Figma, GitHub) menggunakan langganan berkala untuk terus memberikan update fitur dan pemeliharaan server.',
    },
    stage3Speed: {
      question: 'Apa keuntungan bekerja di Software House bagi seorang lulusan junior RPL di awal karier?',
      options: [
        {
          label: 'Berkesempatan menangani beragam variasi proyek klien sehingga wawasan teknologi dan portofolio berkembang pesat.',
          isCorrect: true,
          explanation: 'Tepat sekali! Variasi industri klien mempercepat pengalaman hands-on developer muda.',
        },
        {
          label: 'Tidak perlu menulis kode program.',
          isCorrect: false,
          explanation: 'Software House justru tempat praktik coding intensif.',
        },
        {
          label: 'Bebas dari deadline proyek.',
          isCorrect: false,
          explanation: 'Software House memiliki timeline delivery proyek yang ketat.',
        },
      ],
      timerSeconds: 25,
    },
  },

  'orientasi-pplg-04-matriks-skill-jenjang-karier': {
    id: 'quest-or04',
    moduleTitle: 'Matriks Skill & Jenjang Karier PPLG',
    badge: '🎮 Mini-Game Quest: Modul 4',
    xpReward: 15,
    stage1Match: {
      instruction: 'Pasangkan Level Karier Software Engineer dengan Tingkat Tanggung Jawabnya:',
      pairs: [
        { id: 'p1', left: 'Junior Developer', right: 'Mengerjakan tugas coding terarah di bawah bimbingan senior' },
        { id: 'p2', left: 'Mid-Level Developer', right: 'Mampu menyelesaikan fitur kompleks secara mandiri dan efisien' },
        { id: 'p3', left: 'Senior / Tech Lead', right: 'Merancang arsitektur sistem besar dan membimbing seluruh tim' },
      ],
    },
    stage2Detective: {
      statement: 'Klaim: "T-Shaped Skills berarti seorang developer memiliki keahlian mendalam pada satu bidang utama (vertikal) serta wawasan luas lintas disiplin untuk kolaborasi (horizontal)."',
      isFact: true,
      factLabel: '✅ FAKTA STANDAR SKILL',
      mythLabel: '❌ SALAH / BUKAN T-SHAPED',
      explanation: 'FAKTA! Konsep T-Shaped memadukan keahlian spesialis (Deep Specialist) dengan kemampuan berkolaborasi dengan peran lain (Broad Generalist).',
    },
    stage3Speed: {
      question: 'Soft skill apa yang paling krusial bagi seorang programmer saat bekerja dalam tim Agile/Scrum?',
      options: [
        {
          label: 'Komunikasi proaktif, keterbukaan menerima code review, dan kerja sama tim.',
          isCorrect: true,
          explanation: 'Luar biasa! Software engineering adalah olahraga tim yang mengandalkan komunikasi yang solid.',
        },
        {
          label: 'Bekerja sendiri tanpa memberi tahu progres kepada tim.',
          isCorrect: false,
          explanation: 'Sikap tertutup (silo) menghambat kolaborasi dan sinkronisasi sprint.',
        },
        {
          label: 'Menolak saran perbaikan dari rekan sejawat.',
          isCorrect: false,
          explanation: 'Menerima code review konstruktif adalah kunci kematangan seorang engineer.',
        },
      ],
      timerSeconds: 25,
    },
  },

  'orientasi-pplg-09-app-audit-produk-digital': {
    id: 'quest-or09',
    moduleTitle: 'App Audit & Bedah Kualitas Produk Digital',
    badge: '🎮 Mini-Game Quest: Modul 9',
    xpReward: 15,
    stage1Match: {
      instruction: 'Pasangkan Parameter Audit Produk dengan Aspek yang Diuji:',
      pairs: [
        { id: 'p1', left: 'Usability (UX)', right: 'Kemudahan dan kejelasan alur interaksi pengguna saat memakai aplikasi' },
        { id: 'p2', left: 'Performance', right: 'Kecepatan respon aplikasi, waktu loading halaman, dan konsumsi memori' },
        { id: 'p3', left: 'Reliability', right: 'Kestabilan sistem saat terjadi error jaringan atau input tak terduga' },
      ],
    },
    stage2Detective: {
      statement: 'Klaim: "Melakukan App Audit pada aplikasi populer cukup dengan melihat warna tombolnya saja tanpa perlu menguji alur checkout atau transaksi."',
      isFact: false,
      factLabel: '✅ FAKTA AUDIT LENGKAP',
      mythLabel: '❌ MITOS / AUDIT DANGKAL',
      explanation: 'MITOS! Audit profesional wajib menguji keseluruhan alur fungsional (End-to-End User Journey) dari awal hingga akhir.',
    },
    stage3Speed: {
      question: 'Apa tujuan utama menyertakan tangkapan layar (screenshot) beranotasi visual dalam laporan review aplikasi?',
      options: [
        {
          label: 'Memberikan bukti otentik (Evidence) yang presisi sehingga pengembang langsung memahami letak kekurangan fitur.',
          isCorrect: true,
          explanation: 'Tepat sekali! Anotasi visual mencegah ambigu dan mempercepat tindak lanjut perbaikan.',
        },
        {
          label: 'Hanya sebagai hiasan gambar agar laporan tampak ramai.',
          isCorrect: false,
          explanation: 'Screenshot beranotasi adalah bukti empiris utama dalam audit software.',
        },
        {
          label: 'Menutupi kelemahan data teks analisis.',
          isCorrect: false,
          explanation: 'Anotasi visual melengkapi analisis teks secara ilmiah.',
        },
      ],
      timerSeconds: 25,
    },
  },

  'orientasi-pplg-10-ui-ux-fungsi-produk': {
    id: 'quest-or10',
    moduleTitle: 'UI vs UX & Anatomi Desain Produk Digital',
    badge: '🎮 Mini-Game Quest: Modul 10',
    xpReward: 15,
    stage1Match: {
      instruction: 'Pasangkan Ranah UI dan UX dengan Elemen Fokusnya:',
      pairs: [
        { id: 'p1', left: 'User Interface (UI)', right: 'Tipografi, palet warna, konsistensi icon, dan estetika visual layar' },
        { id: 'p2', left: 'User Experience (UX)', right: 'Arsitektur informasi, alur navigasi cepat, dan kemudahan pengguna' },
        { id: 'p3', left: 'Design System', right: 'Koleksi komponen UI standar yang reusable di seluruh halaman aplikasi' },
      ],
    },
    stage2Detective: {
      statement: 'Klaim: "Aplikasi dengan animasi visual yang sangat mewah dan berkilauan pasti memiliki UX yang bagus meskipun tombol login-nya sulit ditemukan."',
      isFact: false,
      factLabel: '✅ FAKTA KESEIMBANGAN',
      mythLabel: '❌ MITOS / SALAH KAPRAH',
      explanation: 'MITOS! Jika pengguna kesulitan menyelesaikan tujuannya (misal tombol susah dicari), maka UX aplikasi tersebut dinyatakan buruk terlepas dari estetikanya.',
    },
    stage3Speed: {
      question: 'Prinsip desain apa yang menyatakan bahwa elemen yang memiliki fungsi serupa harus diletakkan pada posisi dan gaya visual yang seragam?',
      options: [
        {
          label: 'Konsistensi (Consistency & Standards)',
          isCorrect: true,
          explanation: 'Benar! Konsistensi mengurangi beban kognitif pengguna karena mereka tidak perlu menebak pola baru di setiap halaman.',
        },
        {
          label: 'Kompleksitas Ekstrem',
          isCorrect: false,
          explanation: 'Kompleksitas tinggi justru membingungkan user.',
        },
        {
          label: 'Variasi Acak',
          isCorrect: false,
          explanation: 'Variasi acak merusak pengalaman navigasi.',
        },
      ],
      timerSeconds: 25,
    },
  },
};

export function getGamifiedQuestForModule(slug: string, moduleTitle?: string): GamifiedQuest {
  if (MODULE_GAMIFIED_QUESTS[slug]) {
    return MODULE_GAMIFIED_QUESTS[slug];
  }

  // Smart fallback quest generator for any module
  const cleanTitle = moduleTitle || 'Materi Kejuruan PPLG';
  return {
    id: `quest-${slug.replace(/[^a-zA-Z0-9]/g, '-')}`,
    moduleTitle: cleanTitle,
    badge: '🎮 Mini-Game Quest Interaktif',
    xpReward: 15,
    stage1Match: {
      instruction: `Pasangkan Konsep Inti "${cleanTitle}" dengan Nilai Praktiknya:`,
      pairs: [
        { id: 'p1', left: 'Pemahaman Konsep', right: 'Fondasi logika dan teori sebelum mengeksekusi kode' },
        { id: 'p2', left: 'Evidence Portofolio', right: 'Bukti karya nyata yang diunggah ke repositori GDrive' },
        { id: 'p3', left: 'Standar KKM 73', right: 'Tolok ukur ketercapaian kompetensi vokasi PPLG' },
      ],
    },
    stage2Detective: {
      statement: `Klaim: "Memahami substansi materi pada ${cleanTitle} dan mendokumentasikan bukti pengerjaannya sangat krusial untuk kesiapan kerja di industri software."`,
      isFact: true,
      factLabel: '✅ FAKTA KOMPETENSI',
      mythLabel: '❌ SALAH / TIDAK PENTING',
      explanation: 'FAKTA! Kompetensi software engineer dibangun melalui perpaduan pemahaman konsep yang kuat dan pembiasaan dokumentasi profesional.',
    },
    stage3Speed: {
      question: `Apa sikap profesional yang harus ditunjukkan saat menyelesaikan tugas pada materi "${cleanTitle}"?`,
      options: [
        {
          label: 'Mengerjakan dengan sungguh-sungguh, menjaga orisinalitas karya, dan mematuhi rubrik penilaian KKTP.',
          isCorrect: true,
          explanation: 'Sempurna! Integritas dan kepatuhan standar adalah etika utama seorang Software Engineer.',
        },
        {
          label: 'Menyalin pekerjaan teman tanpa memahami isinya.',
          isCorrect: false,
          explanation: 'Plagiarisme merugikan perkembangan kompetensi diri sendiri.',
        },
        {
          label: 'Mengabaikan petunjuk format file yang diminta guru.',
          isCorrect: false,
          explanation: 'Kepatuhan format adalah bagian dari Quality Assurance.',
        },
      ],
      timerSeconds: 25,
    },
  };
}
