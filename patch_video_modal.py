import re

with open('src/components/VideoModal.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('    // Track history when video opens')
if start_idx == -1:
    print("Not found start")
    exit(1)

end_idx = content.find('    document.body.style.overflow', start_idx)
if end_idx == -1:
    print("Not found end")
    exit(1)

replacement = """    // Track history when video opens
    if (user && movie.id) {
      updateHistory(user.uid, movie, 0, selectedSeason, selectedEpisode).catch(console.error);
    }
    
"""

new_content = content[:start_idx] + replacement + content[end_idx:]

with open('src/components/VideoModal.tsx', 'w') as f:
    f.write(new_content)

print("Patched VideoModal")
