const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const wikiHelper = `
async function fetchWikiSynopsisFallback(title) {
  if (!title) return null;
  const cleanTitle = title.replace(/\\(\\d{4}\\)/g, "").replace(/-/g, " ").trim();
  try {
    const urlId = \`https://id.wikipedia.org/api/rest_v1/page/summary/\${encodeURIComponent(cleanTitle.replace(/ /g, '_'))}\`;
    const resId = await fetch(urlId, { headers: { "User-Agent": "CinestreamApp/1.0" } });
    if (resId.ok) {
      const data = await resId.json();
      if (data.extract) return data.extract;
    }
    const urlEn = \`https://en.wikipedia.org/api/rest_v1/page/summary/\${encodeURIComponent(cleanTitle.replace(/ /g, '_'))}\`;
    const resEn = await fetch(urlEn, { headers: { "User-Agent": "CinestreamApp/1.0" } });
    if (resEn.ok) {
      const data = await resEn.json();
      if (data.extract) return data.extract;
    }
  } catch (e) {
    console.error("Wikipedia synopsis fallback error:", e);
  }
  return null;
}

async function enrichResultWithWiki(data, fallbackTitle) {
  if (!data || !data.status || !data.result) return data;
  const detail = data.result.detail;
  if (detail && detail.synopsis !== undefined) {
    if (!detail.synopsis || detail.synopsis.startsWith("Saksikan") || detail.synopsis.length < 15) {
      const title = data.result.title || fallbackTitle;
      const wiki = await fetchWikiSynopsisFallback(title);
      if (wiki) detail.synopsis = wiki;
    }
  }
  return data;
}
`;

if (!code.includes('fetchWikiSynopsisFallback')) {
  code = code.replace('app.get("/api/detail", async (req, res) => {', wikiHelper + '\napp.get("/api/detail", async (req, res) => {');
}

// Now replace all detailCache.set(cacheKey, XXX); return res.json(XXX);
// with enriched logic.
// We can find instances of:
// detailCache.set(cacheKey, VARIABLENAME);
// return res.json(VARIABLENAME);

const regex = /detailCache\.set\(cacheKey,\s*([a-zA-Z0-9_]+)\);\s*return\s+res\.json\(\1\);/g;
code = code.replace(regex, (match, varName) => {
  if (varName === 'noMatchResult') return match;
  return `${varName} = await enrichResultWithWiki(${varName}, cleanQuery);\n        detailCache.set(cacheKey, ${varName});\n        return res.json(${varName});`;
});

fs.writeFileSync('server.ts', code);
console.log('Patched server.ts');
