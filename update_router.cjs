const fs = require('fs');
let content = fs.readFileSync('src/ui/router.ts', 'utf-8');

// Ensure imports
if (!content.includes('renderSearch')) {
    content = content.replace("import { renderProfile } from './profile';", "import { renderProfile } from './profile';\nimport { renderSearch } from './search';\nimport { renderCreatePost } from './createPost';");
}

// Replace case 'messages' with 'search' and 'create-post'
const oldCases = `      case 'messages':
        // renderMessages(app, currentUser);
        app.innerHTML = '<div class="pt-20 text-center text-gray-500">Messages component placeholder</div>';
        break;`;

const newCases = `      case 'search':
        renderSearch(app, currentUser, params[0] ? decodeURIComponent(params[0]) : '');
        break;
      case 'create-post':
        renderCreatePost(app, currentUser);
        break;`;

if (content.includes("case 'messages':")) {
    content = content.replace(oldCases, newCases);
} else {
    // If not found exactly, just insert before default
    content = content.replace("default:", newCases + "\n      default:");
}

fs.writeFileSync('src/ui/router.ts', content, 'utf-8');
