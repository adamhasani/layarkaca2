with open('server.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == "export const app = express();":
        continue
    new_lines.append(line)

import_idx = 0
for i, line in enumerate(new_lines):
    if line.startswith('import '):
        import_idx = i

new_lines.insert(import_idx + 1, "export const app = express();\n")

with open('server.ts', 'w') as f:
    f.writelines(new_lines)
