with open('server.ts', 'r') as f:
    code = f.read()

# We need to remove the extra `};` that we added.
# Let's find:
target = '''      } catch (err) {
        console.error("Match search error:", err);
      }
    }
      return null;
    };'''

replacement = '''      } catch (err) {
        console.error("Match search error:", err);
      }
      return null;
    };'''

if target in code:
    code = code.replace(target, replacement)
    with open('server.ts', 'w') as f:
        f.write(code)
    print("Fixed syntax error!")
else:
    print("Target not found!")
