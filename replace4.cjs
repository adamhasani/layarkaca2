const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const oldCode = fs.readFileSync('temp4.txt', 'utf8');

const newCode = `      const fetchSectionForQueries = async (queries: string[], genreFilter?: string) => {
        const seenSlugs = new Set<string>();
        const allResults: any[] = [];
        
        for (const query of queries) {
          try {
            const apiRes = await fetch(\`https://www.keyrafara.com/search/idlix-search?query=\${encodeURIComponent(query)}\`);
            const data = await apiRes.json();
            if (data.status && data.result && Array.isArray(data.result.results)) {
              const items = data.result.results.slice(0, 8);
              for (const item of items) {
                if (item.slug && !seenSlugs.has(item.slug)) {
                  seenSlugs.add(item.slug);
                  allResults.push(item);
                }
              }
            }
            await new Promise(r => setTimeout(r, 600));
          } catch (e) {
            console.error(\`Error searching query \${query}:\`, e);
          }
        }

        // Fill with fallback pool if results are low
        if (allResults.length < 12) {
          for (const fb of fallbackMoviesPool) {
            if (!seenSlugs.has(fb.slug)) {
              if (!genreFilter || fb.genres.some(g => g.toLowerCase().includes(genreFilter.toLowerCase()))) {
                seenSlugs.add(fb.slug);
                allResults.push(fb);
              }
            }
          }
        }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
