import fs from 'fs';
const apiKey = '15d2ea6d0dc1d476efbca3eba2b9bbfb';

async function run() {
  let content = fs.readFileSync('src/data.ts', 'utf8');
  let blocks = content.split('id: "');
  
  const promises = [];
  let updateCount = 0;
  
  for (let i = 1; i < blocks.length; i++) {
    let block = blocks[i];
    if (block.includes('qJ2tW6WMUDux911r6m7haRef0WH.jpg')) {
      const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch) {
        let cleanTitle = titleMatch[1].replace(/\(\d{4}\)/, '').trim();
        const p = async () => {
            try {
              const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=id-ID`);
              const data = await res.json();
              if (data.results && data.results.length > 0) {
                 const p = data.results[0].poster_path;
                 const b = data.results[0].backdrop_path;
                 if (p) {
                   const posterStr = `https://image.tmdb.org/t/p/w500${p}`;
                   const bannerStr = b ? `https://image.tmdb.org/t/p/original${b}` : posterStr;
                   
                   let newBlock = blocks[i];
                   
                   // Replace posterUrl
                   newBlock = newBlock.replace(
                     /posterUrl:\s*"https:\/\/image\.tmdb\.org\/t\/p\/w500\/qJ2tW6WMUDux911r6m7haRef0WH\.jpg"/g, 
                     `posterUrl: "${posterStr}"`
                   );
                   newBlock = newBlock.replace(
                     /bannerUrl:\s*"https:\/\/image\.tmdb\.org\/t\/p\/w500\/qJ2tW6WMUDux911r6m7haRef0WH\.jpg"/g, 
                     `bannerUrl: "${bannerStr}"`
                   );
                   
                   // Also fallback regex just in case
                   const target = "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg";
                   if (newBlock.includes(target)) {
                       // Replace the first occurrence with poster, second with banner
                       newBlock = newBlock.replace(target, posterStr);
                       newBlock = newBlock.replace(target, bannerStr);
                   }

                   if (newBlock !== blocks[i]) {
                     blocks[i] = newBlock;
                     updateCount++;
                   }
                 }
              }
            } catch(e) {
                console.error(e);
            }
        };
        promises.push(p());
      }
    }
  }
  
  console.log(`Waiting for ${promises.length} requests...`);
  await Promise.all(promises);
  fs.writeFileSync('src/data.ts', blocks.join('id: "'));
  console.log('Fixed everything!', updateCount);
}
run();
