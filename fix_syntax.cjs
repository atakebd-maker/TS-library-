const fs = require('fs');
['src/ui/feed.ts', 'src/ui/search.ts'].forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/\\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(file, content, 'utf-8');
});
