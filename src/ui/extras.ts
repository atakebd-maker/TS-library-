import { User } from 'firebase/auth';

export function renderVideos(container: HTMLElement, currentUser: User) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">ভিডিও</h1>
      <div class="text-center text-gray-500 py-20 bg-white rounded-xl shadow-sm">
        <i data-lucide="video" class="w-12 h-12 mx-auto text-gray-300 mb-4"></i>
        <p>এখনো কোনো ভিডিও আপলোড করা হয়নি।</p>
      </div>
    </div>
  `;
  setTimeout(() => {
    import('lucide').then(({ createIcons, Video }) => createIcons({ icons: { Video }, nameAttr: 'data-lucide' }));
  }, 0);
}

export function renderPhotos(container: HTMLElement, currentUser: User) {
  container.innerHTML = `
    <div class="max-w-5xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">ছবি</h1>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="col-span-full text-center text-gray-500 py-20 bg-white rounded-xl shadow-sm">
          <i data-lucide="image" class="w-12 h-12 mx-auto text-gray-300 mb-4"></i>
          <p>এখনো কোনো ছবি আপলোড করা হয়নি।</p>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    import('lucide').then(({ createIcons, Image: ImageIcon }) => createIcons({ icons: { Image: ImageIcon }, nameAttr: 'data-lucide' }));
  }, 0);
}

export function renderNotifications(container: HTMLElement, currentUser: User) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">বিজ্ঞপ্তি</h1>
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="text-center text-gray-500 py-20">
          <i data-lucide="bell" class="w-12 h-12 mx-auto text-gray-300 mb-4"></i>
          <p>আপনার কোনো নতুন বিজ্ঞপ্তি নেই।</p>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    import('lucide').then(({ createIcons, Bell }) => createIcons({ icons: { Bell }, nameAttr: 'data-lucide' }));
  }, 0);
}

export function renderSettings(container: HTMLElement, currentUser: User) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">সেটিংস</h1>
      <div class="bg-white rounded-xl shadow-sm overflow-hidden divide-y">
        <a href="#profile/${currentUser.uid}" class="block p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
          <div>
            <div class="font-medium text-gray-900">অ্যাকাউন্ট</div>
            <div class="text-sm text-gray-500">আপনার অ্যাকাউন্টের বিবরণ এডিট করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </a>
        <div class="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center" onclick="alert('পাসওয়ার্ড পরিবর্তনের ফিচারটি শীঘ্রই আসছে!')">
          <div>
            <div class="font-medium text-gray-900">পাসওয়ার্ড</div>
            <div class="text-sm text-gray-500">আপনার পাসওয়ার্ড পরিবর্তন করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </div>
        <div class="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center" onclick="alert('গোপনীয়তা সেটিংস শীঘ্রই আসছে!')">
          <div>
            <div class="font-medium text-gray-900">গোপনীয়তা</div>
            <div class="text-sm text-gray-500">কে আপনার পোস্ট দেখতে পারে তা নিয়ন্ত্রণ করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    import('lucide').then(({ createIcons, ChevronRight }) => createIcons({ icons: { ChevronRight }, nameAttr: 'data-lucide' }));
  }, 0);
}
