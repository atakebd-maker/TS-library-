const fs = require('fs');
let content = fs.readFileSync('src/ui/feed.ts', 'utf-8');

// Update imports
content = content.replace("import { db } from '../firebase/config';", "import { db, storage } from '../firebase/config';\nimport { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';");

// Update modal HTML
const modalHtmlTarget = `<textarea id="post-content" class="w-full h-32 resize-none outline-none text-lg placeholder-gray-400" placeholder="আপনার মনে কী চলছে?"></textarea>
          
          <div id="moderation-warning" class="hidden mt-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"></div>`;

const modalHtmlReplacement = `<textarea id="post-content" class="w-full h-32 resize-none outline-none text-lg placeholder-gray-400" placeholder="আপনার মনে কী চলছে?"></textarea>
          
          <div id="media-preview-container" class="flex flex-wrap gap-2 mt-2 hidden"></div>
          
          <div class="flex gap-4 mt-2">
            <input type="file" id="image-upload" accept="image/*" multiple class="hidden">
            <input type="file" id="video-upload" accept="video/*" class="hidden">
            <button id="add-image-btn" class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"><i data-lucide="image" class="w-5 h-5 text-green-500"></i><span class="text-sm font-medium">ছবি</span></button>
            <button id="add-video-btn" class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"><i data-lucide="video" class="w-5 h-5 text-red-500"></i><span class="text-sm font-medium">ভিডিও</span></button>
          </div>
          <div id="upload-progress" class="hidden mt-2 text-sm text-blue-600 font-medium"></div>

          <div id="moderation-warning" class="hidden mt-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"></div>`;
content = content.replace(modalHtmlTarget, modalHtmlReplacement);

// Update logic
const submitLogicTarget = `const warning = document.getElementById('moderation-warning')!;

      submitBtn.addEventListener('click', async () => {`;

const submitLogicReplacement = `const warning = document.getElementById('moderation-warning')!;
      
      const imageUpload = document.getElementById('image-upload') as HTMLInputElement;
      const videoUpload = document.getElementById('video-upload') as HTMLInputElement;
      const addImageBtn = document.getElementById('add-image-btn')!;
      const addVideoBtn = document.getElementById('add-video-btn')!;
      const previewContainer = document.getElementById('media-preview-container')!;
      const uploadProgress = document.getElementById('upload-progress')!;
      
      let selectedImages: File[] = [];
      let selectedVideo: File | null = null;
      
      addImageBtn.addEventListener('click', () => imageUpload.click());
      addVideoBtn.addEventListener('click', () => videoUpload.click());
      
      const updatePreviews = () => {
        previewContainer.innerHTML = '';
        previewContainer.classList.remove('hidden');
        selectedImages.forEach((file, index) => {
           const url = URL.createObjectURL(file);
           previewContainer.innerHTML += \`<div class="relative w-20 h-20 rounded-lg overflow-hidden border">
             <img src="\${url}" class="w-full h-full object-cover">
           </div>\`;
        });
        if (selectedVideo) {
           const url = URL.createObjectURL(selectedVideo);
           previewContainer.innerHTML += \`<div class="relative w-20 h-20 rounded-lg overflow-hidden border bg-black flex items-center justify-center">
             <video src="\${url}" class="w-full h-full object-cover"></video>
             <i data-lucide="video" class="w-6 h-6 text-white absolute"></i>
           </div>\`;
        }
        if (selectedImages.length === 0 && !selectedVideo) {
          previewContainer.classList.add('hidden');
        }
        // re-render icons if needed
        import('lucide').then(({ createIcons, Video }) => {
          createIcons({ icons: { Video }, nameAttr: 'data-lucide' });
        });
      };
      
      imageUpload.addEventListener('change', (e: any) => {
        if (e.target.files) {
          selectedImages = Array.from(e.target.files).slice(0, 4); // Max 4 for demo
          updatePreviews();
        }
      });
      
      videoUpload.addEventListener('change', (e: any) => {
        if (e.target.files && e.target.files[0]) {
          selectedVideo = e.target.files[0];
          updatePreviews();
        }
      });

      submitBtn.addEventListener('click', async () => {`;

content = content.replace(submitLogicTarget, submitLogicReplacement);

const uploadLogicTarget = `          if (!modData.safe) {
            warning.textContent = 'সতর্কতা: ' + modData.reason;
            warning.classList.remove('hidden');
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
            return;
          }`;

const uploadLogicReplacement = `          if (!modData.safe) {
            warning.textContent = 'সতর্কতা: ' + modData.reason;
            warning.classList.remove('hidden');
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
            return;
          }
          
          let uploadedImages: string[] = [];
          let uploadedVideos: string[] = [];
          
          uploadProgress.classList.remove('hidden');
          
          // Upload Images
          for (const file of selectedImages) {
             uploadProgress.textContent = \`ছবি আপলোড হচ্ছে... (\${uploadedImages.length + 1}/\${selectedImages.length})\`;
             const storageRef = ref(storage, \`posts/\${currentUser.uid}/\${Date.now()}_\${file.name}\`);
             const uploadTask = await uploadBytesResumable(storageRef, file);
             const downloadURL = await getDownloadURL(uploadTask.ref);
             uploadedImages.push(downloadURL);
          }
          
          // Upload Video
          if (selectedVideo) {
             uploadProgress.textContent = 'ভিডিও আপলোড হচ্ছে...';
             const storageRef = ref(storage, \`posts/\${currentUser.uid}/\${Date.now()}_\${selectedVideo.name}\`);
             const uploadTask = await uploadBytesResumable(storageRef, selectedVideo);
             const downloadURL = await getDownloadURL(uploadTask.ref);
             uploadedVideos.push(downloadURL);
          }
          uploadProgress.classList.add('hidden');
          `;
          
content = content.replace(uploadLogicTarget, uploadLogicReplacement);

const firestoreAddTarget = `          await addDoc(collection(db, 'posts'), {
            authorId: currentUser.uid,
            authorName: currentUser.displayName || 'Anonymous',
            authorPhoto: currentUser.photoURL || '',
            content: text,
            images: [],
            videos: [],
            privacy: privacyEl.value,
            status: 'approved', // I will update firestore rules to allow this`;

const firestoreAddReplacement = `          await addDoc(collection(db, 'posts'), {
            authorId: currentUser.uid,
            authorName: currentUser.displayName || 'Anonymous',
            authorPhoto: currentUser.photoURL || '',
            content: text,
            images: uploadedImages,
            videos: uploadedVideos,
            privacy: privacyEl.value,
            status: 'approved', // I will update firestore rules to allow this`;
            
content = content.replace(firestoreAddTarget, firestoreAddReplacement);

const resetTarget = `          modal.classList.add('hidden');
          contentEl.value = '';`;
          
const resetReplacement = `          modal.classList.add('hidden');
          contentEl.value = '';
          selectedImages = [];
          selectedVideo = null;
          updatePreviews();`;

content = content.replace(resetTarget, resetReplacement);

const feedRenderTarget = `              </div>
              <p class="text-gray-900 text-[15px] whitespace-pre-wrap">\${post.content}</p>
            </div>`;

const feedRenderReplacement = `              </div>
              <p class="text-gray-900 text-[15px] whitespace-pre-wrap">\${post.content}</p>
              \${post.images && post.images.length > 0 ? \`<div class="mt-4 grid grid-cols-2 gap-2">\${post.images.map((img: string) => \`<img src="\${img}" class="w-full h-48 object-cover rounded-lg">\`).join('')}</div>\` : ''}
              \${post.videos && post.videos.length > 0 ? \`<div class="mt-4"><video src="\${post.videos[0]}" controls class="w-full rounded-lg max-h-96 bg-black"></video></div>\` : ''}
            </div>`;

content = content.replace(feedRenderTarget, feedRenderReplacement);

fs.writeFileSync('src/ui/feed.ts', content, 'utf-8');
