with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('      getWatchlist(user.uid).then((items) => { console.log("Watchlist items:", items);', '      getWatchlist(user.uid).then((items) => { console.log("Watchlist items:", items);').replace('        })));\n      });', '        })));\n      }).catch(err => console.error("Error fetching watchlist:", err));')
content = content.replace('      getHistory(user.uid).then((items) => {', '      getHistory(user.uid).then((items) => {').replace('        })));\n      });\n    } else {', '        })));\n      }).catch(err => console.error("Error fetching history:", err));\n    } else {')

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Patched catch")
