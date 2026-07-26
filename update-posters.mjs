import fs from 'fs';
const apiKey = 'b2a4729f27306f85ff87e79c09939f8d';

async function run() {
  let content = fs.readFileSync('src/data.ts', 'utf8');
  let lines = content.split('\n');
  let currentTitle = '';
  let updatedCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const titleMatch = lines[i].match(/title:\s*'([^']+)'/);
    if (titleMatch) currentTitle = titleMatch[1];
    
    if (lines[i].includes('qJ2tW6WMUDux911r6m7haRef0WH.jpg') && currentTitle) {
      let cleanTitle = currentTitle.replace(/\(\d{4}\)/, '').trim();
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=id-ID`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const p = data.results[0].poster_path;
        const b = data.results[0].backdrop_path;
        if (p) {
          const posterStr = `https://image.tmdb.org/t/p/w500${p}`;
          const bannerStr = b ? `https://image.tmdb.org/t/p/original${b}` : posterStr;
          
          if (lines[i].includes('posterUrl:')) {
            lines[i] = lines[i].replace(/posterUrl:\s*'[^']+'/, `posterUrl: '${posterStr}'`);
          } else if (lines[i].includes('bannerUrl:')) {
            lines[i] = lines[i].replace(/bannerUrl:\s*'[^']+'/, `bannerUrl: '${bannerStr}'`);
          }
          updatedCount++;
        }
      }
    }
  }
  
  fs.writeFileSync('src/data.ts', lines.join('\n'));
  console.log(`Successfully updated ${updatedCount} lines with actual TMDB posters!`);
}
run();
