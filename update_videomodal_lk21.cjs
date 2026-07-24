const fs = require('fs');

let content = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

// Update selectedServer state type
content = content.replace(
  /useState<'auto' \| 'idlix' \| 'moviebox' \| 'strigil' \| 'videasy'>\('auto'\)/g,
  "useState<'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy' | 'lk21'>('auto')"
);

// Update fetchDetailForServer param type
content = content.replace(
  /fetchDetailForServer = \(srv: 'auto' \| 'idlix' \| 'moviebox' \| 'strigil' \| 'videasy'/g,
  "fetchDetailForServer = (srv: 'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy' | 'lk21'"
);

// Update loading text
content = content.replace(
  /selectedServer === 'videasy' \? 'Videasy' : 'IDLIX, Strigil, Moviebox & Videasy'/g,
  "selectedServer === 'videasy' ? 'Videasy' : selectedServer === 'lk21' ? 'LK21' : 'IDLIX, Strigil, Moviebox, Videasy & LK21'"
);

// Update main server selector array
content = content.replace(
  /\{ id: 'videasy', label: 'Videasy' \}/g,
  "{ id: 'videasy', label: 'Videasy' },\n                { id: 'lk21', label: 'LK21' }"
);

content = content.replace(
  /const srvId = srv\.id as 'auto' \| 'idlix' \| 'moviebox' \| 'strigil' \| 'videasy';/g,
  "const srvId = srv.id as 'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy' | 'lk21';"
);

fs.writeFileSync('src/components/VideoModal.tsx', content);
console.log("Updated VideoModal.tsx with LK21");
