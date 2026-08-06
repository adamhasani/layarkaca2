import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

code = code.replace(
  '<div className="absolute top-0 left-0 right-0 p-3 sm:p-5 flex justify-between items-center z-30 bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-none">',
  '<div className="relative w-full p-3 sm:px-5 sm:py-4 flex justify-between items-center z-30 bg-[#0a0a0a] border-b border-white/10 shrink-0">'
);

code = code.replace(
  '<div className="flex items-center gap-2.5 pr-4 pointer-events-auto overflow-hidden">',
  '<div className="flex items-center gap-2.5 pr-4 overflow-hidden">'
);

code = code.replace(
  '<div className="flex items-center gap-2 pointer-events-auto shrink-0">',
  '<div className="flex items-center gap-2 shrink-0">'
);

fs.writeFileSync('src/components/VideoModal.tsx', code);
console.log("Patched successfully");
