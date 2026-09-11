const fs = require('fs');
let content = fs.readFileSync('src/ui/profile.ts', 'utf-8');

// Ensure updateDoc is imported
if (!content.includes('updateDoc')) {
  content = content.replace("import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';", "import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';");
}

// Add id to edit profile button
content = content.replace('<button class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">এডিট প্রোফাইল</button>', '<button id="edit-profile-btn" class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">এডিট প্রোফাইল</button>');

// Add modal HTML
const modalHtml = `
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
            <label class="block text-sm font-medium text-gray-700 mb-1">প্রোফাইল ছবির লিংক (URL)</label>
            <input type="url" id="edit-photo-url" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
  `;
content = content.replace('<!-- Posts -->', modalHtml + '\n      <!-- Posts -->');

// Add logic
const tryCatchStart = 'try {\n      const userDoc = await getDoc(doc(db, \'users\', uid));';
const logicToAdd = `
    const editBtn = document.getElementById('edit-profile-btn');
    const editModal = document.getElementById('edit-profile-modal');
    const closeEditBtn = document.getElementById('close-edit-modal');
    const saveProfileBtn = document.getElementById('save-profile');
    
    let currentData: any = {};

    if (editBtn && editModal && closeEditBtn) {
      editBtn.addEventListener('click', () => {
        (document.getElementById('edit-name') as HTMLInputElement).value = currentData.name || '';
        (document.getElementById('edit-bio') as HTMLTextAreaElement).value = currentData.bio || '';
        (document.getElementById('edit-photo-url') as HTMLInputElement).value = currentData.photoURL || '';
        editModal.classList.remove('hidden');
      });
      closeEditBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
      });
    }

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', async () => {
        const name = (document.getElementById('edit-name') as HTMLInputElement).value.trim();
        const bio = (document.getElementById('edit-bio') as HTMLTextAreaElement).value.trim();
        const photoURL = (document.getElementById('edit-photo-url') as HTMLInputElement).value.trim();
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

        try {
          // Note: ensure update profile logic matches rules
          await updateDoc(doc(db, 'users', uid), {
            name,
            bio,
            photoURL
          });
          
          import('firebase/auth').then(({ updateProfile }) => {
            if (currentUser) {
               updateProfile(currentUser, { displayName: name, photoURL: photoURL || null }).catch(console.error);
            }
          });

          // Update UI
          document.getElementById('profile-name')!.textContent = name;
          document.getElementById('profile-bio')!.textContent = bio || 'কোনো বায়ো দেওয়া নেই।';
          if (photoURL) {
            (document.getElementById('profile-pic') as HTMLImageElement).src = photoURL;
          }
          currentData.name = name;
          currentData.bio = bio;
          currentData.photoURL = photoURL;
          
          editModal?.classList.add('hidden');
        } catch (e: any) {
          console.error(e);
          errorMsg.textContent = 'সেভ করতে সমস্যা হয়েছে।';
          errorMsg.classList.remove('hidden');
        } finally {
          saveProfileBtn.removeAttribute('disabled');
          spinner.classList.add('hidden');
        }
      });
    }
`;

content = content.replace(tryCatchStart, logicToAdd + '\n    ' + tryCatchStart);

// Assign currentData
content = content.replace('const data = userDoc.data();', 'const data = userDoc.data();\n        currentData = data;');

// Add icon import for modal
content = content.replace('createIcons({ icons: { UserPlus, MessageCircle, MoreHorizontal }, nameAttr: \'data-lucide\' });', 'createIcons({ icons: { UserPlus, MessageCircle, MoreHorizontal, X }, nameAttr: \'data-lucide\' });');
content = content.replace('import(\'lucide\').then(({ createIcons, UserPlus, MessageCircle, MoreHorizontal })', 'import(\'lucide\').then(({ createIcons, UserPlus, MessageCircle, MoreHorizontal, X })');

fs.writeFileSync('src/ui/profile.ts', content, 'utf-8');
