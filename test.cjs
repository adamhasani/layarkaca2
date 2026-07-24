const cheerio = require('cheerio');

async function test() {
  try {
    const res = await fetch('https://id.wikipedia.org/wiki/Agak_Laen_(film)', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Check infobox images
    const imgUrl = $('.infobox img, .infobox-image img, table img').first().attr('src');
    console.log('Resulting image url:', imgUrl);
    
    if (imgUrl) {
      const fullUrl = imgUrl.startsWith('//') ? 'https:' + imgUrl : imgUrl;
      console.log('Full resolved URL:', fullUrl);
    }
  } catch (e) {
    console.error(e);
  }
}

test();
