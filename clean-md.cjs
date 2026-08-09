const fs = require('fs');
const path = require('path');

const dir = 'd:/DATA/PROJEK/agunggumelarsaputra.com/src/content/pembelajaran';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'orientasi-pplg-01-pengantar-skill-passport.md');

const langkahSelanjutnya = `---

## ⚡ Langkah Selanjutnya: Aktivitas Belajar

Gunakan tab di bagian atas modul ini untuk menyelesaikan tahapan belajar kalian:

1. 📝 **Tab 2 (Form LKPD Interaktif)**: Isi form secara langsung pada sistem dan sertakan URL Google Drive portofolio jika diperlukan (+25 XP).
2. 💭 **Tab 3 (Jurnal Refleksi)**: Tuliskan respon refleksi pembelajaran mandiri kalian yang akan dibaca langsung oleh Guru (+15 XP).
3. 🎯 **Tab 4 (Panduan Kriteria Guru)**: Pelajari matriks KKTP untuk memastikan karya portofolio kalian mencapai target minimal Level 2.`;

let updatedCount = 0;

for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Find where the static forms begin
  const match = content.match(/## (?:📝 )?Lembar Kerja Peserta Didik|## (?:📝 )?LKPD|### A\. Identitas Peserta Didik|## ✅ Checklist Ketercapaian/i);
  
  if (match) {
    // Check if there was a Catatan Guru Pengampu at the end of the original text
    const origContent = fs.readFileSync(filepath, 'utf8');
    const gm = origContent.match(/## 💡 Catatan Guru Pengampu[\s\S]*?(?=##|$)/i);
    let guruNote = '';
    if (gm) {
      guruNote = '\n\n---\n\n' + gm[0].trim();
    }
    
    // Truncate the file at that point
    content = content.substring(0, match.index).trimEnd();
    
    // Add the new standard closing
    content += '\n\n' + langkahSelanjutnya.trim();
    
    if (guruNote) {
       content += guruNote;
    }
    
    content += '\n';
    
    fs.writeFileSync(filepath, content);
    console.log('Updated: ' + file);
    updatedCount++;
  } else {
    // If we didn't find the LKPD header, just append the Langkah Selanjutnya if it doesn't already have it
    if (!content.includes('Langkah Selanjutnya: Aktivitas Belajar')) {
       content = content.trimEnd() + '\n\n' + langkahSelanjutnya.trim() + '\n';
       fs.writeFileSync(filepath, content);
       console.log('Appended to: ' + file);
       updatedCount++;
    }
  }
}

console.log('Total files updated: ' + updatedCount);
