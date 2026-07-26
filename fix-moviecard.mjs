import fs from 'fs';
const apiKey = 'b2a4729f27306f85ff87e79c09939f8d';

async function run() {
  let content = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/'([^']+)':\s*'https:\/\/image\.tmdb\.org\/t\/p\/w500\/qJ2tW6WMUDux911r6m7haRef0WH\.jpg'/);
    if (m) {
      const keyword = m[1];
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(keyword)}&language=en-US`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const p = data.results[0].poster_path;
        if (p) {
          lines[i] = lines[i].replace('https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', `https://image.tmdb.org/t/p/w500${p}`);
        }
      }
    } else if (lines[i].includes('qJ2tW6WMUDux911r6m7haRef0WH.jpg') && lines[i].includes(',')) {
      // it's in the array of verifiedMoviePosters
      // just remove the line
      lines[i] = lines[i].replace(/'.*qJ2tW6WMUDux911r6m7haRef0WH\.jpg',?/, '');
    }
  }
  fs.writeFileSync('src/components/MovieCard.tsx', lines.join('\n'));
  console.log('Fixed MovieCard.tsx');
}
run();
