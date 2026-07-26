import fs from 'fs';
const apiKey = 'b2a4729f27306f85ff87e79c09939f8d';

async function run() {
  let content = fs.readFileSync('src/data.ts', 'utf8');
  const lines = content.split('\n');
  let currentTitle = '';
  
  for (let i = 0; i < lines.length; i++) {
    const titleMatch = lines[i].match(/title:\s*'([^']+)'/);
    if (titleMatch) {
      currentTitle = titleMatch[1];
    }
    
    if (lines[i].includes('qJ2tW6WMUDux911r6m7haRef0WH.jpg') && currentTitle) {
      let cleanTitle = currentTitle.replace(/\(\d{4}\)/, '').trim();
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=id-ID`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const p = data.results[0].poster_path;
        const b = data.results[0].backdrop_path;
        if (p) {
          if (lines[i].includes('posterUrl:')) {
            lines[i] = lines[i].replace(/posterUrl:\s*'[^']+'/, `posterUrl: 'https://image.tmdb.org/t/p/w500${p}'`);
          } else if (lines[i].includes('bannerUrl:')) {
            const banner = b ? `https://image.tmdb.org/t/p/original${b}` : `https://image.tmdb.org/t/p/w500${p}`;
            lines[i] = lines[i].replace(/bannerUrl:\s*'[^']+'/, `bannerUrl: '${banner}'`);
          }
          console.log(`Updated ${currentTitle}`);
        }
      }
    }
  }
  
  fs.writeFileSync('src/data.ts', lines.join('\n'), 'utf8');
  console.log('Done script!');
}
run();
