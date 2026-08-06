import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

code = code.replace(
  "{ id: 'idlix', label: 'Server IDLIX', desc: 'Server utama film & serial Barat/Indo' },",
  "{ id: 'idlix', label: 'Server IDLIX', desc: 'Server utama film & serial Barat/Indo' },\n                      { id: 'lk21', label: 'Server LK21 🇮🇩', desc: 'Lengkap untuk film Indonesia & Asia' },"
);

code = code.replace(
  "{ id: 'strigil', label: 'Strigil (VIP)' },",
  "{ id: 'strigil', label: 'Strigil (VIP)' },\n                { id: 'lk21', label: 'LK21' },"
);

fs.writeFileSync('src/components/VideoModal.tsx', code);
console.log("Patched successfully");
