import fs from 'fs';
const apiKey = 'b2a4729f27306f85ff87e79c09939f8d';

async function run() {
  let content = fs.readFileSync('src/data.ts', 'utf8');
  let blocks = content.split('slug: ');
  for (let i = 1; i < blocks.length; i++) {
    let block = blocks[i];
    if (block.includes('A4j8S6moJS2zNtRR8oWF08gRnL5.jpg')) {
      const titleMatch = block.match(/title:\s*'([^']+)'/);
      if (titleMatch) {
        let cleanTitle = titleMatch[1].replace(/\(\d{4}\)/, '').trim();
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=id-ID`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
           const p = data.results[0].poster_path;
           if (p) {
             const newUrl = `https://image.tmdb.org/t/p/w500${p}`;
             blocks[i] = block.replaceAll('https://image.tmdb.org/t/p/w500/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg', newUrl);
             console.log('Replaced', titleMatch[1]);
           }
        }
      }
    }
  }
  fs.writeFileSync('src/data.ts', blocks.join('slug: '));
}
run();
