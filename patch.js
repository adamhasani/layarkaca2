import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      try {
        result = await Promise.any([
          runScraper(fetchLk21(cleanQuery, year ? parseInt(year) : undefined)),
          runScraper(fetchVideasy()),
          runScraper(fetchMoviebox(cleanQuery)),
          runScraper(fetchIdlixWrapper())
        ]);`;
const replacement = `      try {
        const scrapers = [];
        if (isIndo) {
           scrapers.push(runScraper(fetchLk21(cleanQuery, year ? parseInt(year) : undefined)));
           scrapers.push(runScraper(fetchVideasy()));
        } else {
           scrapers.push(runScraper(fetchLk21(cleanQuery, year ? parseInt(year) : undefined)));
           scrapers.push(runScraper(fetchVideasy()));
           scrapers.push(runScraper(fetchMoviebox(cleanQuery)));
           scrapers.push(runScraper(fetchIdlixWrapper()));
        }
        result = await Promise.any(scrapers);`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('server.ts', code);
