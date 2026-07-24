const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const searchRegex = /\/\/ Fallback[\s\S]*?(?=\n\s+res\.json\(\{)/;

const newSearchLogic = `// Fallback to Stremio Cinemeta (Free, No Auth, Accurate)
      try {
        const [movieRes, seriesRes] = await Promise.all([
          fetch(\`https://v3-cinemeta.strem.io/catalog/movie/top/search=\${encodeURIComponent(qTrim)}.json\`),
          fetch(\`https://v3-cinemeta.strem.io/catalog/series/top/search=\${encodeURIComponent(qTrim)}.json\`)
        ]);
        
        const movieData = await movieRes.json().catch(() => ({ metas: [] }));
        const seriesData = await seriesRes.json().catch(() => ({ metas: [] }));
        
        let allMetas = [];
        if (movieData.metas) allMetas = allMetas.concat(movieData.metas);
        if (seriesData.metas) allMetas = allMetas.concat(seriesData.metas);
        
        if (allMetas.length > 0) {
          // Sort by year (descending) roughly
          allMetas.sort((a, b) => {
             const yearA = parseInt(a.releaseInfo || a.year || '0');
             const yearB = parseInt(b.releaseInfo || b.year || '0');
             return yearB - yearA;
          });
          
          const results = allMetas.slice(0, 16).map((r: any) => ({
            slug: r.id,
            title: r.name,
            synopsis: r.description || \`Saksikan \${r.name} gratis.\`,
            type: r.type === 'series' ? 'series' : 'movie',
            poster: r.poster || '',
            year: parseInt((r.releaseInfo || r.year || '0').toString().substring(0, 4)) || new Date().getFullYear(),
            rating: r.imdbRating ? parseFloat(r.imdbRating) : 8.0,
            genres: r.genre || ['Movie'],
            quality: 'HD'
          }));
          
          return res.json({
            status: true,
            result: { results }
          });
        }
      } catch (e) {
        console.error("Cinemeta search failed", e);
      }

      // Final fallback to IDLIX
      const apiRes = await fetch(\`https://www.keyrafara.com/search/idlix-search?query=\${encodeURIComponent(qTrim)}\`);
      const data = await apiRes.json();

      let items: any[] = [];
      if (data.status && data.result && Array.isArray(data.result.results)) {
        items = data.result.results;
      }
      const filteredItems = items.filter((item: any) => item && item.title && !item.title.toLowerCase().includes('dialihkan')).slice(0, 16);
      const enrichedResults = [];
      for (const item of filteredItems) {
        const poster = await resolvePosterUrl(item);
        enrichedResults.push({
          ...item,
          poster: poster,
          rating: '8.0',
          genres: item.genres && item.genres.length > 0 ? item.genres : ['Movie'],
          synopsis: item.synopsis || \`Saksikan film \${item.title} sub Indo gratis di IDLIX.\`,
          quality: 'HD',
          duration: '1h 50m'
        });
      }`;

content = content.replace(searchRegex, newSearchLogic);
fs.writeFileSync('server.ts', content);
