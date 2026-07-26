import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const idlixStart = code.indexOf("      // 3. Try IDLIX first (for server='idlix' or server='auto')");
const searchLine = "      if (requestedServer === 'idlix' || requestedServer === 'auto') {";
const idlixEnd = code.indexOf("      // No server had match");
const endBlock = code.indexOf("      res.json(noMatchResult);", idlixEnd) + "      res.json(noMatchResult);".length;

const originalBlock = code.substring(idlixStart, endBlock);

let wrapperBody = originalBlock.substring(0, originalBlock.indexOf("      // 4. Fallback to Strigil in 'auto' mode"));
wrapperBody = wrapperBody.replace(searchLine, "      const fetchIdlixWrapper = async () => {");
// replace "return res.json(finalData);" with "return finalData;"
wrapperBody = wrapperBody.replace(/return res\.json\(finalData\);/g, "return finalData;");
wrapperBody = wrapperBody.replace(/detailCache\.set\(cacheKey, finalData\);/g, "");

wrapperBody = wrapperBody.trimEnd() + "\n        return null;\n      };\n";

const newCodeBlock = `
${wrapperBody}

      if (requestedServer === 'idlix') {
        const idlixRes = await fetchIdlixWrapper();
        if (idlixRes) {
          detailCache.set(cacheKey, idlixRes);
          return res.json(idlixRes);
        }
        return res.json({ status: false, message: 'Not found in IDLIX' });
      }

      if (requestedServer === 'auto') {
        try {
          // Race all servers! The fastest to respond with a valid stream wins.
          const fastestResult = await Promise.any([
            fetchIdlixWrapper().then(r => r ? r : Promise.reject()),
            fetchStrigil().then(r => r ? r : Promise.reject()),
            fetchMoviebox(cleanQuery).then(r => r ? r : Promise.reject()),
            fetchVideasy().then(r => r ? r : Promise.reject()),
            fetchLk21(cleanQuery).then(r => r ? r : Promise.reject())
          ]);
          detailCache.set(cacheKey, fastestResult);
          return res.json(fastestResult);
        } catch (e) {
          const noMatchResult = { status: false, message: \`Film '\${query}' (\${year || ''}) belum tersedia di server manapun.\` };
          detailCache.set(cacheKey, noMatchResult);
          return res.json(noMatchResult);
        }
      }
`;

code = code.replace(originalBlock, newCodeBlock);
fs.writeFileSync('server.ts', code);
console.log('Fixed auto logic');
