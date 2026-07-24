import re

with open('server.ts', 'r') as f:
    content = f.read()

# Remove startServer wrapper entirely
content = re.sub(r'async function startServer\(\) \{', '', content)
content = re.sub(r'\}\nstartServer\(\);', '', content)

# Replace Vite middleware and listen logic
old_vite_logic = r"// Vite middleware for development.*?app\.listen.*?\}\);"
new_vite_logic = """
  // Vercel Serverless handling: don't start the server or serve static files
  // Vercel handles static files automatically.
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== 'production') {
      createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      }).then(vite => {
        app.use(vite.middlewares);
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`Server running on http://0.0.0.0:${PORT}`);
        });
      });
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  }
"""

content = re.sub(old_vite_logic, new_vite_logic, content, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(content)
print("Patched server.ts")
