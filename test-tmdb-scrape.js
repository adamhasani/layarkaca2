import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function scrapeTmdbPoster(title) {
  try {
    const res = await fetch(`https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const img = $('.poster img').first().attr('src');
    if (img) {
      return `https://www.themoviedb.org${img}`;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

(async () => {
  console.log("Toy Story 5:", await scrapeTmdbPoster("Toy Story 5"));
  console.log("The Super Mario Galaxy Movie:", await scrapeTmdbPoster("The Super Mario Galaxy Movie"));
  console.log("Michael:", await scrapeTmdbPoster("Michael"));
})();
