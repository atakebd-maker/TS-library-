const fs = require('fs');

let serverContent = fs.readFileSync('server.ts', 'utf-8');
serverContent = serverContent.replace('const resultText = response.text();', 'const resultText = response.text || "";');
fs.writeFileSync('server.ts', serverContent, 'utf-8');

let feedContent = fs.readFileSync('src/ui/feed.ts', 'utf-8');
feedContent = feedContent.replace('selectedImages = Array.from(e.target.files).slice(0, 4);', 'selectedImages = Array.from(e.target.files as FileList).slice(0, 4) as File[];');
fs.writeFileSync('src/ui/feed.ts', feedContent, 'utf-8');
