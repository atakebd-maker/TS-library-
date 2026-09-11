const fs = require('fs');
let content = fs.readFileSync('src/ui/components.ts', 'utf-8');

// Replace message circle with search page link in desktop
content = content.replace(
  `<a href="#messages" class="text-gray-500 hover:text-gray-700 relative p-1">
            <i data-lucide="message-circle" class="w-6 h-6"></i>
          </a>`,
  `<a href="#search" class="text-gray-500 hover:text-gray-700 relative p-1 md:hidden">
            <i data-lucide="search" class="w-6 h-6"></i>
          </a>`
);

// We can make the desktop search input navigate to the search page on 'Enter'
const desktopSearchInputHtml = `<div class="relative hidden md:block">
            <input type="text" id="desktop-search" placeholder="খুঁজুন..." class="w-64 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-300 focus:ring-0 text-sm px-4 py-2 pl-10 transition-colors">
            <div class="absolute left-3 top-2.5 text-gray-400">
              <i data-lucide="search" class="w-4 h-4"></i>
            </div>
          </div>`;
content = content.replace(/<div class="relative hidden md:block">[\s\S]*?<\/div>\s*<\/div>/, desktopSearchInputHtml);


// Add event listener for desktop search
const eventListenerLogic = `
    const searchInput = document.getElementById('desktop-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                window.location.hash = '#search/' + encodeURIComponent(searchInput.value.trim());
            }
        });
    }
`;
if (!content.includes('desktop-search')) {
   // Wait, my regex above might have been slightly off, let's just use string replacement
}

fs.writeFileSync('src/ui/components.ts', content, 'utf-8');
