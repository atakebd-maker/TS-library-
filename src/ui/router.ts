import { User } from 'firebase/auth';
import { renderHome } from './feed';
import { renderProfile } from './profile';
import { renderVideos, renderPhotos, renderNotifications, renderSettings } from './extras';
import { renderMessages } from './messenger';
import { renderAdmin } from './admin';
import { renderNavbar } from './components';

export function initRouter(container: HTMLElement, currentUser: User) {
  const navigate = () => {
    const hash = window.location.hash || '#home';
    const mainContent = document.createElement('main');
    mainContent.className = 'pt-16 pb-20 md:pb-8 min-h-screen bg-gray-50';
    
    // Clear container and setup shell
    container.innerHTML = '';
    container.appendChild(renderNavbar(currentUser));
    container.appendChild(mainContent);

    const [route, id] = hash.substring(1).split('/');

    switch (route) {
      case 'home':
        renderHome(mainContent, currentUser);
        break;
      case 'profile':
        renderProfile(mainContent, currentUser, id);
        break;
      case 'videos':
        renderVideos(mainContent, currentUser);
        break;
      case 'photos':
        renderPhotos(mainContent, currentUser);
        break;
      case 'messages':
        renderMessages(mainContent, currentUser);
        break;
      case 'notifications':
        renderNotifications(mainContent, currentUser);
        break;
      case 'settings':
        renderSettings(mainContent, currentUser);
        break;
      case 'admin':
        renderAdmin(mainContent, currentUser);
        break;
      default:
        renderHome(mainContent, currentUser);
    }
  };

  window.addEventListener('hashchange', navigate);
  navigate(); // Initial route
}
