import fs from 'fs';

let content = fs.readFileSync('src/data.ts', 'utf8');
const apiKey = 'cc2bb9df31ba207efbdeeead43657cd3';

const matches = [...content.matchAll(/title:\s*'([^']+)'/g)];

async function run() {
  for (const m of matches) {
    const title = m[1];
    let cleanTitle = title.replace(/\(\d{4}\)/, '').trim();
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=id-ID`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const p = data.results[0].poster_path;
      const b = data.results[0].backdrop_path;
      if (p) {
        // Find the block for this title
        const blockRegex = new RegExp(`title:\\s*'${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[^}]+}`, 'g');
        content = content.replace(blockRegex, (match) => {
          let newMatch = match.replace(/posterUrl:\s*'[^']+'/, `posterUrl: 'https://image.tmdb.org/t/p/w500${p}'`);
          const banner = b ? `https://image.tmdb.org/t/p/original${b}` : `https://image.tmdb.org/t/p/w500${p}`;
          newMatch = newMatch.replace(/bannerUrl:\s*'[^']+'/, `bannerUrl: '${banner}'`);
          return newMatch;
        });
        console.log(`Updated ${title}`);
      }
    }
  }
  fs.writeFileSync('src/data.ts', content, 'utf8');
  console.log('Done!');
}

run();
