export interface TkaQuestion {
  id: number;
  category: string; // e.g., 'Proses Bisnis PPLG', 'K3LH & Budaya Kerja', 'Basis Data', 'Algoritma & Pemrograman', 'PBO (OOP)', 'UI/UX & Testing'
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  teacherNote?: string;
}

export const TKA_PPLG_QUESTIONS: TkaQuestion[] = [
  {
    id: 1,
    category: 'Proses Bisnis PPLG',
    question: 'Dalam pengembangan perangkat lunak modern, metodologi Agile Scrum menekankan iterasi yang pendek dan tanggap terhadap perubahan. Istilah untuk pertemuan harian 15 menit bagi tim pengembang adalah...',
    options: [
      'Sprint Review',
      'Daily Standup / Daily Scrum',
      'Sprint Retrospective',
      'Product Backlog Refinement'
    ],
    correctAnswer: 1,
    explanation: 'Daily Standup / Daily Scrum adalah pertemuan singkat (biasanya 15 menit) setiap hari di mana anggota tim menyampaikan apa yang dilakukan kemarin, yang akan dilakukan hari ini, dan hambatan yang dihadapi.',
    teacherNote: '💡 Pak Agung: Di dunia kerja RPL, kolaborasi & komunikasi harian di Daily Scrum sama pentingnya dengan kemampuan baris kode Anda!'
  },
  {
    id: 2,
    category: 'Algoritma & Pemrograman',
    question: 'Perhatikan potongan kode JavaScript berikut:\n\nconst angka = [2, 4, 6, 8];\nconst hasil = angka.map(x => x * 2).filter(x => x > 10);\nconsole.log(hasil);\n\nBerapakah output dari kode tersebut?',
    codeSnippet: 'const angka = [2, 4, 6, 8];\nconst hasil = angka.map(x => x * 2).filter(x => x > 10);\nconsole.log(hasil);',
    options: [
      '[4, 8, 12, 16]',
      '[12, 16]',
      '[8, 12, 16]',
      '[6, 8]'
    ],
    correctAnswer: 1,
    explanation: 'Pertama `.map(x => x * 2)` mengubah array menjadi [4, 8, 12, 16]. Kemudian `.filter(x => x > 10)` menyaring elemen yang lebih besar dari 10, menghasilkan [12, 16].',
    teacherNote: '💡 Pak Agung: Pembacaan fungsional seperti `.map()` dan `.filter()` adalah soal favorit di TKA PPLG modern!'
  },
  {
    id: 3,
    category: 'Basis Data',
    question: 'Untuk mengambil data nama siswa dan nama kelas dari tabel `siswa` dan `kelas` yang terhubung melalui `kelas_id`, perintah SQL JOIN yang paling tepat adalah...',
    codeSnippet: 'SELECT s.nama_siswa, k.nama_kelas \nFROM siswa s \n[JOIN_TYPE] kelas k ON s.kelas_id = k.id;',
    options: [
      'INNER JOIN',
      'CROSS JOIN',
      'OUTER UNION',
      'FULL GROUP'
    ],
    correctAnswer: 0,
    explanation: 'INNER JOIN mengembalikan baris ketika ada kecocokan pada kunci foreign key (`s.kelas_id = k.id`) di kedua tabel.',
    teacherNote: '💡 Pak Agung: Pastikan kalian memahami konsep Primary Key dan Foreign Key sebelum ujian TKA!'
  },
  {
    id: 4,
    category: 'PBO (OOP)',
    question: 'Prinsip Object-Oriented Programming (OOP) yang memungkinkan sebuah kelas turunan (child class) memiliki implementasi metode yang berbeda dari kelas induknya (parent class) disebut...',
    options: [
      'Encapsulation (Pengapsulan)',
      'Polymorphism (Banyak Bentuk / Overriding)',
      'Abstraction (Abstraksi)',
      'Inheritance (Pewarisan)'
    ],
    correctAnswer: 1,
    explanation: 'Polymorphism (khususnya method overriding) memungkinkan kelas turunan mendefinisikan ulang perilaku metode yang diwarisi dari kelas induk.',
    teacherNote: '💡 Pak Agung: Ingat 4 Pilar OOP: Encapsulation, Abstraction, Inheritance, dan Polymorphism!'
  },
  {
    id: 5,
    category: 'K3LH & Budaya Kerja',
    question: 'Seorang programmer bekerja di depan layar komputer selama 8 jam sehari. Posisi duduk ergomik yang ideal menurut standar K3LH adalah...',
    options: [
      'Punggung membungkuk ke depan agar mata dekat dengan monitor',
      'Layar monitor sejajar dengan mata, punggung tegak bersandar 90-100 derajat, dan kaki menapak lantai',
      'Keyboard diletakkan di atas pangkuan dan posisi leher menengadah ke atas',
      'Mata menempel pada layar monitor tanpa lampu ruangan'
    ],
    correctAnswer: 1,
    explanation: 'Ergonomi kerja komputer mewajibkan layar sejajar sudut pandang mata, posisi punggung tersangga tegak, dan kaki menapak rileks untuk mencegah Sindrom Ergonomi (RSI/RSI Syndrome).',
    teacherNote: '💡 Pak Agung: K3LH menjaga tubuh Anda tetap sehat untuk berkarir panjang di dunia IT!'
  },
  {
    id: 6,
    category: 'UI/UX & Testing',
    question: 'Metode pengujian perangkat lunak di mana penguji hanya menguji masukan (input) dan luaran (output) tanpa perlu tahu struktur kode internal aplikasi disebut...',
    options: [
      'White Box Testing',
      'Black Box Testing',
      'Stress Testing',
      'Unit Testing internal'
    ],
    correctAnswer: 1,
    explanation: 'Black Box Testing menguji fungsionalitas sistem berdasarkan spesifikasi tanpa melihat alur algoritma kode di dalamnya (berbeda dengan White Box Testing).',
    teacherNote: '💡 Pak Agung: Di industri, QA Tester pemula sering memulai karier dengan Black Box Testing!'
  }
];
