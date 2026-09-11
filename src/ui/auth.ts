import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function renderAuth(container: HTMLElement) {
  container.innerHTML = `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-4xl font-extrabold text-blue-600 tracking-tight">TS Library</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          আপনার অ্যাকাউন্টে প্রবেশ করুন
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-10 px-4 shadow sm:rounded-xl sm:px-10 text-center border border-gray-100">
          <button id="google-login" class="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <img class="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google">
            <span>গুগল দিয়ে চালিয়ে যান</span>
          </button>
          
          <div id="auth-spinner" class="hidden mt-6 flex justify-center">
             <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
          
          <div id="auth-error" class="hidden mt-4 p-3 bg-red-50 text-sm text-red-600 rounded-lg border border-red-100"></div>
        </div>
      </div>
    </div>
  `;

  const googleLogin = document.getElementById('google-login') as HTMLButtonElement;
  const spinner = document.getElementById('auth-spinner')!;
  const errorMsg = document.getElementById('auth-error')!;

  googleLogin.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      googleLogin.setAttribute('disabled', 'true');
      googleLogin.classList.add('opacity-50');
      spinner.classList.remove('hidden');
      errorMsg.classList.add('hidden');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'ব্যবহারকারী',
          email: user.email,
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          friendsCount: 0,
          followersCount: 0,
          followingCount: 0,
          isAdmin: false,
          isBanned: false
        });
      }
    } catch (error: any) {
      console.error(error);
      errorMsg.textContent = 'লগইন করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।';
      errorMsg.classList.remove('hidden');
      googleLogin.removeAttribute('disabled');
      googleLogin.classList.remove('opacity-50');
      spinner.classList.add('hidden');
    }
  });
}
