import { User } from 'firebase/auth';

export function renderAdmin(container: HTMLElement, currentUser: User) {
  // Check if admin
  container.innerHTML = `
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex items-center space-x-3 mb-8">
        <i data-lucide="shield-alert" class="w-8 h-8 text-red-600"></i>
        <h1 class="text-3xl font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium">মোট ব্যবহারকারী</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium">মোট পোস্ট</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium">মোট রিপোর্ট</div>
          <div class="text-3xl font-bold text-red-600 mt-2">0</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium">আজকের পোস্ট</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">সাম্প্রতিক রিপোর্ট</h2>
        <div class="text-gray-500 text-center py-10">কোনো রিপোর্ট পাওয়া যায়নি।</div>
      </div>
    </div>
  `;

  setTimeout(() => {
    import('lucide').then(({ createIcons, ShieldAlert }) => {
      createIcons({ icons: { ShieldAlert }, nameAttr: 'data-lucide' });
    });
  }, 0);
}
