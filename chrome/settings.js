import { hideElement, showElement } from './utils/dom.js';

export function initSettings() {
  const settingsContainer = document.getElementById('settings-container');
  const toggleBtn = document.getElementById('settings-toggle');
  if (!settingsContainer || !toggleBtn) return;

  // Toggle panel on toggle button click
  toggleBtn.addEventListener('click', () => {
    settingsContainer.classList.toggle('settings-open');
  });

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsContainer.contains(e.target) && settingsContainer.classList.contains('settings-open')) {
      settingsContainer.classList.remove('settings-open');
    }
  });
}