import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /        let posterUrl = finalInfo\.poster;\n        let foundTmdbId = null;\n        if \(film\.wikiUrl\) \{/g,
  `        let posterUrl = finalInfo.poster;
        let foundTmdbId = null;
        if (film.wikiUrl && (!info || !info.poster || info.poster === defaultPoster)) {`
);

fs.writeFileSync('server.ts', code);
