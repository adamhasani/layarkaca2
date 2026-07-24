import re
with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('./src/lib/firestoreMovies.js', './src/lib/firestoreMovies')
content = content.replace('./src/lib/firestoreWikipedia.js', './src/lib/firestoreWikipedia')
content = content.replace('./src/lib/firestoreMonthlyLists.js', './src/lib/firestoreMonthlyLists')
content = content.replace('./src/lib/firebase.js', './src/lib/firebase')

with open('server.ts', 'w') as f:
    f.write(content)
