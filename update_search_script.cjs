const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const searchRegex = /app\.get\('\/api\/search', async \(req, res\) => {[\s\S]*?res\.status\(500\)\.json\({ error: 'Failed to fetch from external API' }\);\n    }\n  }\);/;

const newSearchLogic = `app.get('/api/search', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const qTrim = query.trim();
      
      // 1. TMDB API Search (Highly Accurate, Free)
      try {
        const tmdbKey = getTmdbApiKey();
        const tmdbRes = await fetch(\`https://api.themoviedb.org/3/search/multi?api_key=\${tmdbKey}&query=\${encodeURIComponent(qTrim)}&language=id-ID&page=1\`);
        const data = await tmdbRes.json();
        
        if (data.results && data.results.length > 0) {
          const results = data.results
            .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
            .map((r: any) => ({
              slug: r.id.toString(),
              title: r.title || r.name,
              synopsis: r.overview || \`Saksikan \${r.title || r.name} gratis.\`,
              type: r.media_type === 'tv' ? 'series' : 'movie',
              poster: r.poster_path ? \`https://image.tmdb.org/t/p/w500\${r.poster_path}\` : '',
              year: parseInt((r.release_date || r.first_air_date || '0').substring(0, 4)) || new Date().getFullYear(),
              rating: r.vote_average ? parseFloat(r.vote_average.toFixed(1)) : 8.0,
              genres: ['Movie'],
              quality: 'HD',
              duration: '120m'
            }));
            
          return res.json({
            status: true,
            result: { results }
          });
        }
      } catch (e) {
        console.error("TMDB search failed, falling back to Cinemeta", e);
      }
      
      // 2. Fallback: Cinemeta
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
          allMetas.sort((a, b) => parseInt(b.releaseInfo || b.year || '0') - parseInt(a.releaseInfo || a.year || '0'));
          
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

      // 3. Final Fallback: IDLIX proxy
      const apiRes = await fetch(\`https://www.keyrafara.com/search/idlix-search?query=\${encodeURIComponent(qTrim)}\`);
      const data = await apiRes.json();
      let items: any[] = [];
      if (data.status && data.result && Array.isArray(data.result.results)) {
        items = data.result.results;
      }
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
          genres: detailData?.genres && detailData.genres.length > 0 ? detailData.genres : (item.genres && item.genres.length > 0 ? item.genres : ['Movie']),
          synopsis: detailData?.overview || detailData?.synopsis || \`Saksikan film \${item.title} sub Indo gratis di IDLIX.\`,
          quality: detailData?.quality || 'HD',
          duration: detailData?.runtime ? \`\${detailData.runtime}m\` : detailData?.duration || '1h 50m'
        });
      }

      res.json({
        status: true,
        result: {
          results: enrichedResults
        }
      });
    } catch (err) {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Failed to fetch from external API' });
    }
  });`;

content = content.replace(searchRegex, newSearchLogic);
fs.writeFileSync('server.ts', content);
console.log("Updated server.ts successfully");
