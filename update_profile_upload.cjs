const fs = require('fs');
let content = fs.readFileSync('src/ui/profile.ts', 'utf-8');

// Ensure storage imports exist
if (!content.includes('import { ref, uploadBytesResumable, getDownloadURL } from \'firebase/storage\';')) {
  content = content.replace("import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';", "import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';\nimport { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';\nimport { storage } from '../firebase/config';");
}

// Update modal HTML to use file input instead of URL input
const oldHtml = `<div>
            <label class="block text-sm font-medium text-gray-700 mb-1">প্রোফাইল ছবির লিংক (URL)</label>
            <input type="url" id="edit-photo-url" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>`;

const newHtml = `<div>
            <label class="block text-sm font-medium text-gray-700 mb-1">প্রোফাইল ছবি পরিবর্তন করুন</label>
            <div class="flex items-center space-x-4">
              <img id="edit-photo-preview" src="https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder" class="h-16 w-16 rounded-full object-cover border">
              <input type="file" id="edit-photo-file" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            </div>
            <div id="upload-progress-text" class="text-xs text-blue-600 mt-2 hidden">আপলোড হচ্ছে...</div>
          </div>`;
content = content.replace(oldHtml, newHtml);

// Update Logic for init Modal
const oldInitLogic = `(document.getElementById('edit-photo-url') as HTMLInputElement).value = currentData.photoURL || '';`;
const newInitLogic = `(document.getElementById('edit-photo-preview') as HTMLImageElement).src = currentData.photoURL || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${uid}\`;
        (document.getElementById('edit-photo-file') as HTMLInputElement).value = '';`;
content = content.replace(oldInitLogic, newInitLogic);


// Add File change listener logic before save action
const fileListenerLogic = `
    const photoInput = document.getElementById('edit-photo-file') as HTMLInputElement;
    const photoPreview = document.getElementById('edit-photo-preview') as HTMLImageElement;
    let selectedProfileImage: File | null = null;
    
    if (photoInput && photoPreview) {
      photoInput.addEventListener('change', (e: any) => {
        if (e.target.files && e.target.files[0]) {
          selectedProfileImage = e.target.files[0];
          photoPreview.src = URL.createObjectURL(selectedProfileImage);
        }
      });
    }

    if (saveProfileBtn) {`;
content = content.replace("if (saveProfileBtn) {", fileListenerLogic);

// Update save logic
const oldSaveLogic = `const photoURL = (document.getElementById('edit-photo-url') as HTMLInputElement).value.trim();`;
const newSaveLogic = `// We will get photo URL either from existing or new upload
        let finalPhotoURL = currentData.photoURL || '';
        const progressText = document.getElementById('upload-progress-text')!;`;
content = content.replace(oldSaveLogic, newSaveLogic);

// Replace actual save logic block
const targetSaveLogicBlock = `try {
          // Note: ensure update profile logic matches rules
          await updateDoc(doc(db, 'users', uid), {
            name,
            bio,
            photoURL
          });`;

const replacementSaveLogicBlock = `try {
          if (selectedProfileImage) {
             progressText.classList.remove('hidden');
             const storageRef = ref(storage, \`profiles/\${uid}/\${Date.now()}_\${selectedProfileImage.name}\`);
             const uploadTask = await uploadBytesResumable(storageRef, selectedProfileImage);
             finalPhotoURL = await getDownloadURL(uploadTask.ref);
             progressText.classList.add('hidden');
          }

          // Note: ensure update profile logic matches rules
          await updateDoc(doc(db, 'users', uid), {
            name,
            bio,
            photoURL: finalPhotoURL
          });`;
          
content = content.replace(targetSaveLogicBlock, replacementSaveLogicBlock);


// Update references to finalPhotoURL in UI update part
content = content.replace('photoURL: photoURL || null', 'photoURL: finalPhotoURL || null');
content = content.replace('if (photoURL) {', 'if (finalPhotoURL) {');
content = content.replace('as HTMLImageElement).src = photoURL;', 'as HTMLImageElement).src = finalPhotoURL;');
content = content.replace('currentData.photoURL = photoURL;', 'currentData.photoURL = finalPhotoURL;');

fs.writeFileSync('src/ui/profile.ts', content, 'utf-8');
