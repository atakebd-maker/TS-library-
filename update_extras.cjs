const fs = require('fs');
let content = fs.readFileSync('src/ui/extras.ts', 'utf-8');

content = content.replace(
`<div class="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
          <div>
            <div class="font-medium text-gray-900">অ্যাকাউন্ট</div>
            <div class="text-sm text-gray-500">আপনার অ্যাকাউন্টের বিবরণ পরিচালনা করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </div>`,
`<a href="#profile/\${currentUser.uid}" class="block p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
          <div>
            <div class="font-medium text-gray-900">অ্যাকাউন্ট</div>
            <div class="text-sm text-gray-500">আপনার অ্যাকাউন্টের বিবরণ এডিট করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </a>`
);

content = content.replace(
`<div class="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
          <div>
            <div class="font-medium text-gray-900">পাসওয়ার্ড</div>
            <div class="text-sm text-gray-500">আপনার পাসওয়ার্ড পরিবর্তন করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </div>`,
`<div class="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center" onclick="alert('পাসওয়ার্ড পরিবর্তনের ফিচারটি শীঘ্রই আসছে!')">
          <div>
            <div class="font-medium text-gray-900">পাসওয়ার্ড</div>
            <div class="text-sm text-gray-500">আপনার পাসওয়ার্ড পরিবর্তন করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </div>`
);

content = content.replace(
`<div class="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
          <div>
            <div class="font-medium text-gray-900">গোপনীয়তা</div>
            <div class="text-sm text-gray-500">কে আপনার পোস্ট দেখতে পারে তা নিয়ন্ত্রণ করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </div>`,
`<div class="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center" onclick="alert('গোপনীয়তা সেটিংস শীঘ্রই আসছে!')">
          <div>
            <div class="font-medium text-gray-900">গোপনীয়তা</div>
            <div class="text-sm text-gray-500">কে আপনার পোস্ট দেখতে পারে তা নিয়ন্ত্রণ করুন</div>
          </div>
          <i data-lucide="chevron-right" class="text-gray-400"></i>
        </div>`
);

fs.writeFileSync('src/ui/extras.ts', content, 'utf-8');
