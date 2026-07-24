const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(/<script>[\s\S]*?<\/script>/, `
    <script>
      // Fix for iframe environments where fetch is a getter-only property
      // We need to intercept assignments to window.fetch
      try {
        const originalFetch = window.fetch;
        Object.defineProperty(window, 'fetch', {
          get: function() { return originalFetch; },
          set: function(val) { 
             console.warn("Intercepted attempt to overwrite window.fetch");
          },
          configurable: true,
          enumerable: true
        });
      } catch(e) {
      }
    </script>
`);

fs.writeFileSync('index.html', content);
console.log("index.html fixed");
