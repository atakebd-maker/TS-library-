import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { User } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../utils/image';

export async function renderProfile(container: HTMLElement, currentUser: User, uid: string) {
  const isOwnProfile = currentUser.uid === uid;
  
  container.innerHTML = `
    <div class="max-w-2xl mx-auto pt-16 pb-20">
      <div class="bg-white">
        <!-- Cover Photo -->
        <div class="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        
        <div class="px-4 pb-4">
          <div class="relative flex justify-between items-end -mt-16 mb-4">
            <img id="profile-pic" class="w-32 h-32 rounded-full border-4 border-white bg-white object-cover" src="https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}" alt="">
            <div class="flex space-x-2 pb-2">
              ${isOwnProfile ? 
                `<button id="edit-profile-btn" class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">এডিট প্রোফাইল</button>` 
                : 
                `<button id="follow-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto hidden" id="follow-spinner"></div>
                  <i data-lucide="user-plus" class="w-5 h-5" id="follow-icon"></i><span id="follow-text">অপেক্ষা করুন...</span>
                </button>`
              }
            </div>
          </div>
          
          <div>
            <h1 id="profile-name" class="text-2xl font-bold text-gray-900">...</h1>
            <p id="profile-bio" class="text-gray-600 mt-1">...</p>
            
            <div class="flex space-x-4 mt-4 text-gray-600">
              <div><span class="font-bold text-gray-900" id="followers-count">0</span> ফলোয়ার</div>
              <div><span class="font-bold text-gray-900" id="following-count">0</span> ফলোয়িং</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Edit Profile Modal -->
      <div id="edit-profile-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-[60] flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
          <div class="px-4 py-3 border-b flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900">প্রোফাইল এডিট করুন</h3>
            <button id="close-edit-modal" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-6 h-6"></i></button>
          </div>
          <div class="p-4 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">নাম</label>
              <input type="text" id="edit-name" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">বায়ো (Bio)</label>
              <textarea id="edit-bio" class="w-full px-3 py-2 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">প্রোফাইল ছবি পরিবর্তন করুন</label>
              <div class="flex items-center space-x-4">
                <img id="edit-photo-preview" src="https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder" class="h-16 w-16 rounded-full object-cover border">
                <input type="file" id="edit-photo-file" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
              </div>
              <div id="upload-progress-text" class="text-xs text-blue-600 mt-2 hidden">ছবি আপলোড হচ্ছে... একটু অপেক্ষা করুন</div>
            </div>
            <div id="edit-error" class="hidden text-sm text-red-600"></div>
          </div>
          <div class="px-4 py-3 border-t">
            <button id="save-profile" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex justify-center items-center">
              <span>সেভ করুন</span>
              <div id="edit-spinner" class="hidden ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div class="mt-4 px-4">
        <h2 class="text-lg font-bold text-gray-900 mb-4">পোস্টসমূহ</h2>
        <div id="profile-posts" class="space-y-4">
          <div class="text-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(async () => {
    let currentData: any = {};
    let isFollowing = false;
    let followDocId: string | null = null;
    
    const followBtn = document.getElementById('follow-btn');
    const followText = document.getElementById('follow-text');
    const followIcon = document.getElementById('follow-icon');
    const followSpinner = document.getElementById('follow-spinner');
    
    import('lucide').then(({ createIcons, UserPlus, UserMinus, X }) => {
      createIcons({ icons: { UserPlus, UserMinus, X }, nameAttr: 'data-lucide' });
    });

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        currentData = data;
        document.getElementById('profile-name')!.textContent = data.name;
        document.getElementById('profile-bio')!.textContent = data.bio || 'কোনো বায়ো দেওয়া নেই।';
        if (data.photoURL) {
          (document.getElementById('profile-pic') as HTMLImageElement).src = data.photoURL;
        }
        
        // Fetch Follow Counts
        const followersQ = query(collection(db, 'follows'), where('followingId', '==', uid));
        const followingQ = query(collection(db, 'follows'), where('followerId', '==', uid));
        const [followersSnap, followingSnap] = await Promise.all([getDocs(followersQ), getDocs(followingQ)]);
        
        document.getElementById('followers-count')!.textContent = followersSnap.size.toString();
        document.getElementById('following-count')!.textContent = followingSnap.size.toString();
        
        // Check if current user is following this user
        if (!isOwnProfile && followBtn) {
          const myFollowQ = query(collection(db, 'follows'), where('followerId', '==', currentUser.uid), where('followingId', '==', uid));
          const myFollowSnap = await getDocs(myFollowQ);
          if (!myFollowSnap.empty) {
             isFollowing = true;
             followDocId = myFollowSnap.docs[0].id;
             followText!.textContent = 'আনফলো করুন';
             followBtn.classList.replace('bg-blue-600', 'bg-gray-200');
             followBtn.classList.replace('hover:bg-blue-700', 'hover:bg-gray-300');
             followBtn.classList.replace('text-white', 'text-gray-900');
             followIcon!.setAttribute('data-lucide', 'user-minus');
          } else {
             isFollowing = false;
             followText!.textContent = 'ফলো করুন';
             followIcon!.setAttribute('data-lucide', 'user-plus');
          }
          
          import('lucide').then(({ createIcons, UserPlus, UserMinus }) => {
            createIcons({ icons: { UserPlus, UserMinus }, nameAttr: 'data-lucide' });
          });
          
          followBtn.addEventListener('click', async () => {
             followBtn.setAttribute('disabled', 'true');
             followSpinner!.classList.remove('hidden');
             followIcon!.classList.add('hidden');
             followText!.classList.add('opacity-50');
             try {
                if (isFollowing && followDocId) {
                   await deleteDoc(doc(db, 'follows', followDocId));
                   isFollowing = false;
                   followDocId = null;
                   followText!.textContent = 'ফলো করুন';
                   followBtn.classList.replace('bg-gray-200', 'bg-blue-600');
                   followBtn.classList.replace('hover:bg-gray-300', 'hover:bg-blue-700');
                   followBtn.classList.replace('text-gray-900', 'text-white');
                   followIcon!.setAttribute('data-lucide', 'user-plus');
                   const countEl = document.getElementById('followers-count')!;
                   countEl.textContent = (parseInt(countEl.textContent || '0') - 1).toString();
                } else {
                   const newFollow = await addDoc(collection(db, 'follows'), {
                      followerId: currentUser.uid,
                      followingId: uid,
                      createdAt: serverTimestamp()
                   });
                   isFollowing = true;
                   followDocId = newFollow.id;
                   followText!.textContent = 'আনফলো করুন';
                   followBtn.classList.replace('bg-blue-600', 'bg-gray-200');
                   followBtn.classList.replace('hover:bg-blue-700', 'hover:bg-gray-300');
                   followBtn.classList.replace('text-white', 'text-gray-900');
                   followIcon!.setAttribute('data-lucide', 'user-minus');
                   const countEl = document.getElementById('followers-count')!;
                   countEl.textContent = (parseInt(countEl.textContent || '0') + 1).toString();
                }
                
                import('lucide').then(({ createIcons, UserPlus, UserMinus }) => {
                  createIcons({ icons: { UserPlus, UserMinus }, nameAttr: 'data-lucide' });
                });
             } catch (e) {
                console.error(e);
             } finally {
                followBtn.removeAttribute('disabled');
                followSpinner!.classList.add('hidden');
                followIcon!.classList.remove('hidden');
                followText!.classList.remove('opacity-50');
             }
          });
        }
      } else {
        document.getElementById('profile-name')!.textContent = 'ব্যবহারকারী পাওয়া যায়নি';
        document.getElementById('profile-bio')!.textContent = '';
      }

      const q = query(collection(db, 'posts'), where('authorId', '==', uid), orderBy('createdAt', 'desc'));
      const postsSnap = await getDocs(q);
      const postsContainer = document.getElementById('profile-posts')!;
      
      if (postsSnap.empty) {
        postsContainer.innerHTML = '<div class="bg-white p-6 rounded-xl text-center text-gray-500 shadow-sm border border-gray-100">কোনো পোস্ট নেই</div>';
      } else {
        postsContainer.innerHTML = '';
        postsSnap.forEach((docSnap) => {
          const post = docSnap.data();
          const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
          postsContainer.innerHTML += `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div class="text-sm text-gray-500 mb-2">${date}</div>
              <p class="text-gray-900 mb-3 whitespace-pre-wrap">${(post.content || '').replace(/#[\w\u0980-\u09FF]+/g, (match) => `<a href="#search/${encodeURIComponent(match)}" class="text-blue-600 hover:underline">${match}</a>`)}</p>
              ${post.images && post.images.length > 0 ? `<div class="grid grid-cols-2 gap-2">${post.images.map((img: string) => `<img src="${img}" class="w-full h-40 object-cover rounded-lg">`).join('')}</div>` : ''}
              ${post.videos && post.videos.length > 0 ? `<div class="mt-3"><video src="${post.videos[0]}" controls class="w-full rounded-lg max-h-60 bg-black"></video></div>` : ''}
            </div>
          `;
        });
      }
    } catch (e) {
      console.error(e);
    }
    
    // Edit Profile Logic
    const editBtn = document.getElementById('edit-profile-btn');
    const editModal = document.getElementById('edit-profile-modal');
    const closeEditBtn = document.getElementById('close-edit-modal');
    const saveProfileBtn = document.getElementById('save-profile');
    
    if (editBtn && editModal && closeEditBtn) {
      editBtn.addEventListener('click', () => {
        (document.getElementById('edit-name') as HTMLInputElement).value = currentData.name || '';
        (document.getElementById('edit-bio') as HTMLTextAreaElement).value = currentData.bio || '';
        (document.getElementById('edit-photo-preview') as HTMLImageElement).src = currentData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`;
        (document.getElementById('edit-photo-file') as HTMLInputElement).value = '';
        editModal.classList.remove('hidden');
      });
      closeEditBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
      });
    }

    const photoInput = document.getElementById('edit-photo-file') as HTMLInputElement;
    const photoPreview = document.getElementById('edit-photo-preview') as HTMLImageElement;
    let selectedProfileImage: File | null = null;
    
    if (photoInput && photoPreview) {
      photoInput.addEventListener('change', async (e: any) => {
        if (e.target.files && e.target.files[0]) {
          // Immediately compress for faster upload (max width 400 for avatar)
          selectedProfileImage = await compressImage(e.target.files[0], 400);
          photoPreview.src = URL.createObjectURL(selectedProfileImage);
        }
      });
    }

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', async () => {
        const name = (document.getElementById('edit-name') as HTMLInputElement).value.trim();
        const bio = (document.getElementById('edit-bio') as HTMLTextAreaElement).value.trim();
        const spinner = document.getElementById('edit-spinner')!;
        const errorMsg = document.getElementById('edit-error')!;
        
        if (!name) {
          errorMsg.textContent = 'নাম দেওয়া আবশ্যক।';
          errorMsg.classList.remove('hidden');
          return;
        }

        saveProfileBtn.setAttribute('disabled', 'true');
        spinner.classList.remove('hidden');
        errorMsg.classList.add('hidden');

        let finalPhotoURL = currentData.photoURL || '';
        const progressText = document.getElementById('upload-progress-text')!;

        try {
          if (selectedProfileImage) {
             progressText.classList.remove('hidden');
             const storageRef = ref(storage, `profiles/${uid}/${Date.now()}_${selectedProfileImage.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
             const uploadTask = await uploadBytesResumable(storageRef, selectedProfileImage);
             finalPhotoURL = await getDownloadURL(uploadTask.ref);
             progressText.classList.add('hidden');
          }

          await updateDoc(doc(db, 'users', uid), {
            name,
            bio,
            photoURL: finalPhotoURL
          });
          
          import('firebase/auth').then(({ updateProfile }) => {
            if (currentUser) {
               updateProfile(currentUser, { displayName: name, photoURL: finalPhotoURL || null }).catch(console.error);
            }
          });

          document.getElementById('profile-name')!.textContent = name;
          document.getElementById('profile-bio')!.textContent = bio || 'কোনো বায়ো দেওয়া নেই।';
          if (finalPhotoURL) {
            (document.getElementById('profile-pic') as HTMLImageElement).src = finalPhotoURL;
          }
          currentData.name = name;
          currentData.bio = bio;
          currentData.photoURL = finalPhotoURL;
          
          editModal?.classList.add('hidden');
        } catch (e: any) {
          console.error(e);
          errorMsg.textContent = 'সেভ করতে সমস্যা হয়েছে।';
          errorMsg.classList.remove('hidden');
          progressText.classList.add('hidden');
        } finally {
          saveProfileBtn.removeAttribute('disabled');
          spinner.classList.add('hidden');
        }
      });
    }

  }, 0);
}
