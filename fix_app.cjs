const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Inside loadHomeMovies, check if response is ok
content = content.replace(
  /const \[homeRes, netflixRes, indoRes, wikiBlockbusterRes, wikiAnimatedRes, wikiTrendingRes\] = await Promise\.all\(\[\n\s+fetch\('\/api\/home'\)\.catch\(\(\) => null\),/g,
  `const fetchSafe = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          return res;
        } catch (e) {
          return null;
        }
      };
      const [homeRes, netflixRes, indoRes, wikiBlockbusterRes, wikiAnimatedRes, wikiTrendingRes] = await Promise.all([
        fetchSafe('/api/home'),`
);
content = content.replace(/fetch\('\/api\/netflix-trending'\)\.catch\(\(\) => null\)/g, "fetchSafe('/api/netflix-trending')");
content = content.replace(/fetch\('\/api\/indonesian-trending'\)\.catch\(\(\) => null\)/g, "fetchSafe('/api/indonesian-trending')");
content = content.replace(/fetch\('\/api\/wikipedia-blockbusters'\)\.catch\(\(\) => null\)/g, "fetchSafe('/api/wikipedia-blockbusters')");
content = content.replace(/fetch\('\/api\/wikipedia-animated'\)\.catch\(\(\) => null\)/g, "fetchSafe('/api/wikipedia-animated')");
content = content.replace(/fetch\('\/api\/wikipedia-trending'\)\.catch\(\(\) => null\)/g, "fetchSafe('/api/wikipedia-trending')");

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx fixed");
