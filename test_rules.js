const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');
rules = rules.replace(
  "allow create: if isSignedIn() && isValidId(postId) && isValidPost(incoming()) && exists(/databases/$(database)/documents/users/$(request.auth.uid));",
  "allow create: if isSignedIn();"
);
fs.writeFileSync('firestore.rules', rules);
