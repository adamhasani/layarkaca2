import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

code = code.replace(
  /'auto' \| 'idlix' \| 'moviebox' \| 'strigil' \| 'videasy' \| 'lk21'/g,
  `'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy' | 'lk21' | 'vidbolt'`
);

code = code.replace(
  /{ id: 'strigil', label: 'Server Strigil \(VIP 💎\)', desc: 'Server premium multi-source, full speed HD' },/g,
  `{ id: 'vidbolt', label: 'Server Vidbolt (VIP ⚡)', desc: 'Server baru, cepat & stabil' },\n                      { id: 'strigil', label: 'Server Strigil (VIP 💎)', desc: 'Server premium multi-source, full speed HD' },`
);

code = code.replace(
  /selectedServer === 'lk21' \? 'LK21' : 'IDLIX, Strigil, Moviebox, Videasy & LK21'/g,
  `selectedServer === 'lk21' ? 'LK21' : selectedServer === 'vidbolt' ? 'Vidbolt' : 'IDLIX, Strigil, Moviebox, Videasy, LK21 & Vidbolt'`
);

code = code.replace(
  /{ id: 'strigil', label: 'Strigil \(VIP\)' },/g,
  `{ id: 'vidbolt', label: 'Vidbolt (VIP)' },\n                { id: 'strigil', label: 'Strigil (VIP)' },`
);

fs.writeFileSync('src/components/VideoModal.tsx', code);
