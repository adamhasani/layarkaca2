import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

code = code.replace(
  "{ id: 'videasy', label: 'Server Videasy 🚀', desc: 'Cepat & andal (Subtitle bisa diatur di Player)' }",
  "{ id: 'videasy', label: 'Server Videasy 🚀', desc: 'Cepat & andal (Pilih server Cypher di dalam Player jika Subtitle Yoru hilang)' }"
);

fs.writeFileSync('src/components/VideoModal.tsx', code);
console.log("Patched successfully");
