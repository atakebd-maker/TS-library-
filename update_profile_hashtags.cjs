const fs = require('fs');
let content = fs.readFileSync('src/ui/profile.ts', 'utf-8');

// Replace standard content rendering with hashtag rendering
const oldCode = `              <p class="text-gray-900 mb-3 whitespace-pre-wrap">\${post.content}</p>`;
const newCode = `              <p class="text-gray-900 mb-3 whitespace-pre-wrap">\${(post.content || '').replace(/#[\\w\\u0980-\\u09FF]+/g, (match) => \`<a href="#search/\${encodeURIComponent(match)}" class="text-blue-600 hover:underline">\${match}</a>\`)}</p>`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/ui/profile.ts', content, 'utf-8');
