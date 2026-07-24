const fs = require('fs');

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add setIsMobileMenuOpen(false) to handleHomeClick
content = content.replace(
  /const handleHomeClick = \(\) => {([\s\S]*?)};\n/,
  "const handleHomeClick = () => {\n$1    setIsMobileMenuOpen(false);\n  };\n"
);

// We also need to style the active state of "Profil" correctly
content = content.replace(
  /className="flex flex-col items-center gap-1 p-1.5 text-zinc-400 hover:text-white transition-all w-16"/,
  "className={`flex flex-col items-center gap-1 p-1.5 transition-all w-16 ${isMobileMenuOpen ? 'text-[var(--color-primary-red)]' : 'text-zinc-400 hover:text-white'}`}"
);

// We also need to make sure "Beranda" active state doesn't light up when isMobileMenuOpen is true
content = content.replace(
  /!searchQuery && !selectedCategory \? 'text-\[var\(--color-primary-red\)\]' : 'text-zinc-400 hover:text-white'/g,
  "!isMobileMenuOpen && !searchQuery && !selectedCategory ? 'text-[var(--color-primary-red)]' : 'text-zinc-400 hover:text-white'"
);

fs.writeFileSync('src/components/Navbar.tsx', content);
console.log("Navbar fixed for mobile navigation");
