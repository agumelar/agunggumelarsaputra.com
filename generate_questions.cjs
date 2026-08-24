const fs = require('fs');

const questions = [
  // 1-10: Algoritma & Dasar Pemrograman
  { q: "Tipe data yang hanya bernilai benar (true) atau salah (false) adalah...", o: ["Integer", "String", "Boolean", "Float"], c: 2, cat: "Algoritma & Pemrograman" },
  { q: "Dalam algoritma, struktur perulangan yang akan selalu mengeksekusi blok kode minimal satu kali meskipun kondisinya salah adalah...", o: ["FOR", "WHILE", "DO-WHILE", "IF-ELSE"], c: 2, cat: "Algoritma & Pemrograman" },
  { q: "Apa output dari operasi logika: TRUE AND FALSE OR TRUE?", o: ["TRUE", "FALSE", "ERROR", "NULL"], c: 0, cat: "Algoritma & Pemrograman" },
  { q: "Simbol belah ketupat (diamond) pada flowchart berfungsi untuk...", o: ["Proses", "Input/Output", "Terminator (Mulai/Selesai)", "Decision (Percabangan)"], c: 3, cat: "Algoritma & Pemrograman" },
  { q: "Struktur data yang menggunakan prinsip LIFO (Last In First Out) adalah...", o: ["Queue", "Stack", "Array", "Linked List"], c: 1, cat: "Algoritma & Pemrograman" },
  { q: "Proses memanggil fungsi dirinya sendiri di dalam algoritma disebut...", o: ["Iteration", "Selection", "Recursion", "Overloading"], c: 2, cat: "Algoritma & Pemrograman" },
  { q: "Operator modulo (%) berfungsi untuk...", o: ["Membagi bilangan", "Mencari sisa hasil bagi", "Mengalikan bilangan", "Mencari akar kuadrat"], c: 1, cat: "Algoritma & Pemrograman" },
  { q: "Manakah dari berikut ini yang BUKAN merupakan tipe data primitif di Java?", o: ["int", "boolean", "String", "char"], c: 2, cat: "Algoritma & Pemrograman" },
  { q: "Struktur percabangan yang paling efisien untuk membandingkan satu variabel dengan banyak nilai spesifik (seperti menu 1, 2, 3) adalah...", o: ["Nested IF", "IF-ELSE", "SWITCH-CASE", "FOR"], c: 2, cat: "Algoritma & Pemrograman" },
  { q: "Kompleksitas algoritma Binary Search pada array yang sudah terurut adalah...", o: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], c: 2, cat: "Algoritma & Pemrograman" },

  // 11-20: Pemrograman Web (HTML/CSS/JS/PHP)
  { q: "Tag HTML yang digunakan untuk membuat tautan atau hyperlink adalah...", o: ["<link>", "<a>", "<href>", "<nav>"], c: 1, cat: "Pemrograman Web" },
  { q: "Atribut CSS yang digunakan untuk mengatur jarak di DALAM elemen (antara konten dan border) adalah...", o: ["margin", "padding", "spacing", "border-spacing"], c: 1, cat: "Pemrograman Web" },
  { q: "Untuk menampilkan pesan pop-up peringatan pada JavaScript, kita menggunakan fungsi...", o: ["console.log()", "document.write()", "alert()", "prompt()"], c: 2, cat: "Pemrograman Web" },
  { q: "Metode pengiriman data pada form HTML yang datanya terlihat pada URL adalah...", o: ["POST", "GET", "PUT", "UPDATE"], c: 1, cat: "Pemrograman Web" },
  { q: "Di PHP, variabel selalu diawali dengan simbol...", o: ["@", "#", "$", "%"], c: 2, cat: "Pemrograman Web" },
  { q: "Kode warna #000000 dalam CSS merepresentasikan warna...", o: ["Putih", "Merah", "Hitam", "Biru"], c: 2, cat: "Pemrograman Web" },
  { q: "Tag pembungkus (container) utama pada HTML5 untuk bagian navigasi adalah...", o: ["<header>", "<section>", "<footer>", "<nav>"], c: 3, cat: "Pemrograman Web" },
  { q: "Fungsi utama dari CSS (Cascading Style Sheets) adalah...", o: ["Membuat interaksi dinamis", "Menghubungkan ke database", "Mengatur tata letak dan desain presentasi", "Menulis query logika server"], c: 2, cat: "Pemrograman Web" },
  { q: "Manakah cara yang benar untuk menyisipkan file JavaScript eksternal?", o: ["<script src='script.js'>", "<script href='script.js'>", "<link rel='script.js'>", "<js file='script.js'>"], c: 0, cat: "Pemrograman Web" },
  { q: "Framework CSS populer yang mengedepankan pendekatan utility-first adalah...", o: ["Bootstrap", "Materialize", "Tailwind CSS", "Foundation"], c: 2, cat: "Pemrograman Web" },

  // 21-30: Basis Data (SQL)
  { q: "Perintah SQL untuk menambahkan baris data baru ke dalam tabel adalah...", o: ["UPDATE", "INSERT INTO", "ADD RECORD", "CREATE"], c: 1, cat: "Basis Data" },
  { q: "Klausa yang digunakan untuk mengurutkan hasil query SQL adalah...", o: ["SORT BY", "ORDER BY", "GROUP BY", "ALIGN BY"], c: 1, cat: "Basis Data" },
  { q: "Atribut tabel yang menjamin setiap baris memiliki nilai identifikasi unik dan tidak boleh NULL disebut...", o: ["Foreign Key", "Primary Key", "Unique Key", "Index Key"], c: 1, cat: "Basis Data" },
  { q: "Perintah SQL untuk menghapus tabel beserta seluruh strukturnya dari database adalah...", o: ["DELETE TABLE", "REMOVE TABLE", "DROP TABLE", "TRUNCATE TABLE"], c: 2, cat: "Basis Data" },
  { q: "Fungsi agregat SQL untuk menghitung jumlah total baris/record adalah...", o: ["SUM()", "MAX()", "COUNT()", "TOTAL()"], c: 2, cat: "Basis Data" },
  { q: "Perintah untuk memperbarui data pada kolom tertentu di tabel adalah...", o: ["UPDATE", "ALTER", "CHANGE", "MODIFY"], c: 0, cat: "Basis Data" },
  { q: "Tipe data di MySQL yang paling tepat untuk menyimpan teks panjang (seperti artikel) adalah...", o: ["VARCHAR", "CHAR", "TEXT", "INT"], c: 2, cat: "Basis Data" },
  { q: "Jenis JOIN yang mengembalikan semua baris dari tabel kiri, meskipun tidak ada kecocokan di tabel kanan adalah...", o: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "FULL JOIN"], c: 2, cat: "Basis Data" },
  { q: "Perintah SQL yang tergolong dalam DDL (Data Definition Language) adalah...", o: ["SELECT, INSERT, UPDATE", "GRANT, REVOKE", "CREATE, ALTER, DROP", "COMMIT, ROLLBACK"], c: 2, cat: "Basis Data" },
  { q: "Untuk mencari data siswa yang namanya diawali huruf 'A', kondisi WHERE yang benar adalah...", o: ["WHERE nama LIKE 'A%'", "WHERE nama = 'A%'", "WHERE nama LIKE '%A'", "WHERE nama IN ('A')"], c: 0, cat: "Basis Data" },

  // 31-40: Pemrograman Berorientasi Objek (PBO / OOP)
  { q: "Konsep OOP yang menyembunyikan detail implementasi internal dan hanya menampilkan antarmuka (interface) yang diperlukan disebut...", o: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], c: 3, cat: "PBO (OOP)" },
  { q: "Keyword di Java untuk mendeklarasikan pewarisan (inheritance) dari sebuah kelas induk adalah...", o: ["implements", "extends", "inherits", "super"], c: 1, cat: "PBO (OOP)" },
  { q: "Method khusus yang dijalankan secara otomatis saat sebuah objek (instance) baru dibuat dari suatu class disebut...", o: ["Constructor", "Destructor", "Accessor", "Mutator"], c: 0, cat: "PBO (OOP)" },
  { q: "Access modifier yang membuat variabel/method HANYA BISA diakses dari dalam class itu sendiri adalah...", o: ["public", "protected", "private", "default"], c: 2, cat: "PBO (OOP)" },
  { q: "Kemampuan sebuah method dengan nama yang sama untuk memiliki perilaku berbeda di class induk dan turunannya disebut...", o: ["Overloading", "Overriding", "Overlapping", "Overcasting"], c: 1, cat: "PBO (OOP)" },
  { q: "Keyword 'this' di dalam sebuah class OOP merujuk kepada...", o: ["Class induk", "Class turunan", "Instance / Objek saat ini", "Fungsi utama (main)"], c: 2, cat: "PBO (OOP)" },
  { q: "Dalam paradigma OOP, cetak biru (blueprint) atau rancangan dasar pembentuk objek disebut...", o: ["Method", "Class", "Attribute", "Package"], c: 1, cat: "PBO (OOP)" },
  { q: "Apa fungsi dari method setter (mutator) dalam konsep Encapsulation?", o: ["Mengambil nilai atribut", "Mengubah atau mengisi nilai atribut", "Menghapus objek dari memori", "Mewariskan sifat ke class lain"], c: 1, cat: "PBO (OOP)" },
  { q: "Keyword yang digunakan untuk mencegah sebuah class agar tidak bisa diwariskan ke class lain (di Java) adalah...", o: ["static", "void", "final", "abstract"], c: 2, cat: "PBO (OOP)" },
  { q: "Sebuah class yang tidak dapat diinstansiasi secara langsung dan minimal memiliki satu method abstrak disebut...", o: ["Final Class", "Static Class", "Abstract Class", "Inner Class"], c: 2, cat: "PBO (OOP)" },

  // 41-50: Rekayasa Perangkat Lunak & Sistem Informasi
  { q: "Model SDLC (Software Development Life Cycle) yang prosesnya mengalir searah ke bawah seperti air terjun adalah...", o: ["Agile", "Scrum", "Waterfall", "Prototyping"], c: 2, cat: "Rekayasa Perangkat Lunak" },
  { q: "Diagram UML yang menggambarkan interaksi antara pengguna (aktor) dengan sistem adalah...", o: ["Class Diagram", "Use Case Diagram", "Sequence Diagram", "Activity Diagram"], c: 1, cat: "Rekayasa Perangkat Lunak" },
  { q: "Fase pertama dalam siklus SDLC di mana tim melakukan analisis kelayakan dan pengumpulan kebutuhan (requirements) disebut...", o: ["Design", "Testing", "Implementation", "Planning / Analysis"], c: 3, cat: "Rekayasa Perangkat Lunak" },
  { q: "Diagram UML yang fokus memodelkan aliran instruksi atau aktivitas dalam suatu proses sistem (mirip flowchart) adalah...", o: ["Activity Diagram", "Use Case Diagram", "State Machine Diagram", "Deployment Diagram"], c: 0, cat: "Rekayasa Perangkat Lunak" },
  { q: "Dalam metodologi Scrum, daftar fitur atau pekerjaan yang harus diselesaikan untuk keseluruhan produk disimpan dalam...", o: ["Sprint Backlog", "Product Backlog", "Daily Log", "Burndown Chart"], c: 1, cat: "Rekayasa Perangkat Lunak" },
  { q: "Black Box Testing adalah pengujian yang berfokus pada...", o: ["Struktur kode internal aplikasi", "Fungsionalitas dan kesesuaian input/output", "Keamanan enkripsi server", "Kecepatan eksekusi algoritma"], c: 1, cat: "Rekayasa Perangkat Lunak" },
  { q: "Versi sistem perangkat lunak yang disebarkan kepada sekelompok pengguna terbatas untuk pengujian dunia nyata sebelum rilis final disebut versi...", o: ["Alpha", "Beta", "Stable", "Release Candidate"], c: 1, cat: "Rekayasa Perangkat Lunak" },
  { q: "Hubungan antar Use Case dimana satu use case secara MUTLAK membutuhkan eksekusi use case lain (misalnya Checkout butuh Login) menggunakan relasi...", o: ["<<include>>", "<<extend>>", "<<generalization>>", "<<realization>>"], c: 0, cat: "Rekayasa Perangkat Lunak" },
  { q: "Perangkat lunak yang kodenya bebas dilihat, dimodifikasi, dan didistribusikan oleh siapa saja disebut perangkat lunak...", o: ["Proprietary", "Freeware", "Open Source", "Shareware"], c: 2, cat: "Rekayasa Perangkat Lunak" },
  { q: "Dalam arsitektur MVC, komponen yang bertanggung jawab mengelola logika bisnis dan berinteraksi langsung dengan Database adalah...", o: ["Model", "View", "Controller", "Router"], c: 0, cat: "Rekayasa Perangkat Lunak" },

  // 51-60: K3LH, Git, Jaringan & Dasar Komputer
  { q: "Singkatan dari K3LH dalam lingkungan kerja kejuruan adalah...", o: ["Keselamatan, Kesehatan Kerja dan Lingkungan Hidup", "Kesejahteraan, Kekuatan, Kerja dan Lingkungan Hidup", "Keselamatan, Kesejahteraan Karyawan dan Lingkungan Hidup", "Kesehatan, Kekuatan Komputer dan Lingkungan Hidup"], c: 0, cat: "K3LH & Budaya Kerja" },
  { q: "Jarak pandang ideal yang direkomendasikan K3LH dari mata pekerja ke layar monitor komputer adalah...", o: ["10-20 cm", "30-40 cm", "50-70 cm", "Lebih dari 1 meter"], c: 2, cat: "K3LH & Budaya Kerja" },
  { q: "Sistem pengontrol versi (Version Control System) yang sangat populer digunakan oleh programmer untuk melacak perubahan kode sumber adalah...", o: ["Git", "Docker", "Nginx", "Apache"], c: 0, cat: "Alat Pengembangan" },
  { q: "Perintah dasar Git untuk menyimpan perubahan secara permanen ke dalam riwayat lokal adalah...", o: ["git push", "git commit", "git pull", "git add"], c: 1, cat: "Alat Pengembangan" },
  { q: "Alamat IP versi 4 (IPv4) terdiri dari berapa bit?", o: ["16 bit", "32 bit", "64 bit", "128 bit"], c: 1, cat: "Jaringan Dasar" },
  { q: "Protokol standar untuk mentransfer dokumen web melalui internet yang menggunakan enkripsi keamanan (SSL/TLS) adalah...", o: ["HTTP", "HTTPS", "FTP", "SMTP"], c: 1, cat: "Jaringan Dasar" },
  { q: "Perintah Git untuk mengunggah komit lokal ke server repositori remote (seperti GitHub/GitLab) adalah...", o: ["git fetch", "git pull", "git push", "git clone"], c: 2, cat: "Alat Pengembangan" },
  { q: "Posisi mengetik yang baik untuk menghindari cedera CTS (Carpal Tunnel Syndrome) adalah...", o: ["Pergelangan tangan lurus dan sejajar dengan keyboard", "Pergelangan tangan ditekuk ke atas tajam", "Keyboard dipangku di paha", "Menggunakan satu jari telunjuk saja"], c: 0, cat: "K3LH & Budaya Kerja" },
  { q: "Topologi jaringan dimana semua komputer terhubung ke satu perangkat pusat (seperti Switch/Hub) disebut topologi...", o: ["Bus", "Ring", "Star", "Mesh"], c: 2, cat: "Jaringan Dasar" },
  { q: "Perintah Command Prompt (Windows) atau Terminal (Linux) untuk mengecek konektivitas ke suatu alamat server adalah...", o: ["ipconfig", "dir", "ping", "cd"], c: 2, cat: "Jaringan Dasar" }
];

let output = `export interface TkaQuestion {
  id: number;
  category: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  teacherNote?: string;
}

export const TKA_PPLG_QUESTIONS: TkaQuestion[] = [
`;

questions.forEach((q, i) => {
  const explanation = "Jawaban yang benar adalah " + q.o[q.c] + ".";
  output += `  {
    id: ${i + 1},
    category: '${q.cat}',
    question: '${q.q.replace(/'/g, "\\'")}',
    options: [${q.o.map(opt => `'${opt.replace(/'/g, "\\'")}'`).join(', ')}],
    correctAnswer: ${q.c},
    explanation: ${JSON.stringify(explanation)},
    teacherNote: '💡 Semangat! Ingat kembali materi kejuruan dasar Anda.'
  }`;
  if (i < questions.length - 1) output += ',\n';
});

output += `\n];\n`;

fs.writeFileSync('d:/DATA/PROJEK/agunggumelarsaputra.com/src/utils/tkaEngine.ts', output);
console.log('Done writing 60 questions');
