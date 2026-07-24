const fs = require('fs');
let content = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

content = content.replace(/\/\* Anti-Lag Notice for Moviebox \*\//g, '/* Notice for Moviebox */');
content = content.replace(/⚡ Anti-Lag Active/g, '⚡ Lancar & Cepat');

fs.writeFileSync('src/components/VideoModal.tsx', content);
console.log("Anti-lag notice text updated");
