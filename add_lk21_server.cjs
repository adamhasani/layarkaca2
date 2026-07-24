const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Add fetchLk21 helper inside app.get('/api/detail'...)
const movieboxHelperRegex = /\/\/ Moviebox fetch helper[\s\S]*?const fetchMoviebox = async[^\n]*\n[\s\S]*?(?=\/\/ Videasy fetch helper)/;
const match = content.match(movieboxHelperRegex);

if (match) {
  const lk21Helper = `      // LK21 fetch helper
      const fetchLk21 = async (q) => {
        try {
          const lk21Res = await fetch(\`https://www.keyrafara.com/streaming/lk21?query=\${encodeURIComponent(q)}&server=auto\`);
          const lk21Data = await lk21Res.json();
          if (
            lk21Data.status && 
            lk21Data.result && 
            (lk21Data.result.streamUrl || (lk21Data.result.sources && lk21Data.result.sources.length > 0) || lk21Data.result.embedUrl)
          ) {
            const subtitles = [];
            const resultData = lk21Data.result;
            
            let streamUrl = resultData.streamUrl || '';
            const embedUrl = resultData.embedUrl || '';
            
            const sources = (resultData.sources || []).map((s) => ({
              label: s.label || s.resolution || 'HD',
              url: s.url,
              type: s.type || 'm3u8'
            }));
            
            if (!streamUrl && sources.length > 0) {
              streamUrl = sources[0].url;
            }

            return {
              status: true,
              result: {
                title: resultData.title || q,
                poster: resultData.poster || '',
                embedUrl: embedUrl,
                streamUrl: streamUrl,
                sources: sources,
                subtitles: subtitles,
                server: 'LK21',
                detail: resultData.detail || { synopsis: 'Saksikan streaming film di LK21.' }
              }
            };
          }
        } catch (e) {
          console.error("LK21 fetch error", e);
        }
        return null;
      };

`;
  content = content.replace(movieboxHelperRegex, lk21Helper + match[0]);
} else {
  console.log("Could not find moviebox helper to inject lk21 helper.");
}

// 2. Add explicit routing for LK21
const explicitRoutingRegex = /\/\/ 2\.5\. If explicit Videasy server requested[\s\S]*?return res\.json\(failVideasy\);\n      }/;
const videasyMatch = content.match(explicitRoutingRegex);
if (videasyMatch) {
  const lk21Routing = `      // 2.7. If explicit LK21 server requested
      if (requestedServer === 'lk21') {
        const lk21Result = await fetchLk21(cleanQuery);
        if (lk21Result) {
          detailCache.set(cacheKey, lk21Result);
          return res.json(lk21Result);
        }
        const failLk21 = { status: false, message: \`Film '\${cleanQuery}' tidak ditemukan di server LK21.\` };
        return res.json(failLk21);
      }
      
`;
  content = content.replace(explicitRoutingRegex, videasyMatch[0] + "\n" + lk21Routing);
}

// 3. Add auto-routing for LK21
const autoVideasyRegex = /\/\/ 5\.5\. Fallback to Videasy in 'auto' mode if others failed[\s\S]*?return res\.json\(videasyResult\);\n        }\n      }/;
const autoVideasyMatch = content.match(autoVideasyRegex);
if (autoVideasyMatch) {
  const autoLk21Routing = `
      // 5.7. Fallback to LK21 in 'auto' mode if others failed
      if (requestedServer === 'auto') {
        const lk21Result = await fetchLk21(cleanQuery);
        if (lk21Result) {
          detailCache.set(cacheKey, lk21Result);
          return res.json(lk21Result);
        }
      }`;
  content = content.replace(autoVideasyRegex, autoVideasyMatch[0] + autoLk21Routing);
}

// 4. Update fallback string
content = content.replace(
  /Server IDLIX, Strigil, Moviebox, maupun Videasy/g,
  'Server IDLIX, Strigil, Moviebox, Videasy, maupun LK21'
);

fs.writeFileSync('server.ts', content);
console.log("LK21 server logic injected to server.ts");
