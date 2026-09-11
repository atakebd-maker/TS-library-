import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from 'firebase/auth';

export async function renderSearch(container: HTMLElement, currentUser: User, queryText: string = '') {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto pt-24 pb-20 px-4">
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">অনুসন্ধান করুন</h2>
        <div class="flex gap-2">
            <input type="text" id="search-input" value="${queryText}" placeholder="নাম, পোস্ট বা হ্যাশট্যাগ লিখে খুঁজুন..." class="flex-1 rounded-lg border-gray-300 border px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <button id="search-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">খুঁজুন</button>
        </div>
      </div>
      
      <div id="search-results-users" class="space-y-4 mb-6 hidden">
         <h3 class="font-bold text-gray-800 border-b pb-2">অ্যাকাউন্ট সমূহ</h3>
         <div id="users-list" class="space-y-3"></div>
      </div>
      
      <div id="search-results-posts" class="space-y-4 hidden">
         <h3 class="font-bold text-gray-800 border-b pb-2">পোস্ট সমূহ</h3>
         <div id="posts-list" class="space-y-4"></div>
      </div>
      
      <div id="empty-state" class="text-center text-gray-500 py-10">এখানে সার্চ রেজাল্ট দেখানো হবে...</div>
      <div id="loading-state" class="text-center py-10 hidden">
         <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  `;

  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
  const usersContainer = document.getElementById('search-results-users') as HTMLElement;
  const usersList = document.getElementById('users-list') as HTMLElement;
  const postsContainer = document.getElementById('search-results-posts') as HTMLElement;
  const postsList = document.getElementById('posts-list') as HTMLElement;
  const emptyState = document.getElementById('empty-state') as HTMLElement;
  const loadingState = document.getElementById('loading-state') as HTMLElement;

  const performSearch = async (text: string) => {
    const term = text.trim().toLowerCase();
    if (!term) {
        emptyState.textContent = 'কিছু লিখে খুঁজুন...';
        emptyState.classList.remove('hidden');
        usersContainer.classList.add('hidden');
        postsContainer.classList.add('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    usersContainer.classList.add('hidden');
    postsContainer.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    try {
        const usersRef = collection(db, 'users');
        const postsRef = collection(db, 'posts');
        
        // Fetch users and recent posts
        const [usersSnap, postsSnap] = await Promise.all([
           getDocs(usersRef),
           getDocs(query(postsRef, orderBy('createdAt', 'desc'), limit(100)))
        ]);
        
        usersList.innerHTML = '';
        postsList.innerHTML = '';
        
        let userCount = 0;
        usersSnap.forEach((docSnap) => {
            const user = docSnap.data();
            if (docSnap.id === currentUser.uid) return;
            
            if (user.name && user.name.toLowerCase().includes(term)) {
                userCount++;
                const userEl = document.createElement('div');
                userEl.className = 'bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-gray-100';
                userEl.innerHTML = `
                  <div class="flex items-center space-x-3">
                    <a href="#profile/${docSnap.id}">
                        <img src="${user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + docSnap.id}" class="w-12 h-12 rounded-full object-cover">
                    </a>
                    <div>
                      <a href="#profile/${docSnap.id}" class="font-bold text-gray-900 hover:underline">${user.name}</a>
                      <div class="text-sm text-gray-500">${user.bio || 'কোনো বায়ো নেই'}</div>
                    </div>
                  </div>
                  <a href="#profile/${docSnap.id}" class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">প্রোফাইল</a>
                `;
                usersList.appendChild(userEl);
            }
        });
        
        let postCount = 0;
        postsSnap.forEach((docSnap) => {
            const post = docSnap.data();
            const content = post.content || '';
            const tags = post.tags || [];
            
            if (content.toLowerCase().includes(term) || tags.some((t: string) => t.toLowerCase() === term || t.toLowerCase().includes(term))) {
                postCount++;
                const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                
                // Format content for hashtags
                const formattedContent = content.replace(/#[\w\u0980-\u09FF]+/g, (match: string) => `<a href="#search/${encodeURIComponent(match)}" class="text-blue-600 hover:underline">${match}</a>`);
                
                const postEl = document.createElement('div');
                postEl.className = 'bg-white rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-100';
                postEl.innerHTML = `
                  <div class="p-4">
                    <div class="flex items-center space-x-3 mb-3">
                      <a href="#profile/${post.authorId}"><img class="h-8 w-8 rounded-full object-cover" src="${post.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.authorId}"></a>
                      <div>
                        <a href="#profile/${post.authorId}" class="font-bold text-gray-900 text-sm hover:underline">${post.authorName}</a>
                        <div class="text-xs text-gray-500">${date}</div>
                      </div>
                    </div>
                    <p class="text-gray-900 text-[15px] whitespace-pre-wrap">${formattedContent}</p>
                    ${post.images && post.images.length > 0 ? `<div class="mt-3 grid grid-cols-2 gap-2">${post.images.map((img: string) => `<img src="${img}" class="w-full h-32 object-cover rounded-lg">`).join('')}</div>` : ''}
                  </div>
                `;
                postsList.appendChild(postEl);
            }
        });
        
        loadingState.classList.add('hidden');
        
        if (userCount > 0) {
            usersContainer.classList.remove('hidden');
        }
        if (postCount > 0) {
            postsContainer.classList.remove('hidden');
        }
        
        if (userCount === 0 && postCount === 0) {
            emptyState.textContent = 'কিছু পাওয়া যায়নি।';
            emptyState.classList.remove('hidden');
        }

    } catch (e) {
        console.error(e);
        loadingState.classList.add('hidden');
        emptyState.textContent = 'সার্চ করতে সমস্যা হয়েছে।';
        emptyState.classList.remove('hidden');
    }
  };

  if (queryText) {
      performSearch(queryText);
  }

  searchBtn.addEventListener('click', () => performSearch(searchInput.value));
  searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch(searchInput.value);
  });
}
