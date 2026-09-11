import { collection, query, orderBy, limit, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { User } from 'firebase/auth';
import { compressImage } from '../utils/image';

export function renderFeed(container: HTMLElement, currentUser: User) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto pt-20 pb-20 px-4">
      <!-- Stories Section -->
      <div id="stories-container" class="flex space-x-4 overflow-x-auto pb-4 mb-6 hide-scrollbar">
        <!-- Add Story -->
        <div id="add-story-btn" class="flex-shrink-0 w-24 h-40 rounded-xl relative overflow-hidden group cursor-pointer shadow-sm border border-gray-100 flex-none">
          <img src="${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" class="w-full h-full object-cover transition-transform group-hover:scale-105">
          <div class="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-2 items-center pb-4 transition-colors group-hover:bg-opacity-20">
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white mb-2 shadow-sm transform group-hover:scale-110 transition-transform">
              <i data-lucide="plus" class="w-5 h-5 text-white"></i>
            </div>
            <span class="text-white text-xs font-medium drop-shadow-md">স্ট্যাটাস দিন</span>
          </div>
          
          <div id="story-uploading" class="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center hidden">
             <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
             <span class="text-white text-[10px]">আপলোড হচ্ছে...</span>
          </div>
        </div>
        
        <input type="file" id="story-upload-input" accept="image/*" class="hidden">
        
        <!-- Live Stories will be injected here -->
        <div id="live-stories" class="flex space-x-4"></div>
      </div>

      <a href="#create-post" class="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow">
        <img class="h-10 w-10 rounded-full object-cover" src="${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" alt="">
        <div class="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-500 hover:bg-gray-200 transition-colors">
          আপনার মনে কী চলছে?
        </div>
        <i data-lucide="image" class="w-6 h-6 text-green-500"></i>
      </a>

      <div id="feed-container" class="space-y-6">
        <!-- Feed Skeleton/Loading -->
        <div class="text-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    import('lucide').then(({ createIcons, Plus, Image: ImageIcon, ThumbsUp, MessageSquare, Share2 }) => {
      createIcons({ icons: { Plus, Image: ImageIcon }, nameAttr: 'data-lucide' });

      // Story Logic
      const addStoryBtn = document.getElementById('add-story-btn')!;
      const storyUploadInput = document.getElementById('story-upload-input') as HTMLInputElement;
      const storyUploading = document.getElementById('story-uploading')!;
      const liveStories = document.getElementById('live-stories')!;

      addStoryBtn.addEventListener('click', () => {
         if (!storyUploading.classList.contains('hidden')) return; // already uploading
         storyUploadInput.click();
      });

      storyUploadInput.addEventListener('change', async (e: any) => {
         if (e.target.files && e.target.files[0]) {
             try {
                 storyUploading.classList.remove('hidden');
                 const file = await compressImage(e.target.files[0], 800);
                 
                 const storageRef = ref(storage, `stories/${currentUser.uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
                 const uploadTask = await uploadBytesResumable(storageRef, file);
                 const downloadURL = await getDownloadURL(uploadTask.ref);
                 
                 await addDoc(collection(db, 'stories'), {
                     authorId: currentUser.uid,
                     authorName: currentUser.displayName || 'Anonymous',
                     authorPhoto: currentUser.photoURL || '',
                     mediaType: 'image',
                     mediaUrl: downloadURL,
                     createdAt: serverTimestamp(),
                     expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
                 });
                 
                 storyUploadInput.value = ''; // reset
             } catch (err) {
                 console.error("Story upload failed", err);
                 alert('স্ট্যাটাস আপলোড করতে সমস্যা হয়েছে!');
             } finally {
                 storyUploading.classList.add('hidden');
             }
         }
      });
      
      // Fetch Stories
      const storiesQ = query(collection(db, 'stories'), orderBy('createdAt', 'desc'), limit(15));
      onSnapshot(storiesQ, (snapshot) => {
         liveStories.innerHTML = '';
         const now = Date.now();
         
         // Keep track of users to group stories (simple grouping)
         const usersWithStories = new Set();
         
         snapshot.forEach(docSnap => {
             const story = docSnap.data();
             if (story.expiresAt < now) return; // expired
             if (usersWithStories.has(story.authorId)) return; // Only show latest story per user for now
             usersWithStories.add(story.authorId);
             
             const storyEl = document.createElement('div');
             storyEl.className = 'flex-shrink-0 w-24 h-40 rounded-xl relative overflow-hidden group cursor-pointer shadow-sm border border-blue-500 p-[2px]';
             storyEl.innerHTML = `
                <div class="w-full h-full rounded-lg overflow-hidden relative">
                   <img src="${story.mediaUrl}" class="w-full h-full object-cover">
                   <div class="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-blue-500 overflow-hidden shadow-sm">
                      <img src="${story.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + story.authorId}" class="w-full h-full object-cover">
                   </div>
                   <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span class="text-white text-xs font-medium drop-shadow-md truncate block">${story.authorName.split(' ')[0]}</span>
                   </div>
                </div>
             `;
             // Simple click to view (just opens image in new tab for now for simplicity, can be a modal later)
             storyEl.addEventListener('click', () => {
                 window.open(story.mediaUrl, '_blank');
             });
             liveStories.appendChild(storyEl);
         });
      }, (err) => console.error("Stories error:", err));

      // Feed Logic
      const feedContainer = document.getElementById('feed-container')!;
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
      
      onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          feedContainer.innerHTML = '<div class="text-center py-10 text-gray-500">কোনো পোস্ট পাওয়া যায়নি।</div>';
          return;
        }
        feedContainer.innerHTML = '';
        snapshot.forEach((docSnap) => {
          const post = docSnap.data();
          if (post.status !== 'approved' && post.authorId !== currentUser.uid) return;
          const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'কিছুক্ষণ আগে';
          
          const content = post.content || '';
          // Hashtag formatting
          const formattedContent = content.replace(/#[\w\u0980-\u09FF]+/g, (match: string) => `<a href="#search/${encodeURIComponent(match)}" class="text-blue-600 hover:underline">${match}</a>`);

          const postEl = document.createElement('div');
          postEl.className = 'bg-white rounded-xl shadow-sm overflow-hidden mb-6';
          postEl.innerHTML = `
            <div class="p-4">
              <div class="flex items-center space-x-3 mb-4">
                <a href="#profile/${post.authorId}"><img class="h-10 w-10 rounded-full object-cover" src="${post.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.authorId}" alt=""></a>
                <div>
                  <a href="#profile/${post.authorId}" class="font-bold text-gray-900 hover:underline">${post.authorName}</a>
                  <div class="text-xs text-gray-500">${date} • ${post.privacy === 'public' ? 'সবাই' : 'বন্ধুরা'}</div>
                </div>
              </div>
              <p class="text-gray-900 text-[15px] whitespace-pre-wrap">${formattedContent}</p>
              ${post.images && post.images.length > 0 ? `<div class="mt-4 grid grid-cols-2 gap-2">${post.images.map((img: string) => `<img src="${img}" class="w-full h-48 object-cover rounded-lg">`).join('')}</div>` : ''}
              ${post.videos && post.videos.length > 0 ? `<div class="mt-4"><video src="${post.videos[0]}" controls class="w-full rounded-lg max-h-96 bg-black"></video></div>` : ''}
            </div>
            <div class="px-4 py-2 border-t border-gray-100 flex justify-between text-gray-500 text-sm">
              <button class="flex items-center space-x-2 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50 flex-1 justify-center">
                <i data-lucide="thumbs-up" class="w-5 h-5"></i><span>লাইক</span>
              </button>
              <button class="flex items-center space-x-2 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50 flex-1 justify-center">
                <i data-lucide="message-square" class="w-5 h-5"></i><span>মন্তব্য</span>
              </button>
              <button class="flex items-center space-x-2 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50 flex-1 justify-center">
                <i data-lucide="share-2" class="w-5 h-5"></i><span>শেয়ার</span>
              </button>
            </div>
          `;
          feedContainer.appendChild(postEl);
        });
        createIcons({ icons: { ThumbsUp, MessageSquare, Share2 }, nameAttr: 'data-lucide' });
      }, (err) => console.error("Feed error:", err));
    });
  }, 0);
}
