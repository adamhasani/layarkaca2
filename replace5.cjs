const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const oldCode = fs.readFileSync('temp5.txt', 'utf8');

const newCode = `                synopsis: detailData.result.overview || detailData.result.synopsis,
                quality: detailData.result.quality,
                duration: detailData.result.runtime ? \`\${detailData.result.runtime}m\` : detailData.result.duration
              };
            }
          }
        } catch (e) {}
        enrichedResults.push(enriched);
        await new Promise(r => setTimeout(r, 300));
      }

      res.json({
        status: true,
        aiQueries: searchTerms,
        result: {
          results: enrichedResults
        }
      });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
