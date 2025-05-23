// favorites.js: manage favorites modal and actions
import { setText } from './utils/dom.js';

export function initFavorites() {
  // Existing direct bindings
  const showBtn = document.getElementById('show-favorites');
  if (showBtn) showBtn.addEventListener('click', showFavoritesModal);

  const closeBtn = document.getElementById('close-favorites');
  if (closeBtn) closeBtn.addEventListener('click', closeFavoritesModal);

  const deleteAllBtn = document.getElementById('delete-all-favorites');
  if (deleteAllBtn) deleteAllBtn.addEventListener('click', deleteAllFavorites);

  // bind like button to toggle favorite for current photo
  const likeBtn = document.getElementById('like-photo');
  if (likeBtn) likeBtn.addEventListener('click', toggleLikeCurrentPhoto);
}

async function showFavoritesModal() {
  const container = document.getElementById('favorites-container');
  container.innerHTML = '';
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getAllFavorites' }, res => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(res);
      });
    });
    if (!response.success) throw new Error(response.error || 'Failed to load favorites');
    const items = response.favorites || [];
    if (items.length === 0) {
      container.innerHTML = '<div class="no-favorites">You have no favorites yet.</div>';
    } else {
      // show newest first
      items.sort((a, b) => b.timestamp - a.timestamp);
      items.forEach(fav => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.dataset.url = fav.photoUrl;
        item.innerHTML = `
          <img src="${fav.photoUrl}" alt="${fav.photoTitle}">
          <div class="favorite-info">${fav.photoTitle}</div>
          <div class="favorite-actions">
            <button class="delete-favorite" title="Remove">✕</button>
          </div>`;
        // click sets as background
        item.addEventListener('click', e => {
          if (!e.target.closest('.delete-favorite')) {
            setFavoriteAsBackground(fav);
          }
        });
        // delete button
        const delBtn = item.querySelector('.delete-favorite');
        delBtn.addEventListener('click', e => {
          e.stopPropagation();
          deleteFavorite(fav.photoUrl);
        });
        container.appendChild(item);
      });
    }
    document.getElementById('favorites-modal').classList.remove('hidden');
  } catch (error) {
    console.error('Error showing favorites:', error);
    showMessage('Error loading favorites: ' + error.message);
  }
}

function closeFavoritesModal() {
  const modal = document.getElementById('favorites-modal');
  if (modal) modal.classList.add('hidden');
}

function setFavoriteAsBackground(fav) {
  chrome.storage.local.set({
    backgroundType: 'pexels',
    backgroundImage: fav.photoUrl,
    photographerName: fav.photographerName,
    photographerUrl: fav.photoUrl,
    photoTitle: fav.photoTitle,
    pexelsAutoRefresh: false,
    preloadedImage: null
  }, () => {
    closeFavoritesModal();
    window.location.reload();
  });
}

async function deleteFavorite(url) {
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'manageFavoritePhotos', photo: { photoUrl: url } }, res => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(res);
      });
    });
    // refresh list
    showFavoritesModal();
  } catch (error) {
    console.error('Error deleting favorite:', error);
    showMessage('Error removing favorite');
  }
}

async function deleteAllFavorites() {
  if (!confirm('Delete all favorites?')) return;
  try {
    const resp = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getAllFavorites' }, res => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(res);
      });
    });
    if (resp.success) {
      for (const fav of resp.favorites) {
        chrome.runtime.sendMessage({ action: 'manageFavoritePhotos', photo: { photoUrl: fav.photoUrl } });
      }
      showFavoritesModal();
    }
  } catch (error) {
    console.error('Error deleting all favorites:', error);
    showMessage('Error deleting all favorites');
  }
}

// showMessage helper
function showMessage(msg) {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

// toggle like/unlike for the current displayed photo
async function toggleLikeCurrentPhoto() {
  const likeButton = document.getElementById('like-photo');
  const backgroundElement = document.getElementById('wallpaper-image');
  const photoTitle = document.getElementById('photo-title')?.textContent || '';
  const photographerName = document.getElementById('photographer-name')?.textContent || '';

  if (!backgroundElement) {
    showMessage('Error: Could not find background element');
    return;
  }

  const backgroundImage = backgroundElement.style.backgroundImage;
  if (!backgroundImage || backgroundImage === 'none') {
    showMessage('No background image to favorite');
    return;
  }

  // extract URL from style
  const imageUrl = backgroundImage.replace(/^url\(['"](.+)['"]\)$/, '$1');

  const newPhoto = {
    photoUrl: imageUrl,
    photoTitle,
    photographerName
  };

  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'manageFavoritePhotos', photo: newPhoto }, res => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(res);
      });
    });

    if (response.success) {
      if (response.action === 'added') {
        likeButton.classList.add('liked');
        likeButton.title = 'Remove from favorites';
        showMessage('Added to favorites');
      } else {
        likeButton.classList.remove('liked');
        likeButton.title = 'Add to favorites';
        showMessage('Removed from favorites');
      }
    } else {
      throw new Error(response.error || 'Failed to update favorites');
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showMessage('Error updating favorites: ' + error.message);
  }
}