import fs from 'fs';
const apiKey = '15d2ea6d0dc1d476efbca3eba2b9bbfb';

async function replaceInFile(path, query) {
  let content = fs.readFileSync(path, 'utf8');
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
     const p = data.results[0].poster_path;
     if (p) {
        content = content.replaceAll('https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', `https://image.tmdb.org/t/p/w500${p}`);
        fs.writeFileSync(path, content);
     }
  }
}
await replaceInFile('src/components/FeaturedHero.tsx', 'Dune Part Two');
await replaceInFile('src/components/VideoModal.tsx', 'Dune Part Two');
console.log('Fixed Fallbacks');
