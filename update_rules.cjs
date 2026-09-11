const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

const followsRule = `
    // ------------------
    // Follows
    // ------------------
    match /follows/{followId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() &&
                    incoming().keys().hasAll(['followerId', 'followingId', 'createdAt']) &&
                    incoming().followerId == request.auth.uid;
      allow delete: if isSignedIn() && existing().followerId == request.auth.uid;
    }
`;

if (!rules.includes('/follows/{followId}')) {
    rules = rules.replace('// Posts', followsRule + '\n    // Posts');
    fs.writeFileSync('firestore.rules', rules);
}
