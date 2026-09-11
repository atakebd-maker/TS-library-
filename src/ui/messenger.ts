import { User } from 'firebase/auth';

export function renderMessages(container: HTMLElement, currentUser: User) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex bg-white shadow-sm overflow-hidden">
      <!-- Chat List -->
      <div class="w-1/3 border-r flex flex-col">
        <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900">বার্তা</h2>
          <button class="text-blue-600 hover:text-blue-700 bg-blue-50 p-2 rounded-full"><i data-lucide="edit" class="w-5 h-5"></i></button>
        </div>
        <div class="p-3">
          <div class="relative">
            <input type="text" placeholder="বার্তা খুঁজুন..." class="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5"></i>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 text-center text-gray-500 mt-10">
            কোনো কথোপকথন নেই
          </div>
        </div>
      </div>
      
      <!-- Chat Area -->
      <div class="flex-1 flex flex-col bg-gray-50">
        <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
          <i data-lucide="message-square" class="w-16 h-16 mb-4 text-gray-300"></i>
          <p class="text-lg">কথোপকথন শুরু করতে একটি চ্যাট নির্বাচন করুন</p>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    import('lucide').then(({ createIcons, Edit, Search, MessageSquare }) => {
      createIcons({ icons: { Edit, Search, MessageSquare }, nameAttr: 'data-lucide' });
    });
  }, 0);
}
