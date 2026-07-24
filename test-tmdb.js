import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
async function test() {
  const apiKey = process.env.TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=id-ID&page=1`, {
     headers: { accept: 'application/json' }
  });
  const data = await res.json();
  console.log(data.results[0]);
}
test();
