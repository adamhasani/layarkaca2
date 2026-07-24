import * as cheerio from 'cheerio';

async function scrapeIndoFilms() {
  try {
    const res = await fetch('https://id.wikipedia.org/wiki/Daftar_film_Indonesia_terlaris');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const films = [];
    // Let's find the correct table
    const table = $('.wikitable').first();
    if (table.length > 0) {
      table.find('tbody tr').each((i, row) => {
        if (i === 0) return; // skip header
        const tds = $(row).find('td');
        if (tds.length >= 4) {
          const rank = $(tds[0]).text().trim();
          const titleTag = $(tds[1]).find('a').first();
          const title = titleTag.text().trim() || $(tds[1]).text().trim();
          const href = titleTag.attr('href') || '';
          
          // Clean title (remove brackets/years etc if any, e.g. "Agak Laen")
          const cleanTitle = title.replace(/\(film.*?\)/gi, '').trim();
          
          const viewers = $(tds[2]).text().trim().replace(/[\.\s]/g, '');
          const year = $(tds[3]).text().trim();
          const director = $(tds[4]).text().trim();
          
          if (cleanTitle) {
            films.push({
              rank,
              title: cleanTitle,
              year: parseInt(year) || null,
              viewers: parseInt(viewers) || null,
              director,
              wikiUrl: href ? `https://id.wikipedia.org${href}` : ''
            });
          }
        }
      });
    }
    console.log("Scraped Films:", JSON.stringify(films.slice(0, 20), null, 2));
  } catch (err) {
    console.error("Scrape Error:", err);
  }
}

scrapeIndoFilms();
