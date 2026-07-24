import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function searchDDG(query) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' poster')}`, {
       headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const img = $('.zcm-wrap').html();
    console.log(html.substring(0, 500));
  } catch (e) {
    console.log(e);
  }
}
searchDDG("Toy Story 5");
