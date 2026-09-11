import { User } from 'firebase/auth';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export function renderProfile(container: HTMLElement, currentUser: User, profileId?: string) {
  const uid = profileId || currentUser.uid;
  
  container.innerHTML = `
    <div class="max-w-4xl mx-auto bg-white min-h-screen shadow-sm">
      <!-- Cover -->
      <div class="h-64 bg-gray-300 relative w-full object-cover">
        <img src="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1200&auto=format&fit=crop" class="w-full h-full object-cover" />
      </div>
      
      <!-- Profile Info -->
      <div class="px-6 relative pb-6 border-b">
        <div class="flex justify-between items-end -mt-16 mb-4">
          <div class="relative">
            <img id="profile-pic" class="h-32 w-32 rounded-full border-4 border-white object-cover bg-white shadow-sm" src="https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}" alt="">
          </div>
          <div class="flex space-x-2">
            ${uid === currentUser.uid 
              ? `<button class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">এডিট প্রোফাইল</button>` 
              : `<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"><i data-lucide="user-plus" class="w-5 h-5 mr-2"></i> বন্ধু হিসেবে যোগ করুন</button>
                 <button class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"><i data-lucide="message-circle" class="w-5 h-5 mr-2"></i> বার্তা পাঠান</button>
                 <button class="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-lg transition-colors"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>`
            }
          </div>
        </div>
        
        <div>
          <h1 id="profile-name" class="text-3xl font-bold text-gray-900">লোড হচ্ছে...</h1>
          <p id="profile-bio" class="text-gray-600 mt-2 text-lg">...</p>
        </div>
        
        <div class="flex space-x-6 mt-4 text-gray-600 font-medium">
          <div><span id="friends-count" class="text-gray-900 font-bold">0</span> বন্ধু</div>
          <div><span id="followers-count" class="text-gray-900 font-bold">0</span> অনুসরণকারী</div>
          <div><span id="following-count" class="text-gray-900 font-bold">0</span> অনুসরণ করছেন</div>
        </div>
      </div>
      
      <!-- Posts -->
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4 text-gray-900">পোস্টসমূহ</h2>
        <div id="profile-posts" class="space-y-6">
          <div class="text-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(async () => {
    import('lucide').then(({ createIcons, UserPlus, MessageCircle, MoreHorizontal }) => {
      createIcons({ icons: { UserPlus, MessageCircle, MoreHorizontal }, nameAttr: 'data-lucide' });
    });

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        document.getElementById('profile-name')!.textContent = data.name;
        document.getElementById('profile-bio')!.textContent = data.bio || 'কোনো বায়ো দেওয়া নেই।';
        document.getElementById('friends-count')!.textContent = (data.friendsCount || 0).toString();
        document.getElementById('followers-count')!.textContent = (data.followersCount || 0).toString();
        document.getElementById('following-count')!.textContent = (data.followingCount || 0).toString();
        if (data.photoURL) {
          (document.getElementById('profile-pic') as HTMLImageElement).src = data.photoURL;
        }
      }

      const q = query(collection(db, 'posts'), where('authorId', '==', uid), orderBy('createdAt', 'desc'));
      const postsSnap = await getDocs(q);
      const postsContainer = document.getElementById('profile-posts')!;
      
      if (postsSnap.empty) {
        postsContainer.innerHTML = '<div class="text-gray-500 text-center py-10">কোনো পোস্ট পাওয়া যায়নি।</div>';
        return;
      }
      
      postsContainer.innerHTML = '';
      postsSnap.forEach(docSnap => {
        const post = docSnap.data();
        const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('bn-BD') : 'কিছুক্ষণ আগে';
        
        postsContainer.innerHTML += `
          <div class="bg-white rounded-xl shadow-sm border p-4">
            <div class="flex items-center space-x-3 mb-3">
              <img class="h-10 w-10 rounded-full" src="${post.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.authorId}" alt="">
              <div>
                <div class="font-bold text-gray-900">${post.authorName}</div>
                <div class="text-xs text-gray-500">${date}</div>
              </div>
            </div>
            <p class="text-gray-800 whitespace-pre-wrap">${post.content}</p>
          </div>
        `;
      });
    } catch (e) {
      console.error(e);
      document.getElementById('profile-name')!.textContent = 'ব্যবহারকারী পাওয়া যায়নি';
      document.getElementById('profile-bio')!.textContent = '';
      document.getElementById('profile-posts')!.innerHTML = '<div class="text-red-500 text-center py-10">ত্রুটি হয়েছে।</div>';
    }
  }, 0);
}
