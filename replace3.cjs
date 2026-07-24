const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const oldCode = fs.readFileSync('temp3.txt', 'utf8');

const newCode = `      // Removed AI search fallback based on user request
      const filteredItems = items.filter((item: any) => item && item.title && !item.title.toLowerCase().includes('dialihkan')).slice(0, 16);
      const enrichedResults = [];
      for (const item of filteredItems) {
        let detailData = null;
        try {
          if (item.slug) {
             detailData = await fetchMovieDetail(item.slug);
             await new Promise(r => setTimeout(r, 200));
          }
        } catch(e) {}
        
        const poster = await resolvePosterUrl(detailData || item);
        enrichedResults.push({
          ...item,
          poster: poster,
          rating: detailData?.rating || '8.0',
          genres: detailData?.genres && detailData.genres.length > 0 ? detailData.genres : ['Action', 'Drama'],
          synopsis: detailData?.overview || detailData?.synopsis || \`Saksikan film \${item.title} sub Indo gratis di IDLIX.\`,
          quality: detailData?.quality || 'HD',
          duration: detailData?.runtime ? \`\${detailData.runtime}m\` : detailData?.duration || '1h 50m'
        });
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
