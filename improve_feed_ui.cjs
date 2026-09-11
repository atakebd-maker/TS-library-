const fs = require('fs');
let content = fs.readFileSync('src/ui/feed.ts', 'utf-8');

const oldModalHtml = `    <!-- Post Modal -->
    <div id="post-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-[60] flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div class="px-4 py-3 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900">পোস্ট তৈরি করুন</h3>
          <button id="close-post-modal" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-6 h-6"></i></button>
        </div>
        <div class="p-4 flex-1">
          <div class="flex space-x-3 mb-4">
            <img class="h-10 w-10 rounded-full" src="\${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" alt="">
            <div>
              <div class="font-bold text-gray-900">\${currentUser.displayName}</div>
              <select id="post-privacy" class="bg-gray-100 text-xs rounded px-2 py-1 outline-none">
                <option value="public">সবাই</option>
                <option value="friends">শুধু বন্ধুরা</option>
                <option value="only_me">শুধু আমি</option>
              </select>
            </div>
          </div>
          <textarea id="post-content" class="w-full h-32 resize-none outline-none text-lg placeholder-gray-400" placeholder="আপনার মনে কী চলছে?"></textarea>
          
          <div id="media-preview-container" class="flex flex-wrap gap-2 mt-2 hidden"></div>
          
          <div class="flex gap-4 mt-2">
            <input type="file" id="image-upload" accept="image/*" multiple class="hidden">
            <input type="file" id="video-upload" accept="video/*" class="hidden">
            <button id="add-image-btn" class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"><i data-lucide="image" class="w-5 h-5 text-green-500"></i><span class="text-sm font-medium">ছবি</span></button>
            <button id="add-video-btn" class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"><i data-lucide="video" class="w-5 h-5 text-red-500"></i><span class="text-sm font-medium">ভিডিও</span></button>
          </div>
          <div id="upload-progress" class="hidden mt-2 text-sm text-blue-600 font-medium"></div>

          <div id="moderation-warning" class="hidden mt-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"></div>
        </div>
        <div class="px-4 py-3 border-t">
          <button id="submit-post" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex justify-center items-center">
            <span>পোস্ট করুন</span>
            <div id="post-spinner" class="hidden ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </button>
        </div>
      </div>
    </div>`;

const newModalHtml = `    <!-- Post Modal -->
    <div id="post-modal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm hidden z-[60] flex items-center justify-center p-4 transition-opacity duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all scale-100">
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-bold text-gray-800">নতুন পোস্ট</h3>
          <button id="close-post-modal" class="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <div class="p-5 flex-1 max-h-[70vh] overflow-y-auto">
          <div class="flex space-x-3 mb-5 items-center">
            <img class="h-12 w-12 rounded-full object-cover shadow-sm border border-gray-100" src="\${currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.uid}" alt="">
            <div>
              <div class="font-bold text-gray-900 text-[15px]">\${currentUser.displayName}</div>
              <div class="relative mt-1">
                <select id="post-privacy" class="appearance-none bg-blue-50 text-blue-700 text-xs font-semibold rounded-full pl-3 pr-8 py-1 outline-none cursor-pointer hover:bg-blue-100 transition-colors">
                  <option value="public">🌍 সবাই</option>
                  <option value="friends">👥 বন্ধুরা</option>
                  <option value="only_me">🔒 শুধু আমি</option>
                </select>
                <i data-lucide="chevron-down" class="w-3 h-3 text-blue-700 absolute right-2.5 top-1.5 pointer-events-none"></i>
              </div>
            </div>
          </div>
          
          <textarea id="post-content" class="w-full h-32 resize-none outline-none text-lg text-gray-800 placeholder-gray-400 bg-transparent" placeholder="আপনার মনে কী চলছে?"></textarea>
          
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
    </div>`;

content = content.replace(oldModalHtml, newModalHtml);

// Fix preview container rendering
const oldPreview = `previewContainer.innerHTML += \`<div class="relative w-20 h-20 rounded-lg overflow-hidden border">
             <img src="\${url}" class="w-full h-full object-cover">
           </div>\`;`;
const newPreview = `previewContainer.innerHTML += \`<div class="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-gray-200">
             <img src="\${url}" class="w-full h-full object-cover transition-transform hover:scale-105">
           </div>\`;`;
content = content.replace(oldPreview, newPreview);

const oldVideoPreview = `previewContainer.innerHTML += \`<div class="relative w-20 h-20 rounded-lg overflow-hidden border bg-black flex items-center justify-center">
             <video src="\${url}" class="w-full h-full object-cover"></video>
             <i data-lucide="video" class="w-6 h-6 text-white absolute"></i>
           </div>\`;`;
const newVideoPreview = `previewContainer.innerHTML += \`<div class="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-black flex items-center justify-center">
             <video src="\${url}" class="w-full h-full object-cover opacity-80"></video>
             <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                <i data-lucide="play-circle" class="w-8 h-8 text-white drop-shadow-md"></i>
             </div>
           </div>\`;`;
content = content.replace(oldVideoPreview, newVideoPreview);


// Update warning text logic
content = content.replace(`warning.textContent = 'দয়া করে কিছু লিখুন অথবা ছবি/ভিডিও নির্বাচন করুন।';`, 
`document.getElementById('warning-text')!.textContent = 'দয়া করে কিছু লিখুন অথবা ছবি/ভিডিও নির্বাচন করুন।';`);
content = content.replace(`warning.textContent = 'সতর্কতা: ' + modData.reason;`, 
`document.getElementById('warning-text')!.textContent = 'সতর্কতা: ' + modData.reason;`);
content = content.replace(`warning.textContent = 'ফাইল আপলোড ব্যর্থ হয়েছে! Firebase Console থেকে Storage চালু করা আছে কিনা এবং রুলস ঠিক আছে কিনা চেক করুন।';`, 
`document.getElementById('warning-text')!.textContent = 'ফাইল আপলোড ব্যর্থ হয়েছে! Firebase Console থেকে Storage চালু করা আছে কিনা এবং রুলস ঠিক আছে কিনা চেক করুন।';`);
content = content.replace(`warning.textContent = 'পোস্ট করতে সমস্যা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।';`, 
`document.getElementById('warning-text')!.textContent = 'পোস্ট করতে সমস্যা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।';`);

// Update progress text logic
content = content.replace(`uploadProgress.textContent = \`ছবি আপলোড হচ্ছে... (\${uploadedImages.length + 1}/\${selectedImages.length})\`;`, 
`document.getElementById('upload-progress-text')!.textContent = \`ছবি আপলোড হচ্ছে... (\${uploadedImages.length + 1}/\${selectedImages.length})\`;`);
content = content.replace(`uploadProgress.textContent = 'ভিডিও আপলোড হচ্ছে...';`, 
`document.getElementById('upload-progress-text')!.textContent = 'ভিডিও আপলোড হচ্ছে...';`);
content = content.replace(`uploadProgress.textContent = 'পোস্ট সংরক্ষণ করা হচ্ছে...';`, 
`document.getElementById('upload-progress-text')!.textContent = 'পোস্ট সংরক্ষণ করা হচ্ছে...';`);

// Fix icon import for the modal
content = content.replace(`createIcons({ icons: { Image: ImageIcon, Video, X, ThumbsUp, MessageSquare, Share2 }, nameAttr: 'data-lucide' });`,
`createIcons({ icons: { Image: ImageIcon, Video, X, ThumbsUp, MessageSquare, Share2, ChevronDown, AlertCircle, PlayCircle }, nameAttr: 'data-lucide' });`);
content = content.replace(`import('lucide').then(({ createIcons, Image: ImageIcon, Video, X, ThumbsUp, MessageSquare, Share2 }) => {`,
`import('lucide').then(({ createIcons, Image: ImageIcon, Video, X, ThumbsUp, MessageSquare, Share2, ChevronDown, AlertCircle, PlayCircle }) => {`);

content = content.replace(`import('lucide').then(({ createIcons, Video }) => {`,
`import('lucide').then(({ createIcons, PlayCircle }) => {`);
content = content.replace(`createIcons({ icons: { Video }, nameAttr: 'data-lucide' });`,
`createIcons({ icons: { PlayCircle }, nameAttr: 'data-lucide' });`);

fs.writeFileSync('src/ui/feed.ts', content, 'utf-8');
