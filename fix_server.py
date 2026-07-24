import re
with open('server.ts', 'r') as f:
    content = f.read()

# I removed export const app = express(); earlier.
# Let's add it back right after the imports.
import_end = content.rfind("import")
newline_after_import = content.find("\n", import_end) + 1

content = content[:newline_after_import] + "\nexport const app = express();\n" + content[newline_after_import:]

with open('server.ts', 'w') as f:
    f.write(content)
