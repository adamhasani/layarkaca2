const fs = require('fs');
let content = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

content = content.replace(/Moviebox \(Anti-Lag\)/g, 'Moviebox');
content = content.replace(/Server Moviebox \(Anti-Lag ⚡\)/g, 'Server Moviebox ⚡');

fs.writeFileSync('src/components/VideoModal.tsx', content);
console.log("Anti-lag removed");
