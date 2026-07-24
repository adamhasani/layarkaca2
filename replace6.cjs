const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const oldCode = fs.readFileSync('temp6.txt', 'utf8');

const newCode = `                const poster = await resolvePosterUrl(detailData || item);
        enrichedResults.push({
          ...item,
          poster: poster,
          rating: detailData?.rating || '8.0',
          genres: detailData?.genres && detailData.genres.length > 0 ? detailData.genres : ['Action', 'Drama'],
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
    } catch (err) {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
