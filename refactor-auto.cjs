const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const idlixStart = code.indexOf(`      // 3. Try IDLIX first (for server='idlix' or server='auto')`);
const idlixEnd = code.indexOf(`      // No server had match`);
const endBlock = code.indexOf(`      res.json(noMatchResult);`, idlixEnd) + `      res.json(noMatchResult);`.length;

const idlixBlock = code.substring(idlixStart, idlixEnd);

// Create the wrapper
let wrapperBody = idlixBlock
  .replace(/if \\(requestedServer === 'idlix' \\|\\| requestedServer === 'auto'\\) \\{/, `const fetchIdlixWrapper = async () => {`)
  .replace(/return res.json\\(finalData\\);/g, `return finalData;`)
  .replace(/detailCache.set\\(cacheKey, finalData\\);/g, ``); // Dont set cache inside wrapper

// Remove the strigil, moviebox, videasy, lk21 fallback blocks from wrapperBody
const strigilFallbackStart = wrapperBody.indexOf(`      // 4. Fallback to Strigil in 'auto' mode`);
if (strigilFallbackStart !== -1) {
  wrapperBody = wrapperBody.substring(0, strigilFallbackStart);
}
// Add closing bracket for the wrapper function
wrapperBody = wrapperBody.trimEnd() + `\n        return null;\n      };\n`;

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

code = code.substring(0, idlixStart) + newCodeBlock + code.substring(endBlock);
fs.writeFileSync('server.ts', code);
console.log('Refactored auto logic!');
