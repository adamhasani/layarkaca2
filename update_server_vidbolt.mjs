import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /          let strigilUrl = "";/g,
  `          let vidboltUrl = "";\n          let strigilUrl = "";`
);

code = code.replace(
  /            strigilUrl = \`https:\/\/strigil\.cc\/embed\/tv\/\$\{tmdbId\}\/\$\{sNum\}\/\$\{eNum\}\`;/g,
  `            vidboltUrl = \`https://vidbolt.pro/embed/tv/\${tmdbId}/\${sNum}/\${eNum}\`;\n            strigilUrl = \`https://strigil.cc/embed/tv/\${tmdbId}/\${sNum}/\${eNum}\`;`
);

code = code.replace(
  /            strigilUrl = \`https:\/\/strigil\.cc\/embed\/movie\/\$\{tmdbId\}\`;/g,
  `            vidboltUrl = \`https://vidbolt.pro/embed/movie/\${tmdbId}\`;\n            strigilUrl = \`https://strigil.cc/embed/movie/\${tmdbId}\`;`
);

code = code.replace(
  /            { name: "VIP Strigil \\u{1F48E}", url: strigilUrl },/g,
  `            { name: "VIP Vidbolt ⚡", url: vidboltUrl },\n            { name: "VIP Strigil \\u{1F48E}", url: strigilUrl },`
);

code = code.replace(
  /              embedUrl: strigilUrl,/g,
  `              embedUrl: vidboltUrl, // fallback / default if strigil is requested`
);

// We should also add fetchVidbolt
code = code.replace(
  /    if \(requestedServer === "strigil"\) {/g,
  `    if (requestedServer === "vidbolt") {
      const result = await fetchStrigil(); // fetchStrigil actually returns multiple sources including vidbolt
      if (result) {
        result.embedUrl = result.sources.find(s => s.name.includes("Vidbolt"))?.url || result.embedUrl;
        detailCache.set(cacheKey, result);
        return res.json(result);
      }
    }
    if (requestedServer === "strigil") {`
);

fs.writeFileSync('server.ts', code);
