import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /embedUrl: vidboltUrl, \/\/ fallback \/ default if strigil is requested/g,
  `embedUrl: strigilUrl,`
);

code = code.replace(
  /    if \(requestedServer === "strigil"\) {[\s\S]*?return res\.json\(failStrigil\);\n    }/,
  `    if (requestedServer === "strigil") {
      const strigilResult = await fetchStrigil();
      if (strigilResult) {
        strigilResult.result.embedUrl = strigilResult.result.sources?.find(s => s.name.includes("Strigil"))?.url || strigilResult.result.embedUrl;
        detailCache.set(cacheKey, strigilResult);
        return res.json(strigilResult);
      }
      const failStrigil = {
        status: false,
        message: \`Film '\${cleanQuery}' tidak ditemukan di server Strigil.\`,
      };
      return res.json(failStrigil);
    }`
);

code = code.replace(
  /        result\.embedUrl = result\.sources\.find\(s => s\.name\.includes\("Vidbolt"\)\)\?\.url \|\| result\.embedUrl;/g,
  `        result.result.embedUrl = result.result.embedSources?.find(s => s.name.includes("Vidbolt"))?.url || result.result.embedUrl;`
);

fs.writeFileSync('server.ts', code);
