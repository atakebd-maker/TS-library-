const fs = require('fs');
let content = fs.readFileSync('src/ui/feed.ts', 'utf-8');

// 1. Update Submit Logic
const oldSubmit = `      submitBtn.addEventListener('click', async () => {
        const text = contentEl.value.trim();
        if (!text) return;
        
        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        warning.classList.add('hidden');
        
        try {
          // 1. Moderate content via server
          const modRes = await fetch('/api/moderate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
          
          const modData = await modRes.json();
          if (!modData.safe) {
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
          uploadProgress.classList.add('hidden');`;

const newSubmit = `      submitBtn.addEventListener('click', async () => {
        const text = contentEl.value.trim();
        if (!text && selectedImages.length === 0 && !selectedVideo) {
            warning.textContent = 'দয়া করে কিছু লিখুন অথবা ছবি/ভিডিও নির্বাচন করুন।';
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
            warning.textContent = 'সতর্কতা: ' + modData.reason;
            warning.classList.remove('hidden');
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
            return;
          }
          
          let uploadedImages: string[] = [];
          let uploadedVideos: string[] = [];
          
          uploadProgress.classList.remove('hidden');
          
          try {
              // Upload Images
              for (const file of selectedImages) {
                 uploadProgress.textContent = \`ছবি আপলোড হচ্ছে... (\${uploadedImages.length + 1}/\${selectedImages.length})\`;
                 const storageRef = ref(storage, \`posts/\${currentUser.uid}/\${Date.now()}_\${file.name.replace(/[^a-zA-Z0-9.]/g, '')}\`);
                 const uploadTask = await uploadBytesResumable(storageRef, file);
                 const downloadURL = await getDownloadURL(uploadTask.ref);
                 uploadedImages.push(downloadURL);
              }
              
              // Upload Video
              if (selectedVideo) {
                 uploadProgress.textContent = 'ভিডিও আপলোড হচ্ছে...';
                 const storageRef = ref(storage, \`posts/\${currentUser.uid}/\${Date.now()}_\${selectedVideo.name.replace(/[^a-zA-Z0-9.]/g, '')}\`);
                 const uploadTask = await uploadBytesResumable(storageRef, selectedVideo);
                 const downloadURL = await getDownloadURL(uploadTask.ref);
                 uploadedVideos.push(downloadURL);
              }
          } catch (storageError) {
              console.error("Storage upload error:", storageError);
              warning.textContent = 'ফাইল আপলোড ব্যর্থ হয়েছে! Firebase Console থেকে Storage চালু করা আছে কিনা এবং রুলস ঠিক আছে কিনা চেক করুন।';
              warning.classList.remove('hidden');
              submitBtn.disabled = false;
              spinner.classList.add('hidden');
              uploadProgress.classList.add('hidden');
              return;
          }
          
          uploadProgress.textContent = 'পোস্ট সংরক্ষণ করা হচ্ছে...';`;

content = content.replace(oldSubmit, newSubmit);

// Catch block for overall try
const oldCatch = `        } catch (e) {
          console.error(e);
          alert('একটি ত্রুটি হয়েছে!');
        } finally {`;

const newCatch = `        } catch (e) {
          console.error("Firestore post error:", e);
          warning.textContent = 'পোস্ট করতে সমস্যা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
          warning.classList.remove('hidden');
        } finally {`;
content = content.replace(oldCatch, newCatch);

fs.writeFileSync('src/ui/feed.ts', content, 'utf-8');
