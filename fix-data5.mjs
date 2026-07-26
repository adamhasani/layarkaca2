import fs from 'fs';
let content = fs.readFileSync('src/data.ts', 'utf8');

content = content.replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/[^']+/g, (match) => {
  return 'https://image.tmdb.org/t/p/w500/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg'; // generic placeholder for testing
});
fs.writeFileSync('src/data.ts', content);
console.log('Done!');
