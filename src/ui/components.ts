import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Home, Users, Video, Image as ImageIcon, MessageCircle, Bell, User as UserIcon, Settings, ShieldAlert, Search, LogOut } from 'lucide';
import { icons } from 'lucide';

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
            <input type="text" placeholder="খুঁজুন..." class="w-64 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-300 focus:ring-0 text-sm px-4 py-2 pl-10 transition-colors">
            <div class="absolute left-3 top-2.5 text-gray-400">
              <i data-lucide="search" class="w-4 h-4"></i>
            </div>
          </div>
          <a href="#messages" class="text-gray-500 hover:text-gray-700 relative p-1">
            <i data-lucide="message-circle" class="w-6 h-6"></i>
          </a>
          <a href="#notifications" class="text-gray-500 hover:text-gray-700 relative p-1">
            <i data-lucide="bell" class="w-6 h-6"></i>
          </a>
          <div class="relative ml-3 group">
            <button class="flex bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <img class="h-8 w-8 rounded-full object-cover" src="${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" alt="">
            </button>
            <div class="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block divide-y divide-gray-100">
              <div class="py-1">
                <a href="#profile/${currentUser.uid}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">প্রোফাইল</a>
                <a href="#settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">সেটিংস</a>
              </div>
              <div class="py-1">
                <button id="logout-btn" class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100">লগআউট</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Bottom Navigation -->
    <div class="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      <a href="#home" class="flex flex-col items-center justify-center w-full text-blue-600"><i data-lucide="home" class="w-6 h-6"></i><span class="text-[10px] mt-1">হোম</span></a>
      <a href="#videos" class="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-900"><i data-lucide="video" class="w-6 h-6"></i><span class="text-[10px] mt-1">ভিডিও</span></a>
      <a href="#photos" class="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-900"><i data-lucide="image" class="w-6 h-6"></i><span class="text-[10px] mt-1">ছবি</span></a>
      <a href="#profile/${currentUser.uid}" class="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-900"><i data-lucide="user" class="w-6 h-6"></i><span class="text-[10px] mt-1">প্রোফাইল</span></a>
      <a href="#settings" class="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-900"><i data-lucide="settings" class="w-6 h-6"></i><span class="text-[10px] mt-1">সেটিংস</span></a>
    </div>
  `;

  setTimeout(() => {
    // Replace icons
    import('lucide').then(({ createIcons, Search, MessageCircle, Bell, Home, Video, Image: ImageIcon, User: UserIcon, Settings, LogOut }) => {
      createIcons({ icons: { Search, MessageCircle, Bell, Home, Video, Image: ImageIcon, User: UserIcon, Settings, LogOut }, nameAttr: 'data-lucide' });
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
  }, 0);

  return nav;
}
