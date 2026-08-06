import * as cheerio from 'cheerio';

async function test() {
  const searchRes = await fetch("https://lk21official.mom/search.php?s=Agak%20Laen");
  let searchHtml = await searchRes.text();
  
  if (searchHtml.includes("window.location.replace")) {
     const match = searchHtml.match(/window\.location\.replace\('([^']+)'\)/);
     if (match && match[1]) {
       console.log("Redirecting to:", match[1]);
       const redirectRes = await fetch(match[1]);
       searchHtml = await redirectRes.text();
     }
  }
  
  console.log("Length:", searchHtml.length);
  const $ = cheerio.load(searchHtml);
  console.log("Search items:", $(".search-item").length);
}

test();
