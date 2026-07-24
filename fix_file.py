with open('src/components/VideoModal.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i == 1061: # 0-indexed, so line 1062
        idx = line.find('ettings, Subtitles')
        if idx != -1:
            new_lines.append(line[:idx-1]) # remove 'ettings...' and probably '}'
            break
    else:
        new_lines.append(line)

with open('src/components/VideoModal.tsx', 'w') as f:
    f.writelines(new_lines)
