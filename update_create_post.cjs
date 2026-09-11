const fs = require('fs');
let content = fs.readFileSync('src/ui/createPost.ts', 'utf-8');

// Add tags logic
if (!content.includes('const tags =')) {
    content = content.replace(
        `status: 'approved',`,
        `status: 'approved',\n          tags: text.match(/#[\\w\\u0980-\\u09FF]+/g) || [],`
    );
    fs.writeFileSync('src/ui/createPost.ts', content, 'utf-8');
}
