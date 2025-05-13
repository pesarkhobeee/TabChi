// General purpose popup component
export function initPopupComponent(containerId, options = {}) {
    const container = (containerId && document.getElementById(containerId)) || document.body;
    const useOverlay = options.overlay !== false;
    // HTML template for popup inner content
    const popupTemplate = `
      <button class="popup-close-btn">&times;</button>
      <h2 class="popup-title"></h2>
      <div class="popup-body"></div>
      <div class="popup-buttons"></div>
    `;
    let overlayElem, popupElem;
    if (useOverlay) {
      // create overlay wrapper
      overlayElem = document.createElement('div');
      overlayElem.className = 'popup-overlay';
      overlayElem.style.display = 'none';
      overlayElem.innerHTML = `<div class="popup">${popupTemplate}</div>`;
      container.appendChild(overlayElem);
      popupElem = overlayElem.querySelector('.popup');
    } else {
      // seamless mode: append popup directly
      popupElem = document.createElement('div');
      popupElem.className = 'popup popup-seamless';
      popupElem.innerHTML = popupTemplate;
      popupElem.style.display = 'none';
      container.appendChild(popupElem);
    }
    const titleElem = popupElem.querySelector('.popup-title');
    const bodyElem = popupElem.querySelector('.popup-body');
    const buttonsElem = popupElem.querySelector('.popup-buttons');
    const closeBtn = popupElem.querySelector('.popup-close-btn');
    // Auto-hide on close click
    closeBtn.addEventListener('click', () => {
      if (useOverlay) overlayElem.style.display = 'none'; else popupElem.style.display = 'none';
    });
    // Apply options for size and position
    if (options.width) popupElem.style.width = options.width;
    if (options.height) popupElem.style.height = options.height;
    if (options.position) {
      popupElem.style.position = 'absolute';
      Object.entries(options.position).forEach(([side, val]) => {
        popupElem.style[side] = val;
      });
    }
    return {
      setTitle: (title) => { titleElem.innerHTML = title; },
      setBody: (html) => { bodyElem.innerHTML = html; },
      setButtons: (buttons) => {
        buttonsElem.innerHTML = '';
        buttons.forEach(btn => {
          const button = document.createElement('button');
          button.textContent = btn.text;
          button.addEventListener('click', btn.onClick);
          buttonsElem.appendChild(button);
        });
      },
      setSize: ({ width, height }) => {
        if (width) popupElem.style.width = width;
        if (height) popupElem.style.height = height;
      },
      setPosition: (pos) => {
        popupElem.style.position = 'absolute';
        Object.entries(pos).forEach(([side, val]) => {
          popupElem.style[side] = val;
        });
      },
      show: () => {
        if (useOverlay) overlayElem.style.display = 'flex'; else popupElem.style.display = 'block';
      },
      hide: () => {
        if (useOverlay) overlayElem.style.display = 'none'; else popupElem.style.display = 'none';
      }
    };
}
