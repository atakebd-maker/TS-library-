const fs = require('fs');
let content = fs.readFileSync('src/ui/feed.ts', 'utf-8');

// Remove the whole modal block from feed
const modalRegex = /<!-- Post Modal -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
content = content.replace(modalRegex, '');

// Update create post button to be a link to `#create-post`
const oldCreatePostUI = `      <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center space-x-4 cursor-pointer" id="open-post-modal">
        <img class="h-10 w-10 rounded-full object-cover" src="\${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" alt="">
        <div class="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-500 hover:bg-gray-200 transition-colors">
          আপনার মনে কী চলছে?
        </div>
        <i data-lucide="image" class="w-6 h-6 text-green-500"></i>
      </div>`;
const newCreatePostUI = `      <a href="#create-post" class="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow">
        <img class="h-10 w-10 rounded-full object-cover" src="\${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" alt="">
        <div class="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-500 hover:bg-gray-200 transition-colors">
          আপনার মনে কী চলছে?
        </div>
        <i data-lucide="image" class="w-6 h-6 text-green-500"></i>
      </a>`;
content = content.replace(oldCreatePostUI, newCreatePostUI);

// Remove the event listeners for modal logic
// It's tricky to regex out the event listeners, so let's just find and replace them with empty if possible
content = content.replace(/const modal = document\.getElementById\('post-modal'\)!;[\s\S]*?\}\);/g, '');

// Since the regex might not capture all submit logic nicely, let's just rewrite feed.ts entirely to be safe and clean.
