const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const searchRegex = /app\.get\('\/api\/search', async \(req, res\) => {[\s\S]*?(?=res\.json\({[\s\S]*?status: true,[\s\S]*?result: {[\s\S]*?results: enrichedResults[\s\S]*?}[\s\S]*?}\);[\s\S]*?} catch \(error\) {)/;

const newSearchLogic = `app.get('/api/search', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const qTrim = query.trim();
      const tmdbKey = process.env.TMDB_API_KEY;

      if (tmdbKey) {
        try {
          const authHeader = tmdbKey.startsWith('ey') ? \`Bearer \${tmdbKey}\` : '';
          const url = authHeader 
            ? \`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(qTrim)}&language=id-ID&page=1\`
            : \`https://api.themoviedb.org/3/search/multi?api_key=\${tmdbKey}&query=\${encodeURIComponent(qTrim)}&language=id-ID&page=1\`;
            
          const tmdbRes = await fetch(url, {
            headers: authHeader ? { Authorization: authHeader, accept: 'application/json' } : { accept: 'application/json' }
          });
          const data = await tmdbRes.json();
          
          if (data.results) {
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
                genres: ['Movie'], // Can map genres if needed, but this is fine for now
                quality: 'HD'
              }));
              
            return res.json({
              status: true,
              result: { results }
            });
          }
        } catch (e) {
          console.error("TMDB search failed, falling back", e);
        }
      }

      // Fallback
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

`;

content = content.replace(searchRegex, newSearchLogic);

fs.writeFileSync('server.ts', content);
