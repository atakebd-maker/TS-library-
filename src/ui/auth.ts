import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export function renderAuth(container: HTMLElement) {
  let isLogin = true;

  const render = () => {
    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
              TS Library
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              ${isLogin ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
            </p>
          </div>
          
          <form id="auth-form" class="mt-8 space-y-6">
            <div class="rounded-md shadow-sm space-y-4">
              ${!isLogin ? `
                <div>
                  <label for="name" class="sr-only">নাম</label>
                  <input id="name" name="name" type="text" required class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="আপনার নাম">
                </div>
              ` : ''}
              <div>
                <label for="email-address" class="sr-only">ইমেইল ঠিকানা</label>
                <input id="email-address" name="email" type="email" autocomplete="email" required class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="ইমেইল ঠিকানা">
              </div>
              <div>
                <label for="password" class="sr-only">পাসওয়ার্ড</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="পাসওয়ার্ড">
              </div>
            </div>

            <div id="error-msg" class="text-red-500 text-sm hidden text-center"></div>

            <div>
              <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                ${isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
              </button>
            </div>
            
            <div class="mt-4 text-center">
              <button type="button" id="google-login" class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                Google দিয়ে লগইন
              </button>
            </div>
          </form>

          <div class="text-center mt-4">
            <button id="toggle-mode" class="text-sm text-blue-600 hover:text-blue-500">
              ${isLogin ? 'অ্যাকাউন্ট নেই? নতুন তৈরি করুন' : 'ইতিমধ্যেই অ্যাকাউন্ট আছে? লগইন করুন'}
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const form = document.getElementById('auth-form') as HTMLFormElement;
      const toggleBtn = document.getElementById('toggle-mode');
      const googleBtn = document.getElementById('google-login');
      const errorMsg = document.getElementById('error-msg')!;

      const handleAuthError = (err: any) => {
        errorMsg.classList.remove('hidden');
        if (err?.code === 'auth/operation-not-allowed') {
          errorMsg.textContent = 'এই লগইন পদ্ধতিটি বর্তমানে বন্ধ আছে। অনুগ্রহ করে ফায়ারবেস (Firebase) কনসোল থেকে Email/Password বা Google Authentication চালু করুন।';
        } else {
          errorMsg.textContent = 'একটি ত্রুটি হয়েছে। আপনার তথ্য চেক করুন।';
        }
        console.error(err);
      };

      const syncUserToFirestore = async (user: any, name?: string) => {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            name: name || user.displayName || 'Anonymous',
            email: user.email,
            photoURL: user.photoURL || '',
            bio: '',
            friendsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isAdmin: false,
            isBanned: false,
            createdAt: serverTimestamp()
          });
        }
      };

      toggleBtn?.addEventListener('click', () => {
        isLogin = !isLogin;
        render();
      });

      googleBtn?.addEventListener('click', async () => {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          await syncUserToFirestore(result.user);
        } catch (error) {
          handleAuthError(error);
        }
      });

      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('email-address') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        
        try {
          if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
          } else {
            const name = (document.getElementById('name') as HTMLInputElement).value;
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(res.user, { displayName: name });
            await syncUserToFirestore(res.user, name);
          }
        } catch (error) {
          handleAuthError(error);
        }
      });
    }, 0);
  };

  render();
}
