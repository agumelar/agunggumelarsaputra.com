import type { OrientasiSlug } from './orientasiPplgPolicy.ts';

export type InteractiveActivityKind = 'explore' | 'scenario' | 'sequence' | 'checklist';

export interface InteractiveActivityItem {
  label: string;
  detail: string;
  feedback: string;
}

export interface InteractiveActivity {
  id: string;
  kind: InteractiveActivityKind;
  title: string;
  instruction: string;
  items: InteractiveActivityItem[];
  feedback: string;
  correctOrder?: readonly string[];
}

export interface LearningHero {
  code: string;
  sprint: string;
  context: string;
  objective: string;
}

export interface TeacherMessage {
  title: 'Pesan Guru Pengampu RPL';
  message: string;
  signature: string;
}

export interface LearningScene {
  id: string;
  kind: InteractiveActivityKind;
  title: string;
  instruction: string;
  items: InteractiveActivityItem[];
  feedback: string;
  correctOrder?: readonly string[];
}

export interface InteractiveMaterial {
  slug: OrientasiSlug;
  eyebrow: string;
  title: string;
  summary: string;
  activities: [InteractiveActivity, InteractiveActivity];
  hero: LearningHero;
  teacherMessage: TeacherMessage;
  scenes: [LearningScene, LearningScene];
}

type InteractiveMaterialSeed = Omit<InteractiveMaterial, 'hero' | 'teacherMessage' | 'scenes'>;
type InteractiveMaterialCatalog = Partial<Record<OrientasiSlug, InteractiveMaterialSeed>>;
type ActiveInteractiveOrientasiSlug = Exclude<OrientasiSlug, 'orientasi-pplg-01-pengantar-skill-passport'>;
type LearningContext = Pick<InteractiveMaterial, 'hero' | 'teacherMessage'>;

const item = (label: string, detail: string, feedback: string): InteractiveActivityItem => ({ label, detail, feedback });

const ORIENTASI_INTERACTIVE_MATERIALS: InteractiveMaterialCatalog = {
  'orientasi-pplg-02-profesi-peluang-karier': {
    slug: 'orientasi-pplg-02-profesi-peluang-karier', eyebrow: 'OR-01 · Profesi PPLG', title: 'Profesi dan Sinergi Tim Produk', summary: 'Kenali delapan peran yang membuat produk digital berjalan.',
    activities: [
      { id: 'or02-professions', kind: 'explore', title: 'Jelajah 8 profesi', instruction: 'Buka setiap kartu lalu hubungkan peran dengan hasil kerjanya.', items: [item('Frontend Developer', 'Mewujudkan desain menjadi antarmuka web responsif.', 'Fokusnya layar yang digunakan pengguna.'), item('Backend Developer', 'Membangun API, logika bisnis, dan basis data.', 'Peran ini bekerja di balik layar.'), item('Mobile Developer', 'Membuat aplikasi Android atau iOS yang efisien.', 'Perhatikan kebutuhan perangkat mobile.'), item('UI/UX Designer', 'Merancang tampilan dan alur pengguna.', 'UI terlihat, UX terasa saat digunakan.'), item('Game Developer', 'Membangun mekanik, dunia, dan interaksi gim.', 'Gameplay dan sistem skor termasuk tanggung jawabnya.'), item('Data Engineer & Scientist', 'Mengolah data menjadi informasi dan rekomendasi.', 'Data perlu dibersihkan sebelum dianalisis.'), item('DevOps & Cloud Engineer', 'Menjaga rilis, server, dan pemantauan aplikasi.', 'Tujuannya layanan andal saat trafik tinggi.'), item('QA Engineer', 'Menguji skenario dan mendokumentasikan bug.', 'Pengujian dilakukan sebelum produk dirilis.')], feedback: 'Setiap profesi saling melengkapi dalam satu tim produk.' },
      { id: 'or02-handoff', kind: 'sequence', title: 'Urutkan handoff tiket konser', instruction: 'Susun alur kerja fitur beli tiket dari kebutuhan sampai siap dipakai.', items: [item('Product Manager', 'Menetapkan kebutuhan fitur dan target rilis.', 'Kebutuhan yang jelas menjadi titik awal.'), item('UI/UX Designer', 'Mendesain alur kursi dan tiket digital.', 'Rancangan memandu pekerjaan implementasi.'), item('Frontend/Mobile Developer', 'Membangun layar dari rancangan Figma.', 'Antarmuka menghubungkan pengguna ke layanan.'), item('Backend Developer', 'Memproses pembayaran dan kuota kursi realtime.', 'Logika transaksi harus aman dan konsisten.'), item('QA Engineer', 'Menguji koneksi putus dan saldo tidak cukup.', 'Kasus ekstrem membantu menemukan bug.'), item('DevOps Engineer', 'Menyiapkan server untuk war ticket.', 'Infrastruktur menjaga layanan tetap tersedia.')], feedback: 'Produk digital siap rilis melalui handoff lintas peran yang teratur.' }
    ]
  },
  'orientasi-pplg-03-ekosistem-industri-pplg': {
    slug: 'orientasi-pplg-03-ekosistem-industri-pplg', eyebrow: 'OR-01 · Ekosistem', title: 'Ekosistem Industri PPLG', summary: 'Bandingkan lingkungan kerja dan jalur kerja perangkat lunak.',
    activities: [
      { id: 'or03-ecosystems', kind: 'explore', title: 'Jelajah 5 ekosistem', instruction: 'Baca karakter tiap lingkungan kerja sebelum memilih kecocokan.', items: [item('Startup', 'Produk baru dengan pertumbuhan cepat dan target intens.', 'Belajar luas, tetapi ketidakpastian lebih tinggi.'), item('Software House', 'Mengerjakan aplikasi kustom untuk banyak klien.', 'Portofolio beragam, tenggat dapat padat.'), item('Corporate IT', 'Menjaga sistem korporasi yang stabil dan patuh.', 'Prosedur kuat mendukung keamanan skala besar.'), item('Freelancer', 'Menjual keahlian mandiri kepada klien.', 'Fleksibel, namun perlu disiplin dan negosiasi.'), item('In-house Instansi', 'Memelihara sistem layanan internal atau publik.', 'Dampaknya langsung bagi pelayanan pengguna.')], feedback: 'Tidak ada ekosistem yang mutlak terbaik; sesuaikan dengan tujuan dan gaya kerja.' },
      { id: 'or03-match', kind: 'scenario', title: 'Cocokkan situasi kerja', instruction: 'Pilih ekosistem yang paling sesuai untuk setiap kebutuhan.', items: [item('Banyak proyek klien', 'Tim menerima pembuatan website dari berbagai bisnis.', 'Software house cocok karena menangani proyek kustom.'), item('Jadwal mandiri', 'Pengembang mencari proyek global dari rumah.', 'Freelancer/remote membutuhkan disiplin diri.'), item('Sistem bank stabil', 'Tim mengutamakan kepatuhan dan keamanan skala besar.', 'Corporate IT sesuai untuk operasi yang terstruktur.'), item('Layanan sekolah', 'Sistem administrasi dipakai warga lembaga.', 'In-house instansi berfokus pada layanan internal.'), item('Produk baru bertumbuh', 'Tim menguji solusi pasar dengan cepat.', 'Startup menekankan inovasi dan pertumbuhan.')], feedback: 'Gunakan fokus, ritme, dan model bisnis sebagai petunjuk pencocokan.' }
    ]
  },
  'orientasi-pplg-04-matriks-skill-jenjang-karier': {
    slug: 'orientasi-pplg-04-matriks-skill-jenjang-karier', eyebrow: 'OR-01 · Skill dan Karier', title: 'Matriks Skill dan Jenjang Karier', summary: 'Petakan kemampuan, kurikulum, dan langkah menuju profesi.',
    activities: [
      { id: 'or04-matrix', kind: 'explore', title: 'Jelajah matriks skill', instruction: 'Telusuri tiap kelompok skill sebagai bekal karier PPLG.', items: [item('Hard skill', 'Kemampuan teknis seperti algoritma, web, dan basis data.', 'Kemampuan teknis dibuktikan lewat karya.'), item('Soft skill', 'Komunikasi, kerja tim, dan manajemen waktu.', 'Kolaborasi memperkuat kualitas kerja teknis.'), item('Fase E', 'Orientasi, algoritma, dan pemodelan dasar di kelas 10.', 'Fondasi ini menyiapkan pembelajaran berikutnya.'), item('Fase F kelas 11', 'Web, basis data, dan PBO.', 'Kompetensi ini membangun aplikasi dinamis.'), item('Fase F kelas 12', 'Mobile, PKK, dan PKL industri.', 'Portofolio dan pengalaman nyata semakin penting.')], feedback: 'Karier berkembang dari perpaduan hard skill dan soft skill yang dilatih bertahap.' },
      { id: 'or04-roadmap', kind: 'sequence', title: 'Susun roadmap karier', instruction: 'Urutkan perjalanan belajar dari fondasi hingga kepemimpinan teknis.', items: [item('Fondasi kelas 10', 'Latih logika, orientasi industri, dan pemodelan.', 'Mulailah dari dasar yang kuat.'), item('Pendalaman kelas 11', 'Bangun web, API, basis data, dan PBO.', 'Kembangkan kemampuan implementasi.'), item('Portofolio kelas 12', 'Kerjakan mobile, PKK, dan PKL.', 'Buktikan kemampuan dengan proyek nyata.'), item('Intern/Junior', 'Belajar dalam tugas dengan bimbingan.', 'Tanggung jawab bertumbuh melalui praktik.'), item('Mid/Senior/Lead', 'Menyelesaikan masalah kompleks dan membimbing tim.', 'Pengalaman dan komunikasi memperluas peran.')], feedback: 'Roadmap membantu mengubah minat menjadi langkah belajar yang terukur.' }
    ]
  },
  'orientasi-pplg-05-job-fair-kelas': {
    slug: 'orientasi-pplg-05-job-fair-kelas', eyebrow: 'OR-01 · Job Fair', title: 'Job Fair Kelas PPLG', summary: 'Siapkan booth dan ajukan pertanyaan karier yang bermakna.',
    activities: [
      { id: 'or05-booth', kind: 'scenario', title: 'Pilih rute booth sesuai minat dan tujuan', instruction: 'Pilih rute booth yang paling sesuai dengan bakat atau tujuan eksplorasi kariermu.', items: [item('Minat logis', 'Kunjungi booth yang menjelaskan masalah nyata dan cara profesi menyelesaikannya.', 'Rute booth ini membantu menguji kecocokan dengan minat logis.'), item('Minat visual', 'Kunjungi booth yang menampilkan contoh karya dan produk nyata.', 'Rute booth ini membantu menguji kecocokan dengan minat visual.'), item('Minat analitis', 'Kunjungi booth yang membahas tantangan kerja dan cara menanganinya.', 'Rute booth ini membantu menguji kecocokan dengan minat analitis.'), item('Tujuan memilih skill awal', 'Kunjungi booth yang menjelaskan bahasa pemrograman atau software pertama untuk dipelajari.', 'Rute booth ini memberi arah skill awal yang konkret.'), item('Tujuan memahami kerja tim', 'Kunjungi booth yang membahas kesulitan profesi saat bekerja dalam tim besar.', 'Rute booth ini memperjelas realitas kolaborasi profesi.')], feedback: 'Rute booth yang dipilih perlu selaras dengan minat atau tujuan eksplorasi pribadi.' },
      { id: 'or05-interview', kind: 'scenario', title: 'Nilai kualitas pertanyaan wawancara', instruction: 'Cermati setiap pertanyaan, lalu bedakan pertanyaan kuat yang spesifik dari pertanyaan lemah yang terlalu umum.', items: [item('“Masalah nyata apa yang paling sering diselesaikan?”', 'Pertanyaan mengarahkan narasumber pada contoh masalah dalam pekerjaan.', 'Pertanyaan kuat: fokusnya spesifik dan mengungkap realitas profesi.'), item('“Tech stack apa yang pertama harus saya kuasai?”', 'Pertanyaan meminta arah bahasa pemrograman atau software untuk pemula.', 'Pertanyaan kuat: jawabannya dapat ditindaklanjuti menjadi rencana belajar.'), item('“Apa kesulitan terbesar saat bekerja dalam tim besar?”', 'Pertanyaan menggali tantangan profesi dalam kolaborasi.', 'Pertanyaan kuat: konteks timnya jelas dan relevan.'), item('“Tugas harian apa yang paling sering dilakukan?”', 'Pertanyaan meminta contoh kegiatan kerja yang berulang.', 'Pertanyaan berkualitas: jawabannya membantu memahami keseharian profesi.'), item('“Profesi ini bagus, kan?”', 'Pertanyaan hanya mengundang jawaban setuju atau tidak setuju.', 'Pertanyaan lemah: terlalu umum dan tidak menghasilkan wawasan yang spesifik.'), item('“Gajinya besar?”', 'Pertanyaan tidak menentukan konteks pengalaman atau tanggung jawab.', 'Pertanyaan lemah: kurang spesifik untuk memahami rentang kompensasi secara bermakna.')], feedback: 'Pertanyaan wawancara yang kuat menyebut fokus yang jelas dan menghasilkan wawasan yang dapat ditindaklanjuti.' }
    ]
  },
  'orientasi-pplg-06-rencana-minat-awal': {
    slug: 'orientasi-pplg-06-rencana-minat-awal', eyebrow: 'OR-01 · Rencana Minat', title: 'Rencana Minat Karier Awal', summary: 'Rumusan minat menjadi roadmap belajar tiga tahun yang nyata.',
    activities: [
      { id: 'or06-smart', kind: 'checklist', title: 'Cek target SMART', instruction: 'Uji apakah target minat kariermu dapat dijalankan.', items: [item('Specific', 'Sebutkan profesi atau skill yang jelas.', 'Target jelas menghindari rencana yang terlalu umum.'), item('Measurable', 'Tentukan bukti kemajuan yang dapat dihitung.', 'Ukuran membuat progres terlihat.'), item('Achievable', 'Sesuaikan target dengan kemampuan dan waktu.', 'Target realistis tetap menantang.'), item('Relevant', 'Hubungkan target dengan minat dan prospek PPLG.', 'Alasan yang kuat menjaga motivasi.'), item('Time-bound', 'Tetapkan batas waktu per semester atau tahun.', 'Tenggat mengubah niat menjadi aksi.')], feedback: 'SMART membuat rencana minat dapat diperiksa dan diperbaiki.' },
      { id: 'or06-first-step', kind: 'scenario', title: 'Tentukan langkah terukur', instruction: 'Pilih tindakan awal yang paling mudah dibuktikan.', items: [item('Minat frontend', 'Buat satu halaman profil responsif bulan ini.', 'Karya kecil adalah bukti belajar yang terukur.'), item('Minat data', 'Selesaikan latihan SQL dan catat hasilnya.', 'Latihan terarah membangun fondasi data.'), item('Minat UI/UX', 'Rancang ulang satu layar aplikasi di Figma.', 'Prototipe menunjukkan proses desain.'), item('Minat game', 'Buat mekanik gerak sederhana di engine.', 'Mulai dari satu interaksi yang dapat dimainkan.'), item('Minat QA', 'Tulis lima skenario uji untuk aplikasi pilihan.', 'Kasus uji melatih cara berpikir kualitas.')], feedback: 'Langkah pertama terbaik memiliki hasil yang dapat dilihat dan tenggat jelas.' }
    ]
  },
  'orientasi-pplg-07-mind-map-profesi-pplg': {
    slug: 'orientasi-pplg-07-mind-map-profesi-pplg', eyebrow: 'OR-01 · Mind Map', title: 'Visualisasi Mind Map Profesi', summary: 'Susun hubungan profesi PPLG dalam peta yang mudah dibaca.',
    activities: [
      { id: 'or07-branches', kind: 'explore', title: 'Jelajah cabang mind map', instruction: 'Kenali cabang yang membuat peta profesi informatif.', items: [item('Profesi pusat', 'Topik utama: Profesi PPLG.', 'Pusat menjaga seluruh cabang tetap fokus.'), item('Tugas utama', 'Ringkas tanggung jawab tiap profesi.', 'Gunakan kata kunci, bukan paragraf panjang.'), item('Tools', 'Catat software atau bahasa yang dipakai.', 'Tools memperjelas kebutuhan kompetensi.'), item('Hasil karya', 'Tampilkan contoh produk dari peran tersebut.', 'Contoh menghubungkan peran dengan dampak.'), item('Minat pribadi', 'Tandai profesi yang ingin dieksplorasi.', 'Penandaan membantu refleksi karier.')], feedback: 'Mind map yang baik memakai hierarki dan kata kunci yang mudah dipindai.' },
      { id: 'or07-relationships', kind: 'checklist', title: 'Cek hubungan node', instruction: 'Periksa keterbacaan hubungan antaride pada mind map.', items: [item('Garis penghubung', 'Setiap cabang terhubung ke topik yang tepat.', 'Garis menunjukkan hubungan ide.'), item('Hierarki jelas', 'Node umum berada dekat pusat, rincian di luar.', 'Hierarki mencegah peta menjadi datar.'), item('Warna pembeda', 'Gunakan warna konsisten untuk kategori.', 'Warna membantu navigasi visual.'), item('Label ringkas', 'Pakai frasa singkat yang mudah dibaca.', 'Label ringkas menjaga peta tidak padat.'), item('Keterkaitan profesi', 'Hubungkan peran yang berkolaborasi.', 'Kolaborasi memperlihatkan ekosistem kerja.')], feedback: 'Hubungan yang rapi membuat pembaca memahami peta tanpa penjelasan panjang.' }
    ]
  },
  'orientasi-pplg-08-finalisasi-validasi-or01': {
    slug: 'orientasi-pplg-08-finalisasi-validasi-or01', eyebrow: 'OR-01 · Validasi Evidence', title: 'Finalisasi Evidence OR-01', summary: 'Audit kelengkapan, nama file, dan akses portofolio Sprint 1.',
    activities: [
      { id: 'or08-audit', kind: 'checklist', title: 'Audit evidence', instruction: 'Periksa dua karya sebelum diajukan untuk validasi.', items: [item('Mind map profesi', 'Siapkan PDF mind map profesi PPLG.', 'Ini evidence pertama OR-01.'), item('Rencana minat', 'Siapkan PDF rencana minat belajar tiga tahun.', 'Roadmap perlu berisi alasan dan target.'), item('Kelengkapan profesi', 'Pastikan profesi, tugas, dan tools terbaca.', 'Rubrik menghargai isi yang lengkap.'), item('Keterbacaan visual', 'Periksa tata letak, warna, dan teks.', 'Evidence harus nyaman dibaca.'), item('Folder rapi', 'Satukan karya dalam folder OR-01.', 'Struktur rapi memudahkan guru memvalidasi.')], feedback: 'Evidence kuat memadukan isi yang lengkap dan presentasi yang rapi.' },
      { id: 'or08-validation', kind: 'sequence', title: 'Urutkan validasi file dan akses', instruction: 'Susun langkah agar guru dapat membuka evidence tanpa hambatan.', items: [item('Ekspor PDF', 'Simpan karya dalam format PDF.', 'PDF menjaga tampilan dokumen.'), item('Terapkan nama file', 'Gunakan konvensi nama evidence yang disepakati.', 'Nama konsisten memudahkan identifikasi.'), item('Unggah ke folder', 'Masukkan kedua PDF ke folder OR-01.', 'Folder menjadi tempat evidence terpusat.'), item('Atur Public Viewer', 'Pastikan link dapat dibuka tanpa Access Denied.', 'Akses adalah bagian dari rubrik.'), item('Uji link', 'Buka link dari mode lain sebelum mengirim.', 'Pengujian akhir mencegah evidence tidak terbaca.')], feedback: 'File yang bagus tetap harus dapat diakses oleh penilai.' }
    ]
  },
  'orientasi-pplg-09-app-audit-produk-digital': {
    slug: 'orientasi-pplg-09-app-audit-produk-digital', eyebrow: 'OR-02 · App Audit', title: 'Audit Produk Digital', summary: 'Nilai aplikasi sebagai analis, bukan hanya pengguna pasif.',
    activities: [
      { id: 'or09-lenses', kind: 'explore', title: 'Jelajah lensa audit', instruction: 'Gunakan setiap lensa untuk mengamati aplikasi pilihan.', items: [item('Fungsi utama', 'Identifikasi masalah yang diselesaikan aplikasi.', 'Fungsi menjelaskan alasan aplikasi digunakan.'), item('Keunggulan', 'Catat bagian yang membantu pengguna.', 'Keunggulan perlu contoh yang nyata.'), item('Kekurangan', 'Temukan hambatan atau bagian yang membingungkan.', 'Kritik harus spesifik, bukan sekadar suka/tidak suka.'), item('Kepuasan pengguna', 'Amati alasan pengguna ingin kembali memakai aplikasi.', 'Retensi berkaitan dengan manfaat dan kenyamanan.'), item('Profesi di balik fitur', 'Hubungkan fitur dengan frontend, backend, atau UI/UX.', 'Produk digital adalah hasil kolaborasi PPLG.')], feedback: 'Audit yang baik menimbang fungsi, pengalaman, serta peluang perbaikan.' },
      { id: 'or09-journey', kind: 'scenario', title: 'Temukan masalah user journey', instruction: 'Baca alur pengguna lalu rumuskan temuan yang dapat diuji.', items: [item('Registrasi berhenti', 'Pengguna bingung karena tombol lanjut tidak terlihat.', 'Catat layar dan dampak pada alur.'), item('Pencarian lambat', 'Hasil baru muncul setelah waktu lama.', 'Masalah ini menyentuh fungsi dan kepuasan.'), item('Checkout berulang', 'Alamat harus diisi kembali saat membeli.', 'Langkah ekstra dapat menurunkan kenyamanan.'), item('Notifikasi berlebih', 'Pengguna menerima pesan yang tidak relevan.', 'Evaluasi manfaat dan kontrol pengguna.'), item('Menu tidak konsisten', 'Ikon sama memiliki arti berbeda pada layar lain.', 'Konsistensi mendukung user journey.')], feedback: 'Temuan audit perlu menunjuk momen pengguna, masalah, dan dampaknya.' }
    ]
  },
  'orientasi-pplg-10-ui-ux-fungsi-produk': {
    slug: 'orientasi-pplg-10-ui-ux-fungsi-produk', eyebrow: 'OR-02 · Anatomi Produk', title: 'UI, UX, dan Fungsi Produk', summary: 'Bedakan tampilan, pengalaman, dan layanan sistem saat membandingkan produk.',
    activities: [
      { id: 'or10-dimensions', kind: 'explore', title: 'Jelajah tiga dimensi', instruction: 'Buka tiap dimensi sebelum mengevaluasi aplikasi.', items: [item('UI', 'Warna, ikon, tipografi, dan tata letak layar.', 'UI adalah elemen yang pengguna lihat.'), item('UX', 'Kelancaran alur dan rasa nyaman saat memakai.', 'UX menilai pengalaman dari awal hingga tujuan.'), item('Fungsi', 'Layanan seperti pembayaran, pencarian, atau penyimpanan data.', 'Fungsi memastikan produk benar-benar bekerja.')], feedback: 'Satu masalah aplikasi dapat berada di UI, UX, fungsi, atau gabungannya.' },
      { id: 'or10-evaluation', kind: 'scenario', title: 'Evaluasi desain produk', instruction: 'Tentukan dimensi utama dari setiap temuan komparasi.', items: [item('Teks tombol sulit dibaca', 'Kontras warna tombol terlalu rendah.', 'Ini terutama masalah UI.'), item('Pesanan sulit dibatalkan', 'Pengguna tidak menemukan langkah pembatalan.', 'Ini terutama masalah UX.'), item('Pembayaran gagal diproses', 'Tombol bekerja tetapi transaksi tidak tercatat.', 'Ini terutama masalah fungsi.'), item('Ikon keranjang berbeda', 'Simbol berubah antara dua layar.', 'Konsistensi UI juga memengaruhi UX.'), item('Alamat tidak tersimpan', 'Data pengguna hilang setelah aplikasi ditutup.', 'Fungsi sistem perlu diperiksa.')], feedback: 'Sebutkan alasan penilaian agar komparasi tidak menjadi opini kosong.' }
    ]
  },
  'orientasi-pplg-11-framework-review-6-komponen': {
    slug: 'orientasi-pplg-11-framework-review-6-komponen', eyebrow: 'OR-02 · Framework Review', title: 'Review 6 Komponen', summary: 'Gunakan struktur baku untuk meneliti satu aplikasi secara konsisten.',
    activities: [
      { id: 'or11-components', kind: 'explore', title: 'Jelajah 6 komponen', instruction: 'Kenali peran setiap bagian dalam dokumen review.', items: [item('Identitas produk', 'Nama, kategori, dan konteks aplikasi.', 'Pembaca perlu tahu objek review.'), item('Target pengguna', 'Siapa pengguna utama dan kebutuhannya.', 'Target membantu menilai kecocokan produk.'), item('Fungsi utama', 'Layanan inti dan alur kerjanya.', 'Fungsi menjelaskan nilai produk.'), item('UI/UX', 'Tampilan dan pengalaman pengguna.', 'Gunakan observasi yang spesifik.'), item('Kelebihan-kekurangan', 'Hal yang bekerja baik dan perlu diperbaiki.', 'Seimbangkan apresiasi dan kritik.'), item('Rekomendasi', 'Saran solutif bagi tim pengembang.', 'Saran harus dapat ditindaklanjuti.')], feedback: 'Enam komponen membuat review lengkap dan mudah diikuti.' },
      { id: 'or11-priority', kind: 'sequence', title: 'Susun prioritas review', instruction: 'Urutkan pekerjaan awal sebelum menulis draf review.', items: [item('Pilih satu aplikasi', 'Tetapkan objek yang akan dikaji sampai pertemuan 15.', 'Konsistensi objek membuat bukti saling terhubung.'), item('Catat identitas', 'Tulis nama, kategori, dan konteks produk.', 'Mulai dari informasi yang dapat diverifikasi.'), item('Kenali pengguna', 'Tentukan target pengguna dan kebutuhannya.', 'Sudut pandang pengguna memandu penilaian.'), item('Petakan fungsi', 'Telusuri fitur dan alur utama.', 'Observasi fungsi menjadi dasar analisis.'), item('Kumpulkan bukti', 'Siapkan screenshot dan catatan temuan.', 'Bukti memperkuat review berikutnya.')], feedback: 'Prioritas yang benar memastikan analisis dibangun dari pengamatan, bukan asumsi.' }
    ]
  },
  'orientasi-pplg-12-latihan-analisis-anotasi-visual': {
    slug: 'orientasi-pplg-12-latihan-analisis-anotasi-visual', eyebrow: 'OR-02 · CER Visual', title: 'Analisis dan Anotasi Bukti Visual', summary: 'Bangun temuan review dengan claim, evidence, dan reasoning.',
    activities: [
      { id: 'or12-cer', kind: 'explore', title: 'Jelajah CER', instruction: 'Buka tiga bagian argumen sebelum menulis analisis screenshot.', items: [item('Claim', 'Pernyataan tentang kondisi produk.', 'Claim harus menyebut temuan yang jelas.'), item('Evidence', 'Screenshot atau data yang mendukung claim.', 'Bukti visual membuat temuan dapat diperiksa.'), item('Reasoning', 'Penjelasan logis hubungan claim dan evidence.', 'Reasoning menjelaskan dampak bagi pengguna.')], feedback: 'CER mengubah pendapat menjadi argumen yang dapat dipertanggungjawabkan.' },
      { id: 'or12-visual-evidence', kind: 'scenario', title: 'Pilih bukti visual', instruction: 'Tentukan anotasi yang paling mendukung temuan pada layar aplikasi.', items: [item('Tombol tidak terlihat', 'Lingkari tombol yang menyatu dengan latar.', 'Anotasi perlu menunjuk elemen yang dibahas.'), item('Kolom membingungkan', 'Beri panah pada label yang tidak jelas.', 'Bukti membantu pembaca melihat sumber masalah.'), item('Alur berhasil', 'Tandai urutan layar saat tugas selesai lancar.', 'Evidence positif juga penting dalam review.'), item('Pesan error', 'Kotaki pesan tanpa arahan perbaikan.', 'Tunjukkan dampak error pada pengguna.'), item('Navigasi berulang', 'Nomori langkah yang memaksa pengguna kembali.', 'Urutan visual memperjelas user journey.')], feedback: 'Anotasi harus relevan, tajam, dan terhubung langsung dengan claim.' }
    ]
  },
  'orientasi-pplg-13-review-show-peer-feedback': {
    slug: 'orientasi-pplg-13-review-show-peer-feedback', eyebrow: 'OR-02 · Peer Feedback', title: 'Review Show dan Umpan Balik', summary: 'Sampaikan apresiasi dan saran revisi dengan etika profesional.',
    activities: [
      { id: 'or13-constructive', kind: 'scenario', title: 'Pilih feedback konstruktif', instruction: 'Bandingkan respons yang membantu teman memperbaiki review.', items: [item('Apresiasi spesifik', '“Screenshot-mu jelas menunjukkan masalah tombol.”', 'Apresiasi perlu menyebut hal yang berhasil.'), item('Saran solutif', '“Tambahkan dampak masalah itu bagi pengguna.”', 'Saran yang baik dapat dikerjakan.'), item('Fokus pada karya', 'Bahas dokumen dan temuan, bukan pribadi pembuatnya.', 'Etika review menjaga ruang belajar aman.'), item('Pertanyaan klarifikasi', '“Pengguna mana yang paling terdampak?”', 'Pertanyaan membuka analisis lebih dalam.'), item('Catatan revisi', 'Tuliskan poin agar presenter dapat menindaklanjuti.', 'Feedback perlu meninggalkan jejak tindakan.')], feedback: 'Masukan membangun selalu spesifik, santun, dan berorientasi perbaikan.' },
      { id: 'or13-sandwich', kind: 'sequence', title: 'Susun Sandwich Feedback', instruction: 'Urutkan cara memberi masukan untuk presentasi review teman.', items: [item('Apresiasi', 'Sebutkan satu kekuatan presentasi atau bukti.', 'Mulai dengan observasi positif yang tulus.'), item('Kritik solutif', 'Jelaskan satu bagian yang perlu diperbaiki dan caranya.', 'Kritik harus berfokus pada karya.'), item('Dorongan lanjut', 'Tutup dengan harapan atau manfaat dari revisi.', 'Penutup menjaga motivasi presenter.')], feedback: 'Sandwich Feedback menyeimbangkan penghargaan, perbaikan, dan dukungan.' }
    ]
  },
  'orientasi-pplg-14-finalisasi-dokumen-review': {
    slug: 'orientasi-pplg-14-finalisasi-dokumen-review', eyebrow: 'OR-02 · Finalisasi', title: 'Standarisasi Dokumen Review', summary: 'Satukan temuan menjadi laporan PDF yang rapi dan solutif.',
    activities: [
      { id: 'or14-standard', kind: 'checklist', title: 'Cek standar dokumen', instruction: 'Pastikan laporan final memenuhi struktur dan keterbacaan.', items: [item('Cover resmi', 'Buat halaman awal dengan identitas dokumen.', 'Cover memberi konteks profesional.'), item('Enam komponen', 'Periksa seluruh bagian review telah terisi.', 'Tidak boleh ada komponen yang terlewat.'), item('Screenshot anotasi', 'Gunakan bukti visual tajam dan berlabel.', 'Visual memperkuat analisis UI/UX.'), item('Tipografi rapi', 'Pakai judul dan isi yang konsisten.', 'Keterbacaan memudahkan penilai.'), item('Rekomendasi solutif', 'Tuliskan saran konkret untuk tim developer.', 'Rekomendasi adalah penutup yang dapat ditindaklanjuti.')], feedback: 'Dokumen standar industri memadukan struktur, bukti, dan rekomendasi.' },
      { id: 'or14-quality-action', kind: 'scenario', title: 'Pilih aksi kualitas', instruction: 'Tentukan perbaikan yang paling tepat dari kondisi dokumen.', items: [item('Komponen kosong', 'Bagian target pengguna belum ditulis.', 'Lengkapi komponen sebelum mempercantik tampilan.'), item('Screenshot buram', 'Bukti visual sulit dibaca saat diperbesar.', 'Ganti dengan screenshot yang lebih jelas.'), item('Saran umum', 'Rekomendasi hanya berbunyi “tingkatkan lagi”.', 'Ubah menjadi tindakan teknis atau UX yang spesifik.'), item('Format tidak konsisten', 'Judul dan ukuran huruf berubah-ubah.', 'Terapkan gaya dokumen yang seragam.'), item('Masukan teman belum diterapkan', 'Catatan peer feedback masih relevan.', 'Tindak lanjuti sebelum ekspor PDF.')], feedback: 'Prioritaskan perbaikan yang meningkatkan kelengkapan dan keterbacaan evidence.' }
    ]
  },
  'orientasi-pplg-15-pengumpulan-validasi-or02': {
    slug: 'orientasi-pplg-15-pengumpulan-validasi-or02', eyebrow: 'OR-02 · Pengumpulan', title: 'Validasi Portofolio OR-02', summary: 'Pastikan laporan review siap diakses dan dinilai.',
    activities: [
      { id: 'or15-readiness', kind: 'checklist', title: 'Cek kesiapan portofolio', instruction: 'Audit evidence sebelum pengumpulan akhir Sprint 2.', items: [item('Enam komponen lengkap', 'Review mencakup identitas hingga rekomendasi.', 'Kelengkapan menjadi dasar penilaian.'), item('Analisis fungsi', 'Jelaskan alur fungsi utama produk.', 'Tambahkan kasus nyata bila memungkinkan.'), item('Bukti UI/UX', 'Sertakan screenshot beranotasi.', 'Bukti visual menguatkan observasi.'), item('Rekomendasi solutif', 'Berikan saran yang logis dan dapat diterapkan.', 'Hindari saran yang terlalu umum.'), item('PDF final', 'Siapkan satu file laporan yang siap unggah.', 'Pastikan file dapat dibuka sebelum dikirim.')], feedback: 'Kesiapan portofolio berarti isi, bukti, dan format sudah tervalidasi.' },
      { id: 'or15-submission', kind: 'sequence', title: 'Urutkan pengiriman evidence', instruction: 'Susun prosedur pengumpulan agar evidence OR-02 valid.', items: [item('Periksa nama file', 'Gunakan format [NIS]_[NamaLengkap]_OR-02_ReviewAplikasi.pdf.', 'Nama file memudahkan identifikasi.'), item('Unggah PDF', 'Masukkan file ke folder Skill_Passport_RPL/OR-02.', 'Folder yang benar menjaga evidence terorganisir.'), item('Atur akses', 'Pilih Anyone with the link can view.', 'Penilai harus dapat membuka file.'), item('Salin link', 'Ambil tautan file yang sudah dapat diakses.', 'Link menjadi bukti lokasi evidence.'), item('Klaim penyelesaian', 'Masukkan link pada rekap atau modul.', 'Pengiriman selesai setelah link tervalidasi.')], feedback: 'Validasi akses adalah langkah penting sebelum menyatakan evidence terkumpul.' }
    ]
  },
  'orientasi-pplg-16-rekap-skill-clinic-refleksi': {
    slug: 'orientasi-pplg-16-rekap-skill-clinic-refleksi', eyebrow: 'OR-01 & OR-02 · Rekap', title: 'Skill Clinic dan Refleksi Akhir', summary: 'Baca pencapaian semester lalu tetapkan komitmen belajar berikutnya.',
    activities: [
      { id: 'or16-achievement', kind: 'explore', title: 'Jelajah peta pencapaian', instruction: 'Hubungkan evidence semester dengan level Skill Passport.', items: [item('OR-01', 'Mind map profesi dan rencana minat diri.', 'Evidence ini merekam wawasan dunia kerja.'), item('OR-02', 'Laporan review enam komponen dan screenshot anotasi.', 'Evidence ini menunjukkan kemampuan analisis produk.'), item('Level 2', 'Mencoba sebagai target capaian awal.', 'Level ini menandai praktik kompetensi dasar.'), item('Skill Clinic', 'Ruang untuk melihat kekuatan dan area latihan.', 'Refleksi membantu menentukan perbaikan.'), item('Semester genap', 'Tahap berikutnya menuju dunia coding.', 'Capaian awal menjadi bekal pembelajaran baru.')], feedback: 'Peta pencapaian membantu melihat perjalanan belajar secara utuh.' },
      { id: 'or16-commitment', kind: 'scenario', title: 'Tentukan komitmen berikutnya', instruction: 'Pilih tindak lanjut berdasarkan evidence dan refleksi.', items: [item('Mind map belum rapi', 'Perbaiki hierarki dan keterbacaan evidence OR-01.', 'Komitmen perlu menunjuk karya yang nyata.'), item('CER masih lemah', 'Latih satu claim dengan screenshot dan reasoning tiap minggu.', 'Rutinitas kecil memperkuat analisis.'), item('Minat frontend', 'Bangun mini proyek HTML/CSS sebagai langkah semester genap.', 'Hubungkan minat dengan produk yang dapat ditunjukkan.'), item('Butuh feedback', 'Minta satu teman meninjau portofolio sebelum revisi.', 'Kolaborasi mempercepat perbaikan.'), item('Target baru', 'Tetapkan skill dan bukti capaian dengan tenggat.', 'Komitmen terukur lebih mudah diwujudkan.')], feedback: 'Komitmen terbaik berangkat dari refleksi dan menghasilkan bukti kemajuan.' }
    ]
  }
};

const ORIENTASI_LEARNING_CONTEXTS: Record<ActiveInteractiveOrientasiSlug, LearningContext> = {
  'orientasi-pplg-02-profesi-peluang-karier': {
    hero: { code: 'OR-01', sprint: 'Sprint 1 · Pertemuan 2', context: 'Satu produk digital lahir dari delapan profesi yang bekerja dengan output dan tanggung jawab berbeda.', objective: 'Kenali peran PPLG lalu telusuri handoff kebutuhan fitur dari UI/UX, frontend, backend, QA, hingga layanan siap rilis.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Gunakan contoh aplikasi yang kalian pakai setiap hari untuk melihat bahwa desain, kode, pengujian, dan infrastruktur adalah kerja satu tim.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-03-ekosistem-industri-pplg': {
    hero: { code: 'OR-01', sprint: 'Sprint 1 · Pertemuan 3', context: 'Industri PPLG hadir dalam startup, software house, enterprise, pekerjaan freelancer, dan tim internal lembaga.', objective: 'Bandingkan ritme kerja, model proyek, serta kebutuhan skill agar pilihan konteks karier didasarkan pada alasan yang nyata.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Tidak ada lingkungan kerja yang paling unggul untuk semua orang; kenali cara kalian belajar, berkolaborasi, dan memberi dampak.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-04-matriks-skill-jenjang-karier': {
    hero: { code: 'OR-01', sprint: 'Sprint 1 · Pertemuan 4 & 5', context: 'Karier PPLG tumbuh melalui hard skill, soft skill, dan pengalaman bertahap dari kelas 10 hingga peran profesional.', objective: 'Petakan bekal teknis dan kolaboratif kalian dalam roadmap kesiapan karier yang berangkat dari fondasi belajar.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Portofolio yang kuat bukan hanya menunjukkan kemampuan teknis, tetapi juga bukti komunikasi, ketekunan, dan kerja tim.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-05-job-fair-kelas': {
    hero: { code: 'OR-01', sprint: 'Sprint 1 · Pertemuan 5', context: 'Job fair kelas menjadi ruang untuk mempresentasikan profesi PPLG lewat booth, karya, tools, dan dialog antarteman.', objective: 'Siapkan booth profesi yang jujur dan informatif, lalu gunakan pertanyaan wawancara untuk mengeksplorasi realitas kerja.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Datanglah ke setiap booth dengan rasa ingin tahu; pertanyaan yang spesifik sering memberi arah belajar yang lebih jelas daripada tebakan.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-06-rencana-minat-awal': {
    hero: { code: 'OR-01', sprint: 'Sprint 1 · Pertemuan 6', context: 'Minat karier perlu diterjemahkan menjadi target SMART dan tindakan awal yang menghasilkan bukti belajar selama tiga tahun.', objective: 'Rumusan minat menjadi rencana tiga tahun dengan target spesifik, terukur, realistis, relevan, dan berbatas waktu.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Mulailah dari karya kecil yang selesai tepat waktu, karena bukti kemajuan sederhana lebih berarti daripada rencana besar yang tidak dijalankan.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-07-mind-map-profesi-pplg': {
    hero: { code: 'OR-01', sprint: 'Sprint 1 · Pertemuan 7', context: 'Mind map profesi menghubungkan node peran, tools, hasil karya, dan relasi kolaborasi dalam ekosistem PPLG.', objective: 'Bangun peta visual yang mudah dibaca lalu audit hierarki, label, garis penghubung, dan keterkaitan antarnode.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Peta yang baik membantu orang lain memahami ide kalian tanpa penjelasan panjang, maka utamakan hubungan yang jelas daripada hiasan.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-08-finalisasi-validasi-or01': {
    hero: { code: 'OR-01', sprint: 'Sprint 1 · Pertemuan 8', context: 'Evidence OR-01 harus lengkap, tertata, berbentuk PDF, dan dapat dibuka publik oleh guru tanpa hambatan akses.', objective: 'Validasi mind map dan rencana minat melalui format evidence, nama file, folder, akses Public Viewer, serta pengujian tautan.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Karya yang baik belum siap dinilai bila penilai tidak dapat membukanya; uji tautan dari sudut pandang orang lain sebelum mengumpulkan.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-09-app-audit-produk-digital': {
    hero: { code: 'OR-02', sprint: 'Sprint 2 · Pertemuan 9', context: 'App Audit mengajak kalian menilai aplikasi melalui target pengguna, fungsi utama, UI/UX, kelebihan, dan kekurangannya.', objective: 'Gunakan lensa audit untuk menemukan masalah user journey serta dampaknya, bukan sekadar memberi penilaian suka atau tidak suka.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Amati aplikasi seperti analis: catat siapa penggunanya, apa yang ingin dilakukan, dan bagian mana yang membantu atau menghambat mereka.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-10-ui-ux-fungsi-produk': {
    hero: { code: 'OR-02', sprint: 'Sprint 2 · Pertemuan 10', context: 'Produk digital dapat dibandingkan dari UI yang terlihat, UX yang dirasakan, dan fungsi sistem yang harus bekerja benar.', objective: 'Bedakan tiga dimensi tersebut saat membandingkan aplikasi agar setiap temuan memiliki alasan penilaian yang tepat.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Jangan berhenti pada kalimat “aplikasinya bagus”; jelaskan apakah kekuatan atau masalahnya berada pada tampilan, alur, atau fungsi.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-11-framework-review-6-komponen': {
    hero: { code: 'OR-02', sprint: 'Sprint 2 · Pertemuan 11', context: 'Framework review enam komponen menyusun identitas produk, target pengguna, fungsi, UI/UX, temuan, dan rekomendasi.', objective: 'Gunakan struktur review untuk memilih prioritas temuan berdasarkan observasi aplikasi dan bukti yang dapat diverifikasi.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Review yang profesional dibangun dari pengamatan yang runtut; pilih satu aplikasi, pahami penggunanya, lalu kumpulkan bukti sebelum menyimpulkan.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-12-latihan-analisis-anotasi-visual': {
    hero: { code: 'OR-02', sprint: 'Sprint 2 · Pertemuan 12', context: 'Claim–Evidence–Reasoning membantu kalian menjadikan screenshot positif maupun negatif sebagai argumen review yang dapat diperiksa.', objective: 'Rangkai claim, bukti visual beranotasi, dan reasoning untuk menjelaskan dampak temuan terhadap pengalaman pengguna.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Screenshot bukan hiasan laporan: tandai elemen yang dibahas dan jelaskan mengapa elemen itu membantu atau mengganggu pengguna.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-13-review-show-peer-feedback': {
    hero: { code: 'OR-02', sprint: 'Sprint 2 · Pertemuan 13', context: 'Review show melatih apresiasi, saran yang dapat ditindaklanjuti, dan Sandwich Feedback untuk menyempurnakan karya teman.', objective: 'Sampaikan umpan balik secara santun dengan urutan apresiasi, kritik solutif, dan dorongan untuk revisi.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Berikan komentar pada karya, bukan pribadi pembuatnya; masukan yang spesifik dan hangat membuat teman berani memperbaiki analisanya.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-14-finalisasi-dokumen-review': {
    hero: { code: 'OR-02', sprint: 'Sprint 2 · Pertemuan 14', context: 'Dokumen review akhir perlu memenuhi standar struktur, layout, screenshot anotasi, dan rekomendasi yang solutif.', objective: 'Audit kualitas laporan lalu pilih tindakan perbaikan yang meningkatkan kelengkapan evidence dan keterbacaan dokumen.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Rapikan isi sebelum kosmetik: komponen yang lengkap dan bukti yang jelas akan membuat rekomendasi kalian lebih meyakinkan.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-15-pengumpulan-validasi-or02': {
    hero: { code: 'OR-02', sprint: 'Sprint 2 · Pertemuan 15', context: 'Portofolio OR-02 dinyatakan siap bila evidence review lengkap, PDF berada di folder benar, dan tautan publik dapat diverifikasi.', objective: 'Jalankan prosedur validasi file, tautan, akses publik, dan klaim penyelesaian sebelum menyatakan portofolio terkumpul.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Pengumpulan bukan sekadar mengunggah file; pastikan nama, lokasi, akses, dan link evidence benar-benar siap digunakan oleh penilai.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
  'orientasi-pplg-16-rekap-skill-clinic-refleksi': {
    hero: { code: 'OR-01 & OR-02', sprint: 'Penutup Semester · Pertemuan 16', context: 'Skill Passport merekap level capaian OR-01 dan OR-02, dilanjutkan Skill Clinic serta refleksi atas perjalanan semester pertama.', objective: 'Gunakan evidence dan refleksi untuk menentukan komitmen perbaikan yang terukur menuju pembelajaran coding pada semester berikutnya.' },
    teacherMessage: { title: 'Pesan Guru Pengampu RPL', message: 'Rayakan capaian kalian dengan jujur, lalu pilih satu kebiasaan dan satu karya yang akan diperbaiki agar semester berikutnya dimulai lebih kuat.', signature: 'Agung Gumelar Saputra, S.Tr.T. · Guru Pengampu RPL' },
  },
};

const SEQUENCE_CORRECT_ORDERS: Record<string, readonly string[]> = {
  'or02-handoff': ['Product Manager', 'UI/UX Designer', 'Frontend/Mobile Developer', 'Backend Developer', 'QA Engineer', 'DevOps Engineer'],
  'or04-roadmap': ['Fondasi kelas 10', 'Pendalaman kelas 11', 'Portofolio kelas 12', 'Intern/Junior', 'Mid/Senior/Lead'],
  'or08-validation': ['Ekspor PDF', 'Terapkan nama file', 'Unggah ke folder', 'Atur Public Viewer', 'Uji link'],
  'or11-priority': ['Pilih satu aplikasi', 'Catat identitas', 'Kenali pengguna', 'Petakan fungsi', 'Kumpulkan bukti'],
  'or13-sandwich': ['Apresiasi', 'Kritik solutif', 'Dorongan lanjut'],
  'or15-submission': ['Periksa nama file', 'Unggah PDF', 'Atur akses', 'Salin link', 'Klaim penyelesaian'],
};

export function getOrientasiInteractiveMaterial(slug: OrientasiSlug): InteractiveMaterial {
  const material = ORIENTASI_INTERACTIVE_MATERIALS[slug];
  const learningContext = ORIENTASI_LEARNING_CONTEXTS[slug as ActiveInteractiveOrientasiSlug];
  if (!material || !learningContext) throw new Error(`Materi interaktif belum tersedia untuk ${slug}.`);
  const activities = material.activities.map((activity) => (
    activity.kind === 'sequence'
      ? { ...activity, correctOrder: SEQUENCE_CORRECT_ORDERS[activity.id] }
      : activity
  )) as InteractiveMaterial['activities'];

  return {
    ...material,
    ...learningContext,
    activities,
    scenes: activities,
  };
}
