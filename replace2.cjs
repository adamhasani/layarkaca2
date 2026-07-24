const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const oldCode = fs.readFileSync('temp2.txt', 'utf8');

const newCode = `      const seenSlugs = new Set<string>();
      for (const term of searchTerms) {
        try {
          const apiRes = await fetch(\`https://www.keyrafara.com/search/idlix-search?query=\${encodeURIComponent(term)}\`);
          const data = await apiRes.json();
          if (data.status && data.result && Array.isArray(data.result.results)) {
            for (const item of data.result.results) {
              if (item.slug && !seenSlugs.has(item.slug)) {
                seenSlugs.add(item.slug);
                allResults.push(item);
              }
            }
          }
          await new Promise(r => setTimeout(r, 400));
        } catch (e) {}
      }

      const filteredItems = allResults.filter((item: any) => item && item.title && !item.title.toLowerCase().includes('dialihkan')).slice(0, 12);
      const enrichedResults = [];
      for (const item of filteredItems) {
        let enriched = { ...item };
        try {
          enriched.poster = await resolvePosterUrl(item);
          if (item.slug) {
            const detailRes = await fetch(\`https://www.keyrafara.com/search/idlix-detail?slug=\${encodeURIComponent(item.slug)}\`);
            const detailData = await detailRes.json();
            if (detailData.status && detailData.result) {
              enriched = {
                ...enriched,
                rating: detailData.result.rating || '8.0',
                genres: detailData.result.genres || [],
                synopsis: detailData.result.overview || detailData.result.synopsis,
                quality: detailData.result.quality,
                duration: detailData.result.runtime ? \`\${detailData.result.runtime}m\` : detailData.result.duration
              };
            }
          }
        } catch (e) {}
        enrichedResults.push(enriched);
        await new Promise(r => setTimeout(r, 300));
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
