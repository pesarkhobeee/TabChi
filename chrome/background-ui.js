import { getStorage, setStorage, removeStorage } from './utils/storage.js';
import { fetchPexelsPhoto, preloadPhoto } from './utils/api.js';
import { setStyle, setValue, getValue, addClickHandler, showElement, hideElement, setHTML, setText } from './utils/dom.js';

export function initBackgroundUI() {
  const typeSelect = document.getElementById('background-setting');
  const colorInput = document.getElementById('background-color');
  const fileInput = document.getElementById('background-image');
  const pexelsSearch = document.getElementById('pexels-search');
  const pexelsApiKey = document.getElementById('pexels-api-key');
  const pexelsAuto = document.getElementById('pexels-auto-refresh');
  const refreshBtn = document.getElementById('refresh-pexels');
  const wallpaperEl = document.getElementById('wallpaper-image');
  const photographerInfo = document.getElementById('photographer-info');
  const photographerLink = document.getElementById('photographer-link');
  const photoTitleEl = document.getElementById('photo-title');
  const photographerNameEl = document.getElementById('photographer-name');

  // Load and apply stored settings
  getStorage([
    'backgroundType','backgroundColor','backgroundImage',
    'pexelsSearch','pexelsApiKey','pexelsAutoRefresh',
    'preloadedImage','preloadedPhotographerName','preloadedPhotoUrl','preloadedPhotoTitle'
  ]).then(s => {
    typeSelect.value = s.backgroundType || 'color';
    colorInput.value = s.backgroundColor || '#ffffff';
    pexelsSearch.value = s.pexelsSearch || '';
    pexelsApiKey.value = s.pexelsApiKey || '';
    pexelsAuto.checked = s.pexelsAutoRefresh || false;
    updateUI();
    applyCurrent(s);
    if (typeSelect.value === 'pexels' && pexelsAuto.checked) {
      loadPexels();
    }
  });

  // Bind control events
  typeSelect.addEventListener('change', onChange);
  colorInput.addEventListener('change', onChange);
  fileInput.addEventListener('change', onFileChange);
  pexelsSearch.addEventListener('change', onChange);
  pexelsApiKey.addEventListener('change', onChange);
  pexelsAuto.addEventListener('change', onChange);
  refreshBtn.addEventListener('click', () => { if (typeSelect.value === 'pexels') loadPexels(); });

  // Ensure panel open also refreshes control visibility
  const settingsToggle = document.getElementById('settings-toggle');
  if (settingsToggle) {
    settingsToggle.addEventListener('click', updateUI);
  }

  function onChange() {
    // if switching to custom image, disable Pexels auto-refresh and clear any preloaded metadata
    let auto = pexelsAuto.checked;
    if (typeSelect.value === 'image') {
      auto = false;
      pexelsAuto.checked = false;
      removeStorage(['preloadedImage','preloadedPhotographerName','preloadedPhotoUrl','preloadedPhotoTitle']);
    }
    const settings = {
      backgroundType: typeSelect.value,
      backgroundColor: colorInput.value,
      pexelsSearch: pexelsSearch.value,
      pexelsApiKey: pexelsApiKey.value,
      pexelsAutoRefresh: auto
    };
    setStorage(settings);
    updateUI();
    applySettings(settings);
  }

  function updateUI() {
    hideElement('color-picker-container');
    hideElement('image-upload-container');
    hideElement('pexels-container');
    const v = typeSelect.value;
    if (v === 'color') showElement('color-picker-container');
    else if (v === 'image') showElement('image-upload-container');
    else if (v === 'pexels') showElement('pexels-container');
  }

  function applySettings(s) {
    if (s.backgroundType === 'color') {
      document.body.style.backgroundColor = s.backgroundColor;
      setStyle('wallpaper-image', { backgroundImage: '' });
      photographerInfo.style.display = 'none';
    } else if (s.backgroundType === 'image') {
      getStorage(['backgroundImage']).then(r => r.backgroundImage && applyBackgroundImage(r.backgroundImage));
    } else if (s.backgroundType === 'pexels') {
      loadPexels();
    }
  }

  function applyCurrent(s) {
    if (s.backgroundType === 'color') {
      document.body.style.backgroundColor = s.backgroundColor;
    } else if (s.backgroundType === 'image' && s.backgroundImage) {
      applyBackgroundImage(s.backgroundImage);
    } else if (s.backgroundType === 'pexels') {
      if (s.preloadedImage) {
        applyPreloaded(s);
      } else {
        loadPexels();
      }
    }
  }

  function applyBackgroundImage(dataUrl) {
    setStyle('wallpaper-image', { backgroundImage: `url(${dataUrl})` });
    photographerInfo.style.display = 'none';
  }

  function applyPreloaded(s) {
    setStyle('wallpaper-image', { backgroundImage: `url(${s.preloadedImage})` });
    setText('photo-title', s.preloadedPhotoTitle);
    setText('photographer-name', s.preloadedPhotographerName);
    photographerLink.href = s.preloadedPhotoUrl;
    photographerInfo.style.display = 'block';
  }

  async function loadPexels() {
    try {
      const photo = await fetchPexelsPhoto(pexelsSearch.value, pexelsApiKey.value);
      const dataUrl = await preloadPhoto(photo);
      setStorage({
        backgroundImage: dataUrl,
        preloadedImage: null,
        photographerName: photo.photographer,
        photographerUrl: photo.url,
        photoTitle: photo.alt
      });
      applyBackgroundImage(dataUrl);
      setText('photo-title', photo.alt);
      setText('photographer-name', photo.photographer);
      photographerLink.href = photo.url;
      photographerInfo.style.display = 'block';
    } catch (e) {
      console.error('Pexels error', e);
    }
  }

  function onFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const rawUrl = reader.result;
      // compress/resize image to avoid storage quota issues
      const img = new Image(); img.onload = () => {
        const cw = window.innerWidth, ch = window.innerHeight;
        const canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.8);
        // set as custom image and clear Pexels state
        typeSelect.value = 'image'; pexelsAuto.checked = false;
        setStorage({ backgroundImage: compressedUrl, backgroundType: 'image', pexelsAutoRefresh: false });
        removeStorage(['preloadedImage','preloadedPhotographerName','preloadedPhotoUrl','preloadedPhotoTitle']);
        updateUI(); applyBackgroundImage(compressedUrl);
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(f);
  }

  // Kickstart UI visibility for background controls
  updateUI();
}
