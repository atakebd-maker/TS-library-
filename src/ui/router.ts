import { User } from 'firebase/auth';
import { renderFeed as renderHome } from './feed';
import { renderProfile } from './profile';
import { renderSearch } from './search';
import { renderCreatePost } from './createPost';
import { renderVideos, renderPhotos, renderNotifications, renderSettings } from './extras';
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

    const params = hash.substring(1).split('/');
    const route = params[0];
    const id = params[1];

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
      case 'search':
        renderSearch(mainContent, currentUser, params[1] ? decodeURIComponent(params[1]) : (params.slice(1).join('/') ? decodeURIComponent(params.slice(1).join('/')) : ''));
        break;
      case 'create-post':
        renderCreatePost(mainContent, currentUser);
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
