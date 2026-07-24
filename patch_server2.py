import re

with open('server.ts', 'r') as f:
    content = f.read()

# Instead of startServer being async and immediately executed, let's just make it simple.
# Wait, actually let's just create api/index.ts to create the app and define the api routes directly!
# But duplicating the routes is bad.
