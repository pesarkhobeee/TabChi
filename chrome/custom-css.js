import { getStorage, setStorage } from './utils/storage.js';
import { setHTML, setValue } from './utils/dom.js';

function initCustomCSS() {
      // apply saved custom CSS/HTML
      getStorage(['customCSS']).then(r => {
        console.log('Custom CSS/HTML loaded:', r.customCSS);
        if (r.customCSS) applyCustomCSS(r.customCSS);
      });
    }

// Apply custom CSS/HTML content into head container
function applyCustomCSS(content) {
  setHTML('custom-css-container', content);
  setValue('custom-css-textarea', content);
}

// Open CSS/HTML editor modal
function openCSSEditor() {
  document.getElementById('css-editor-container').classList.remove('hidden');
}

// Close CSS/HTML editor modal
function closeCSSEditor() {
  document.getElementById('css-editor-container').classList.add('hidden');
}

// Save custom CSS/HTML, apply to page, and persist
function saveCustomCSS() {
  const cssContent = document.getElementById('custom-css-textarea').value;
  applyCustomCSS(cssContent);
  setStorage({ customCSS: cssContent });
  closeCSSEditor();
  showMessage('Custom CSS/HTML saved');
}

// Show temporary message in #message element
function showMessage(msg) {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

// Export control functions for dashboard UI
export { openCSSEditor, closeCSSEditor, saveCustomCSS, initCustomCSS };