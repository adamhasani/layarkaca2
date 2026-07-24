import re
with open('server.ts', 'r') as f:
    content = f.read()

# Replace dynamic imports with static ones
content = re.sub(r"const \{ db \} = await import\('\./src/lib/firebase\.js'\);", "", content)
content = re.sub(r"const \{ doc, getDoc, setDoc \} = await import\('firebase/firestore'\);", "", content)

# Add static imports at the top
imports = "import { doc, getDoc, setDoc } from 'firebase/firestore';\nimport { db } from './src/lib/firebase';\n"
content = imports + content

with open('server.ts', 'w') as f:
    f.write(content)
print("Patched server.ts")
