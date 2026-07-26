import re

with open('server.ts', 'r') as f:
    code = f.read()

# Replace:
#    }
#      return null;
#    };
# With:
#      return null;
#    };
code = re.sub(r'\}\s+return null;\s+\};\s+if \(requestedServer === "idlix"\) \{', r'  return null;\n    };\n\n    if (requestedServer === "idlix") {', code)

with open('server.ts', 'w') as f:
    f.write(code)
print("Regex ran")
