const cheerio = require('cheerio');

async function test() {
  const wikiRes = await fetch('https://id.wikipedia.org/wiki/Daftar_film_Indonesia_terlaris', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await wikiRes.text();
  const $ = cheerio.load(html);
  
  const scrapedFilms = [];
  const table = $('.wikitable').first();
  table.find('tbody tr').each((i, row) => {
    if (i === 0) return;
    const tds = $(row).find('td');
    if (tds.length >= 4) {
      const rank = $(tds[0]).text().trim();
      const titleTag = $(tds[1]).find('a').first();
      const title = titleTag.text().trim() || $(tds[1]).text().trim();
      scrapedFilms.push({ rank, title, href: titleTag.attr('href') });
    }
  });
  console.log(scrapedFilms.slice(0, 5));
}

test();
