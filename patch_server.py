import re

with open('server.ts', 'r') as f:
    content = f.read()

# Change startServer to return the app
content = content.replace("async function startServer() {", "export const app = express();\nasync function startServer() {")
content = content.replace("const app = express();", "")

# Disable listen if running on Vercel
listen_code = """
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
"""
content = re.sub(r'app\.listen.*?\}\);', listen_code, content, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(content)

print("Patched server.ts")
