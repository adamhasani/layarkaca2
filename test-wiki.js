import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function testWiki() {
  const res = await fetch('https://en.wikipedia.org/wiki/2026_in_film');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const movies = [];
  $('.wikitable').find('tbody tr td i').each((j, elem) => {
       const text = $(elem).text().trim();
       if (text && !movies.includes(text) && text.length > 2 && isNaN(Number(text))) {
          movies.push(text);
       }
  });
  console.log("MOVIES:", movies);
}
testWiki();
