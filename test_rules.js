const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(/allow read: if request\.auth != null && request\.auth\.uid == resource\.data\.userId;/g, 'allow read: if request.auth != null && (resource == null || request.auth.uid == resource.data.userId);');
fs.writeFileSync('firestore.rules', rules);
