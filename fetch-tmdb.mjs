import fs from 'fs';
const apiKey = 'b2a4729f27306f85ff87e79c09939f8d';

async function run() {
  let content = fs.readFileSync('src/data.ts', 'utf8');
  const matches = [...content.matchAll(/title:\s*'([^']+)',\s*type:(?:[^p]+)posterUrl:\s*'([^']+)',\s*bannerUrl:\s*'([^']+)'/g)];
  
  for (const m of matches) {
    const fullBlock = m[0];
    const title = m[1];
    let cleanTitle = title.replace(/\(\d{4}\)/, '').trim();
    if (m[2].includes('A4j8S6moJS2zNtRR8oWF08gRnL5.jpg')) {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=id-ID`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const p = data.results[0].poster_path;
        if (p) {
          const newUrl = `https://image.tmdb.org/t/p/w500${p}`;
          content = content.replace(m[2], newUrl);
          content = content.replace(m[3], newUrl);
          console.log('Replaced', title);
        }
      }
    }
  }
  fs.writeFileSync('src/data.ts', content);
}
run();
