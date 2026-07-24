const fs = require('fs');
let content = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

content = content.replace(/grid grid-cols-3 gap-1 p-1/, 'grid grid-cols-2 gap-1 p-1');
content = content.replace(/Pengaturan Video \(Server, Quality, Subtitle\)/g, 'Pengaturan Video (Quality, Subtitle)');

fs.writeFileSync('src/components/VideoModal.tsx', content);
console.log("Settings UI updated successfully.");
