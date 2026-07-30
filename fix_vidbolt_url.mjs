import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /vidboltUrl = \`https:\/\/vidbolt\.pro\/embed\/movie\/\$\{tmdbId\}\`;/g,
  "vidboltUrl = \`https://vidbolt.pro/movie/\${tmdbId}?autoPlay=true\`;"
);

code = code.replace(
  /vidboltUrl = \`https:\/\/vidbolt\.pro\/embed\/tv\/\$\{tmdbId\}\/\$\{sNum\}\/\$\{eNum\}\`;/g,
  "vidboltUrl = \`https://vidbolt.pro/tv/\${tmdbId}/\${sNum}/\${eNum}?autoPlay=true\`;"
);

fs.writeFileSync('server.ts', code);
