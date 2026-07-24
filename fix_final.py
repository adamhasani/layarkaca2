with open('src/components/VideoModal_restored.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i in range(1028):
    if i == 1027:
        new_lines.append(lines[i][:1]) # just the '}'
        new_lines.append("\n")
    else:
        new_lines.append(lines[i])

with open('src/components/VideoModal.tsx', 'w') as f:
    f.writelines(new_lines)

print("Restored perfect copy.")
