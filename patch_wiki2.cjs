const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /([a-zA-Z0-9_]+)\s*=\s*await\s+enrichResultWithWiki\(\1,\s*cleanQuery\);/g;
code = code.replace(regex, (match, varName) => {
  return `await enrichResultWithWiki(${varName}, cleanQuery);`;
});

fs.writeFileSync('server.ts', code);
console.log('Patched server.ts again');
