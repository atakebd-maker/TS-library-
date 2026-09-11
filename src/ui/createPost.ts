import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { compressImage } from '../utils/image';

export function renderCreatePost(container: HTMLElement, currentUser: User) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto pt-20 pb-24 px-4 h-screen flex flex-col">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-bold text-gray-800">নতুন পোস্ট তৈরি করুন</h3>
          <a href="#home" class="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </a>
        </div>
        
        <div class="p-5 flex-1 overflow-y-auto flex flex-col">
          <div class="flex space-x-3 mb-5 items-center">
            <img class="h-12 w-12 rounded-full object-cover shadow-sm border border-gray-100" src="${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" alt="">
            <div>
              <div class="font-bold text-gray-900 text-[15px]">${currentUser.displayName}</div>
              <div class="relative mt-1 inline-block">
                <select id="post-privacy" class="appearance-none bg-blue-50 text-blue-700 text-xs font-semibold rounded-full pl-3 pr-8 py-1.5 outline-none cursor-pointer hover:bg-blue-100 transition-colors">
                  <option value="public">🌍 সবাই</option>
                  <option value="friends">👥 বন্ধুরা</option>
                  <option value="only_me">🔒 শুধু আমি</option>
                </select>
                <i data-lucide="chevron-down" class="w-3 h-3 text-blue-700 absolute right-2.5 top-2 pointer-events-none"></i>
              </div>
            </div>
          </div>
          
          <textarea id="post-content" class="w-full flex-1 resize-none outline-none text-lg text-gray-800 placeholder-gray-400 bg-transparent min-h-[150px]" placeholder="আপনার মনে কী চলছে?"></textarea>
          
          <div id="media-preview-container" class="flex flex-wrap gap-3 mt-4 hidden"></div>
          
          <div id="upload-progress" class="hidden mt-4 p-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            <span id="upload-progress-text">অপেক্ষা করুন...</span>
          </div>

          <div id="moderation-warning" class="hidden mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start">
            <i data-lucide="alert-circle" class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"></i>
            <span id="warning-text"></span>
          </div>
        </div>
        
        <div class="px-5 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-2">
            <input type="file" id="image-upload" accept="image/*" multiple class="hidden">
            <input type="file" id="video-upload" accept="video/*" class="hidden">
            <button id="add-image-btn" class="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors tooltip" title="ছবি যুক্ত করুন">
              <i data-lucide="image" class="w-5 h-5"></i>
            </button>
            <button id="add-video-btn" class="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors tooltip" title="ভিডিও যুক্ত করুন">
              <i data-lucide="video" class="w-5 h-5"></i>
            </button>
          </div>
          <button id="submit-post" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-full transition-colors flex justify-center items-center shadow-md hover:shadow-lg transform active:scale-95">
            <span>পোস্ট করুন</span>
            <div id="post-spinner" class="hidden ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    import('lucide').then(({ createIcons, X, ChevronDown, Image: ImageIcon, Video, PlayCircle, AlertCircle }) => {
      createIcons({ icons: { X, ChevronDown, Image: ImageIcon, Video, PlayCircle, AlertCircle }, nameAttr: 'data-lucide' });
    });

    const contentEl = document.getElementById('post-content') as HTMLTextAreaElement;
    const privacyEl = document.getElementById('post-privacy') as HTMLSelectElement;
    const submitBtn = document.getElementById('submit-post') as HTMLButtonElement;
    const spinner = document.getElementById('post-spinner')!;
    const warning = document.getElementById('moderation-warning')!;
    const warningText = document.getElementById('warning-text')!;
    const uploadProgress = document.getElementById('upload-progress')!;
    const uploadProgressText = document.getElementById('upload-progress-text')!;
    const previewContainer = document.getElementById('media-preview-container')!;
    
    const imageUpload = document.getElementById('image-upload') as HTMLInputElement;
    const videoUpload = document.getElementById('video-upload') as HTMLInputElement;
    
    let selectedImages: File[] = [];
    let selectedVideo: File | null = null;
    
    document.getElementById('add-image-btn')?.addEventListener('click', () => imageUpload.click());
    document.getElementById('add-video-btn')?.addEventListener('click', () => videoUpload.click());
    
    const updatePreviews = () => {
      previewContainer.innerHTML = '';
      previewContainer.classList.remove('hidden');
      
      selectedImages.forEach(file => {
        const url = URL.createObjectURL(file);
        previewContainer.innerHTML += `<div class="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-gray-200">
             <img src="${url}" class="w-full h-full object-cover transition-transform hover:scale-105">
           </div>`;
      });
      
      if (selectedVideo) {
        const url = URL.createObjectURL(selectedVideo);
        previewContainer.innerHTML += `<div class="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-black flex items-center justify-center">
             <video src="${url}" class="w-full h-full object-cover opacity-80"></video>
             <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                <i data-lucide="play-circle" class="w-8 h-8 text-white drop-shadow-md"></i>
             </div>
           </div>`;
      }
      
      if (selectedImages.length === 0 && !selectedVideo) {
        previewContainer.classList.add('hidden');
      }
      
      import('lucide').then(({ createIcons, PlayCircle }) => {
        createIcons({ icons: { PlayCircle }, nameAttr: 'data-lucide' });
      });
    };
    
    imageUpload.addEventListener('change', async (e: any) => {
      if (e.target.files) {
        const files = Array.from(e.target.files as FileList).slice(0, 4) as File[];
        // Compress images immediately to save memory and prepare for upload
        selectedImages = await Promise.all(files.map(f => compressImage(f, 800)));
        updatePreviews();
      }
    });
    
    videoUpload.addEventListener('change', (e: any) => {
      if (e.target.files && e.target.files[0]) {
        selectedVideo = e.target.files[0];
        updatePreviews();
      }
    });
    
    submitBtn.addEventListener('click', async () => {
      const text = contentEl.value.trim();
      if (!text && selectedImages.length === 0 && !selectedVideo) {
          warningText.textContent = 'দয়া করে কিছু লিখুন অথবা ছবি/ভিডিও নির্বাচন করুন।';
          warning.classList.remove('hidden');
          return;
      }
      
      submitBtn.disabled = true;
      spinner.classList.remove('hidden');
      warning.classList.add('hidden');
      
      try {
        let modData = { safe: true, reason: '' };
        if (text) {
            const modRes = await fetch('/api/moderate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text })
            });
            modData = await modRes.json();
        }
        
        if (!modData.safe) {
          warningText.textContent = 'সতর্কতা: ' + modData.reason;
          warning.classList.remove('hidden');
          submitBtn.disabled = false;
          spinner.classList.add('hidden');
          return;
        }
        
        let uploadedImages: string[] = [];
        let uploadedVideos: string[] = [];
        
        uploadProgress.classList.remove('hidden');
        
        try {
            for (const file of selectedImages) {
               uploadProgressText.textContent = `ছবি আপলোড হচ্ছে... (${uploadedImages.length + 1}/${selectedImages.length})`;
               const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
               const uploadTask = await uploadBytesResumable(storageRef, file);
               const downloadURL = await getDownloadURL(uploadTask.ref);
               uploadedImages.push(downloadURL);
            }
            
            if (selectedVideo) {
               uploadProgressText.textContent = 'ভিডিও আপলোড হচ্ছে...';
               const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${selectedVideo.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
               const uploadTask = await uploadBytesResumable(storageRef, selectedVideo);
               const downloadURL = await getDownloadURL(uploadTask.ref);
               uploadedVideos.push(downloadURL);
            }
        } catch (storageError) {
            console.error("Storage upload error:", storageError);
            warningText.textContent = 'ফাইল আপলোড ব্যর্থ হয়েছে! Firebase Console থেকে Storage চালু করা আছে কিনা চেক করুন।';
            warning.classList.remove('hidden');
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
            uploadProgress.classList.add('hidden');
            return;
        }
        
        uploadProgressText.textContent = 'পোস্ট সংরক্ষণ করা হচ্ছে...';
        
        await addDoc(collection(db, 'posts'), {
          authorId: currentUser.uid,
          authorName: currentUser.displayName || 'Anonymous',
          authorPhoto: currentUser.photoURL || '',
          content: text,
          images: uploadedImages,
          videos: uploadedVideos,
          privacy: privacyEl.value,
          status: 'approved',
          tags: text.match(/#[\w\u0980-\u09FF]+/g) || [],
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Go back to feed on success
        window.location.hash = '#home';
        
      } catch (e) {
        console.error("Firestore post error:", e);
        warningText.textContent = 'পোস্ট করতে সমস্যা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
        warning.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
      }
    });

  }, 0);
}
