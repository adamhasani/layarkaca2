import fs from 'fs';
const apiKey = 'b2a4729f27306f85ff87e79c09939f8d';

async function run() {
  let content = fs.readFileSync('src/data.ts', 'utf8');
  let blocks = content.split('id: "');
  let updated = 0;
  
  for (let i = 1; i < blocks.length; i++) {
    let block = blocks[i];
    if (block.includes('qJ2tW6WMUDux911r6m7haRef0WH.jpg')) {
      const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch) {
        let cleanTitle = titleMatch[1].replace(/\(\d{4}\)/, '').trim();
        try {
          const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=id-ID`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
             const p = data.results[0].poster_path;
             const b = data.results[0].backdrop_path;
             if (p) {
               const posterStr = `https://image.tmdb.org/t/p/w500${p}`;
               const bannerStr = b ? `https://image.tmdb.org/t/p/original${b}` : posterStr;
               
               let newBlock = block;
               newBlock = newBlock.replace(/posterUrl:\s*"https:\/\/image\.tmdb\.org\/t\/p\/w500\/qJ2tW6WMUDux911r6m7haRef0WH\.jpg"/g, `posterUrl: "${posterStr}"`);
               newBlock = newBlock.replace(/bannerUrl:\s*"https:\/\/image\.tmdb\.org\/t\/p\/w500\/qJ2tW6WMUDux911r6m7haRef0WH\.jpg"/g, `bannerUrl: "${bannerStr}"`);
               
               // also catch if formatted without quotes on the same line
               newBlock = newBlock.replace(/"https:\/\/image\.tmdb\.org\/t\/p\/w500\/qJ2tW6WMUDux911r6m7haRef0WH\.jpg"/g, `"${posterStr}"`);

               if (newBlock !== block) {
                  blocks[i] = newBlock;
                  updated++;
               }
             }
          }
        } catch(e) {}
      }
    }
  }
  fs.writeFileSync('src/data.ts', blocks.join('id: "'));
  console.log('Fixed', updated);
}
run();
