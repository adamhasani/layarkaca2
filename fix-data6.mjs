import fs from 'fs';
let content = fs.readFileSync('src/data.ts', 'utf8');

content = content.replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/[^']+/g, (match) => {
  return 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'; // The Dark Knight poster as generic placeholder
});
fs.writeFileSync('src/data.ts', content);
console.log('Done script 6!');
