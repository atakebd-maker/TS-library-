import './index.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase/config';
import { doc, getDocFromServer } from 'firebase/firestore';
import { initRouter } from './ui/router';
import { renderAuth } from './ui/auth';

const appEl = document.getElementById('app')!;

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

function renderLoading() {
  appEl.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="mt-4 text-gray-600 font-semibold text-lg">লোড হচ্ছে...</p>
      </div>
    </div>
  `;
}

function initApp() {
  renderLoading();
  testConnection();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      initRouter(appEl, user);
    } else {
      renderAuth(appEl);
    }
  });
}

initApp();
