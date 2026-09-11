import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export function renderNavbar(currentUser: User): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'fixed top-0 w-full bg-white shadow-sm z-50';
  
  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <a href="#home" class="flex-shrink-0 flex items-center">
            <span class="text-2xl font-bold text-blue-600 tracking-tight">TS Library</span>
          </a>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="#home" class="nav-link border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">হোম</a>
            <a href="#videos" class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">ভিডিও</a>
            <a href="#photos" class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">ছবি</a>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="relative hidden md:block">
            <input type="text" id="desktop-search" placeholder="খুঁজুন..." class="w-64 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-300 focus:ring-0 text-sm px-4 py-2 pl-10 transition-colors">
            <div class="absolute left-3 top-2.5 text-gray-400">
              <i data-lucide="search" class="w-4 h-4"></i>
            </div>
          </div>
          <a href="#search" class="text-gray-500 hover:text-gray-700 relative p-1 md:hidden">
            <i data-lucide="search" class="w-6 h-6"></i>
          </a>
          <a href="#notifications" class="text-gray-500 hover:text-gray-700 relative p-1">
            <i data-lucide="bell" class="w-6 h-6"></i>
          </a>
          
          <!-- Direct Profile Link -->
          <a href="#profile/${currentUser.uid}" class="flex bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm border border-gray-200 transition-transform hover:scale-105">
            <img class="h-8 w-8 rounded-full object-cover" src="${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" alt="">
          </a>
          
          <!-- Logout Button -->
          <button id="logout-btn" class="text-gray-400 hover:text-red-500 relative p-1 transition-colors" title="লগআউট">
            <i data-lucide="log-out" class="w-6 h-6"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile Bottom Navigation -->
    <div class="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40">
      <a href="#home" class="flex flex-col items-center justify-center w-full text-blue-600"><i data-lucide="home" class="w-6 h-6"></i><span class="text-[10px] mt-1">হোম</span></a>
      <a href="#videos" class="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-900"><i data-lucide="video" class="w-6 h-6"></i><span class="text-[10px] mt-1">ভিডিও</span></a>
      <div class="relative w-full flex justify-center -mt-8">
         <a href="#create-post" class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg border-4 border-white focus:outline-none transition-transform transform hover:scale-105 z-50 flex items-center justify-center h-14 w-14">
            <i data-lucide="plus" class="w-8 h-8"></i>
         </a>
      </div>
      <a href="#photos" class="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-900"><i data-lucide="image" class="w-6 h-6"></i><span class="text-[10px] mt-1">ছবি</span></a>
      <a href="#settings" class="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-900"><i data-lucide="settings" class="w-6 h-6"></i><span class="text-[10px] mt-1">সেটিংস</span></a>
    </div>
  `;

  setTimeout(() => {
    // Replace icons
    import('lucide').then(({ createIcons, Search, Bell, Home, Video, Image, Settings, LogOut, Plus }) => {
      createIcons({ icons: { Search, Bell, Home, Video, Image, Settings, LogOut, Plus }, nameAttr: 'data-lucide' });
    });

    const logoutBtn = nav.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
          window.location.hash = '';
          window.location.reload();
        });
      });
    }

    const searchInput = nav.querySelector('#desktop-search') as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                window.location.hash = '#search/' + encodeURIComponent(searchInput.value.trim());
            }
        });
    }
  }, 0);

  return nav;
}
