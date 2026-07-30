import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /"pengabdi setan": \{ id: "467012", year: 2017 \},/g,
  '"pengabdi setan": { id: "467012", year: 2017 },\n          "jumbo": { id: "1049082" },'
);
fs.writeFileSync('server.ts', code);
