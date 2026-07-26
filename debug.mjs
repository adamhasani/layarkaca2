const apiKey = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
async function run() {
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=Ne%20Zha%202`);
  const data = await res.json();
  console.log(data.results?.[0]?.poster_path || data);
}
run();
