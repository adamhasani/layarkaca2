import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

code = code.replace(
  '<iframe \n                  src={detailedMovie.embedUrl}',
  '<iframe \n                  key={detailedMovie.embedUrl}\n                  src={detailedMovie.embedUrl}'
);

fs.writeFileSync('src/components/VideoModal.tsx', code);
