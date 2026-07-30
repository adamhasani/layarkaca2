import fs from 'fs';

const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb"; 

async function searchTMDB(query) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=id-ID`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const match = data.results.find(r => r.poster_path);
      if (match) {
        return `https://image.tmdb.org/t/p/w500${match.poster_path}`;
      }
    }
  } catch (e) {
  }
  return null;
}

const titles = [
  "jumbo",
  "kkn di desa penari",
  "siksa kubur",
  "pengabdi setan 2: communion",
  "dilan 1990",
  "ipar adalah maut",
  "sekawan limo",
  "vina: sebelum 7 hari",
  "kang mak from pee mak",
  "laskar pelangi",
  "gadis kretek",
  "badarawuhi di desa penari",
  "miracle in cell no. 7",
  "sewu dino",
  "dilan 1991",
  "warkop dki reborn: jangkrik boss! part 1",
  "habibie & ainun",
  "pengabdi setan"
];

async function run() {
  const map = {};
  for (const t of titles) {
    const poster = await searchTMDB(t);
    console.log(`"${t}": "${poster}",`);
  }
}
run();
