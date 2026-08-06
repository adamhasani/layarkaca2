import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

const targetStr = "{ id: 'videasy', label: 'Server Videasy 🚀', desc: 'Server alternatif, cepat, andal & jernih' }";
const replacement = "{ id: 'videasy', label: 'Server Videasy 🚀', desc: 'Cepat & andal (Subtitle bisa diatur di Player)' }";

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/components/VideoModal.tsx', code);
console.log("Patched successfully");
