const fs = require('fs');
let content = fs.readFileSync('src/ui/feed.ts', 'utf-8');

content = content.replace(
    /onSnapshot\(storiesQ, \(snapshot\) => \{/g,
    'onSnapshot(storiesQ, (snapshot) => {'
); // Not changing much, just let's replace the ending of the onSnapshot.

// actually, easier to just write a robust replace
content = content.replace(
    /\}\);\n\s*\/\/ Feed Logic/g,
    '}, (err) => console.error("Stories error:", err));\n\n      // Feed Logic'
);

content = content.replace(
    /createIcons\(\{ icons: \{ ThumbsUp, MessageSquare, Share2 \}, nameAttr: 'data-lucide' \}\);\n\s*\}\);/g,
    'createIcons({ icons: { ThumbsUp, MessageSquare, Share2 }, nameAttr: \'data-lucide\' });\n      }, (err) => console.error("Feed error:", err));'
);

fs.writeFileSync('src/ui/feed.ts', content, 'utf-8');
