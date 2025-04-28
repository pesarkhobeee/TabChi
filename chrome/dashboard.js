// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings toggle
    initSettings();
    
    // Load notes from storage
    loadNotes();
    
    // Load background settings
    loadBackgroundSettings();
    
    // Load custom CSS
    loadCustomCSS();
    
    // Set up event listeners for notes
    document.getElementById('notes-textarea').addEventListener('input', saveNotes);
    
    // Set up fullscreen notes
    document.getElementById('notes-fullscreen').addEventListener('click', toggleFullscreenNotes);
    
    // Set up custom CSS editor
    document.getElementById('toggle-css-editor').addEventListener('click', openCSSEditor);
    document.getElementById('close-css-editor').addEventListener('click', closeCSSEditor);
    document.getElementById('save-css').addEventListener('click', saveCustomCSS);
    
    // Set up Pexels refresh
    document.getElementById('refresh-pexels').addEventListener('click', refreshPexelsImage);
    document.getElementById('pexels-search').addEventListener('change', saveBackgroundSettings);
    document.getElementById('pexels-api-key').addEventListener('change', saveBackgroundSettings);
    document.getElementById('pexels-auto-refresh').addEventListener('change', saveBackgroundSettings);
    
    // Set up favorites functionality
    document.getElementById('like-photo').addEventListener('click', toggleLikeCurrentPhoto);
    document.getElementById('show-favorites').addEventListener('click', showFavoritesModal);
    document.getElementById('close-favorites').addEventListener('click', closeFavoritesModal);
    document.getElementById('delete-all-favorites').addEventListener('click', deleteAllFavorites);
    
    // Check if current photo is already liked
    checkIfCurrentPhotoLiked();
    
    // Auto-refresh Pexels image if option is enabled and it's a fresh tab load
    autoRefreshPexelsImageOnLoad();
    
    // Listen for messages from other tabs
    chrome.runtime.onMessage.addListener(function(message) {
        if (message.action === "updateNotes") {
            // Update notes without triggering another save
            document.getElementById('notes-textarea').value = message.notes;
            // Update markdown preview if it's visible
            if (document.getElementById('notes-preview').style.display === 'block') {
                updateMarkdownPreview();
            }
        } else if (message.action === "updateNotesFullscreen") {
            // Update fullscreen state of notes
            const notesContainer = document.getElementById('notes-container');
            if (message.isFullscreen) {
                notesContainer.classList.add('fullscreen-notes');
            } else {
                notesContainer.classList.remove('fullscreen-notes');
            }
        } else if (message.action === "updateWeatherExpanded") {
            // Update expanded state of weather widget
            const weatherElement = document.getElementById('weather');
            if (message.isExpanded) {
                weatherElement.classList.add('expanded');
                
                // Load forecast data if it's not already loaded
                const city = document.getElementById('city').value;
                const unit = document.getElementById('unit').value;
                const apiKey = document.getElementById('openweather-api-key').value;
                
                if (document.getElementById('hourly-forecast').children.length === 0) {
                    loadHourlyForecast(city, unit, apiKey);
                }
                
                if (document.getElementById('daily-forecast').children.length === 0) {
                    loadDailyForecast(city, unit, apiKey);
                }
            } else {
                weatherElement.classList.remove('expanded');
            }
        } else if (message.action === "updateWeatherForecastTab") {
            // Update selected forecast tab
            switchForecastTab(message.tab);
        }
    });
});

// Toggle settings panel
function initSettings() {
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsContainer = document.getElementById('settings-container');
    
    settingsToggle.addEventListener('click', function() {
        settingsContainer.classList.toggle('settings-open');
    });
    
    // Close settings panel when clicking outside
    document.addEventListener('click', function(event) {
        if (!settingsContainer.contains(event.target) && settingsContainer.classList.contains('settings-open')) {
            settingsContainer.classList.remove('settings-open');
        }
    });
    
    // Set up background settings
    const backgroundSetting = document.getElementById('background-setting');
    const colorPickerContainer = document.getElementById('color-picker-container');
    const imageUploadContainer = document.getElementById('image-upload-container');
    const pexelsContainer = document.getElementById('pexels-container');
    
    backgroundSetting.addEventListener('change', function() {
        colorPickerContainer.style.display = 'none';
        imageUploadContainer.style.display = 'none';
        pexelsContainer.style.display = 'none';
        
        if (this.value === 'color') {
            colorPickerContainer.style.display = 'block';
        } else if (this.value === 'image') {
            imageUploadContainer.style.display = 'block';
        } else if (this.value === 'pexels') {
            pexelsContainer.style.display = 'block';
        }
        
        saveBackgroundSettings();
    });
    
    // Save background color when changed
    document.getElementById('background-color').addEventListener('change', saveBackgroundSettings);
    
    // Handle image upload
    document.getElementById('background-image').addEventListener('change', handleImageUpload);
}

// Load notes from storage
function loadNotes() {
    chrome.storage.local.get(['notesContent', 'notesFullscreen'], function(result) {
        const notesTextarea = document.getElementById('notes-textarea');
        const notesContainer = document.getElementById('notes-container');
        
        if (result.notesContent) {
            notesTextarea.value = result.notesContent;
        }
        
        // Apply fullscreen state if saved
        if (result.notesFullscreen) {
            notesContainer.classList.add('fullscreen-notes');
        }
    });
}

// Save notes to storage
function saveNotes() {
    const notesContent = document.getElementById('notes-textarea').value;
    chrome.storage.local.set({ notesContent: notesContent });
    
    // Update markdown preview if it's visible
    if (document.getElementById('notes-preview').style.display === 'block') {
        updateMarkdownPreview();
    }
    
    // Notify other tabs about the change
    chrome.tabs.query({url: "chrome://newtab/"}, function(tabs) {
        tabs.forEach(function(tab) {
            // Don't send to the current tab
            if (tab.id !== chrome.runtime.id) {
                chrome.tabs.sendMessage(tab.id, { 
                    action: "updateNotes", 
                    notes: notesContent 
                });
            }
        });
    });
}

// Toggle fullscreen for notes
function toggleFullscreenNotes() {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.classList.toggle('fullscreen-notes');
    
    // Save fullscreen state
    const isFullscreen = notesContainer.classList.contains('fullscreen-notes');
    chrome.storage.local.set({ notesFullscreen: isFullscreen });
    
    // Focus the active element (either textarea or preview)
    if (isFullscreen) {
        if (document.getElementById('notes-preview').style.display === 'block') {
            document.getElementById('notes-preview').focus();
        } else {
            document.getElementById('notes-textarea').focus();
        }
    }
    
    // Notify other tabs about the change
    chrome.tabs.query({url: "chrome://newtab/"}, function(tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, { 
                action: "updateNotesFullscreen", 
                isFullscreen: isFullscreen 
            });
        });
    });
}

// Auto-refresh Pexels image on tab load if enabled
function autoRefreshPexelsImageOnLoad() {
    chrome.storage.local.get([
        'backgroundType',
        'pexelsAutoRefresh',
        'pexelsSearch',
        'pexelsApiKey',
        'preloadedImage',
        'preloadedPhotographerName',
        'preloadedPhotoUrl',
        'preloadedPhotoTitle'
    ], function(result) {
        // Check if Pexels background is selected and auto-refresh is enabled
        if (result.backgroundType === 'pexels' && 
            result.pexelsAutoRefresh === true && 
            result.pexelsApiKey) {
            
            // If we have a preloaded image, use it immediately
            if (result.preloadedImage) {
                // Apply the preloaded image and info
                applyBackgroundImage(result.preloadedImage);
                document.getElementById('photographer-name').textContent = result.preloadedPhotographerName || '';
                document.getElementById('photographer-link').href = result.preloadedPhotoUrl || '#';
                document.getElementById('photo-title').textContent = result.preloadedPhotoTitle || 'Image';
                document.getElementById('photographer-info').style.display = 'block';
                
                // Update current image storage
                chrome.storage.local.set({
                    backgroundImage: result.preloadedImage,
                    photographerName: result.preloadedPhotographerName,
                    photoUrl: result.preloadedPhotoUrl,
                    photoTitle: result.preloadedPhotoTitle
                });
                
                // Clear the preloaded data
                chrome.storage.local.remove([
                    'preloadedImage',
                    'preloadedPhotographerName',
                    'preloadedPhotoUrl',
                    'preloadedPhotoTitle'
                ]);
                
                // Preload the next image for future use
                preloadNextPexelsImage(result.pexelsSearch, result.pexelsApiKey);
            } else {
                // No preloaded image, fetch one now
                fetchPexelsImage(result.pexelsSearch, result.pexelsApiKey);
                // And preload the next one for future use
                preloadNextPexelsImage(result.pexelsSearch, result.pexelsApiKey);
            }
        }
    });
}

// Preload the next Pexels image for future tab loads
function preloadNextPexelsImage(searchTerm, apiKey) {
    const randomPage = Math.floor(Math.random() * 15) + 1; // Random page between 1-15
    
    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=1&page=${randomPage}`, {
        headers: {
            'Authorization': apiKey
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch from Pexels API');
        }
        return response.json();
    })
    .then(data => {
        if (data.photos && data.photos.length > 0) {
            const photo = data.photos[0];
            const imageUrl = photo.src.original;
            const photographerName = photo.photographer;
            const photoUrl = photo.url;
            const photoTitle = photo.alt || searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
            
            // Fetch the actual image
            return fetch(imageUrl)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        const backgroundImage = reader.result;
                        
                        // Save preloaded image for future use
                        chrome.storage.local.set({
                            preloadedImage: backgroundImage,
                            preloadedPhotographerName: photographerName,
                            preloadedPhotoUrl: photoUrl,
                            preloadedPhotoTitle: photoTitle
                        });
                    };
                    reader.readAsDataURL(blob);
                });
        }
    })
    .catch(error => {
        console.error('Error preloading image:', error);
    });
}

// Load background settings
function loadBackgroundSettings() {
    chrome.storage.local.get([
        'backgroundType', 
        'backgroundColor', 
        'backgroundImage',
        'pexelsSearch',
        'pexelsApiKey',
        'pexelsAutoRefresh',
        'photographerName',
        'photoUrl',
        'photoTitle'
    ], function(result) {
        const backgroundType = result.backgroundType || 'color';
        const backgroundColor = result.backgroundColor || '#5EA9BE';
        const backgroundImage = result.backgroundImage;
        const pexelsSearch = result.pexelsSearch || 'nature';
        const pexelsApiKey = result.pexelsApiKey || '';
        const pexelsAutoRefresh = result.pexelsAutoRefresh || false;
        
        // Set the select value
        const backgroundSetting = document.getElementById('background-setting');
        backgroundSetting.value = backgroundType;
        
        // Set the color value
        const backgroundColorPicker = document.getElementById('background-color');
        backgroundColorPicker.value = backgroundColor;
        
        // Set Pexels values
        document.getElementById('pexels-search').value = pexelsSearch;
        document.getElementById('pexels-api-key').value = pexelsApiKey;
        document.getElementById('pexels-auto-refresh').checked = pexelsAutoRefresh;
        
        // Show/hide the appropriate container
        const colorPickerContainer = document.getElementById('color-picker-container');
        const imageUploadContainer = document.getElementById('image-upload-container');
        const pexelsContainer = document.getElementById('pexels-container');
        
        colorPickerContainer.style.display = 'none';
        imageUploadContainer.style.display = 'none';
        pexelsContainer.style.display = 'none';
        
        if (backgroundType === 'color') {
            colorPickerContainer.style.display = 'block';
            document.body.style.backgroundColor = backgroundColor;
            document.getElementById('wallpaper-image').style.backgroundImage = 'none';
            document.getElementById('photographer-info').style.display = 'none';
        } else if (backgroundType === 'image') {
            imageUploadContainer.style.display = 'block';
            document.getElementById('photographer-info').style.display = 'none';
            
            if (backgroundImage) {
                applyBackgroundImage(backgroundImage);
            }
        } else if (backgroundType === 'pexels') {
            pexelsContainer.style.display = 'block';
            
            // Apply photographer info if available
            if (result.photographerName && result.photoUrl) {
                document.getElementById('photographer-name').textContent = result.photographerName;
                document.getElementById('photographer-link').href = result.photoUrl;
                document.getElementById('photo-title').textContent = result.photoTitle || 'Image';
                document.getElementById('photographer-info').style.display = 'block';
                
                // Check if this photo is in favorites
                checkIfCurrentPhotoLiked();
            }
            
            // Load new Pexels image if we have an API key but no image yet
            if (pexelsApiKey && (!backgroundImage || backgroundType !== 'pexels')) {
                fetchPexelsImage(pexelsSearch, pexelsApiKey);
            } else if (backgroundImage) {
                applyBackgroundImage(backgroundImage);
            }
        }
    });
}

// Save background settings
function saveBackgroundSettings() {
    const backgroundType = document.getElementById('background-setting').value;
    const backgroundColor = document.getElementById('background-color').value;
    const pexelsSearch = document.getElementById('pexels-search').value;
    const pexelsApiKey = document.getElementById('pexels-api-key').value;
    const pexelsAutoRefresh = document.getElementById('pexels-auto-refresh').checked;
    
    const settings = {
        backgroundType: backgroundType,
        backgroundColor: backgroundColor,
        pexelsSearch: pexelsSearch,
        pexelsApiKey: pexelsApiKey,
        pexelsAutoRefresh: pexelsAutoRefresh
    };
    
    chrome.storage.local.set(settings);
    
    // Apply the changes immediately
    if (backgroundType === 'color') {
        document.body.style.backgroundColor = backgroundColor;
        document.getElementById('wallpaper-image').style.backgroundImage = 'none';
        document.getElementById('photographer-info').style.display = 'none';
    } else if (backgroundType === 'pexels' && pexelsApiKey) {
        fetchPexelsImage(pexelsSearch, pexelsApiKey);
        
        // If auto-refresh is enabled, preload the next image
        if (pexelsAutoRefresh) {
            preloadNextPexelsImage(pexelsSearch, pexelsApiKey);
        }
    }
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const backgroundImage = e.target.result;
            chrome.storage.local.set({ backgroundImage: backgroundImage });
            applyBackgroundImage(backgroundImage);
            document.getElementById('photographer-info').style.display = 'none';
        };
        
        reader.readAsDataURL(file);
    }
}

// Apply background image
function applyBackgroundImage(imageData) {
    document.getElementById('wallpaper-image').style.backgroundImage = `url(${imageData})`;
}

// Fetch a new image from Pexels
function fetchPexelsImage(searchTerm, apiKey) {
    const randomPage = Math.floor(Math.random() * 15) + 1; // Random page between 1-15
    
    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=1&page=${randomPage}`, {
        headers: {
            'Authorization': apiKey
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch from Pexels API');
        }
        return response.json();
    })
    .then(data => {
        if (data.photos && data.photos.length > 0) {
            const photo = data.photos[0];
            const imageUrl = photo.src.original;
            const photographerName = photo.photographer;
            const photographerUrl = photo.photographer_url;
            const photoTitle = photo.alt || searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
            const photoUrl = photo.url;
            
            // Fetch the actual image
            return fetch(imageUrl)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        const backgroundImage = reader.result;
                        
                        // Save image and photographer info
                        chrome.storage.local.set({
                            backgroundImage: backgroundImage,
                            photographerName: photographerName,
                            photographerUrl: photographerUrl,
                            photoTitle: photoTitle,
                            photoUrl: photoUrl
                        });
                        
                        // Apply the image and photographer info
                        applyBackgroundImage(backgroundImage);
                        document.getElementById('photographer-name').textContent = photographerName;
                        document.getElementById('photographer-link').href = photoUrl;
                        document.getElementById('photo-title').textContent = photoTitle;
                        document.getElementById('photographer-info').style.display = 'block';
                    };
                    reader.readAsDataURL(blob);
                });
        } else {
            throw new Error('No images found for this search term');
        }
    })
    .catch(error => {
        showMessage('Error: ' + error.message);
    });
}

// Refresh Pexels image
function refreshPexelsImage() {
    const searchTerm = document.getElementById('pexels-search').value;
    const apiKey = document.getElementById('pexels-api-key').value;
    
    if (apiKey) {
        fetchPexelsImage(searchTerm, apiKey);
    } else {
        showMessage('Please enter a Pexels API key');
    }
}

// Load custom CSS
function loadCustomCSS() {
    chrome.storage.local.get(['customCSS'], function(result) {
        if (result.customCSS) {
            document.getElementById('custom-css-textarea').value = result.customCSS;
            applyCustomCSS(result.customCSS);
        }
    });
}

// Apply custom CSS content to the page
function applyCustomCSS(content) {
    const container = document.getElementById('custom-css-container');
    container.innerHTML = content; // Allows HTML tags like <link> and <style>
}

// Open CSS editor
function openCSSEditor() {
    document.getElementById('css-editor-container').classList.remove('hidden');
}

// Close CSS editor
function closeCSSEditor() {
    document.getElementById('css-editor-container').classList.add('hidden');
}

// Save custom CSS
function saveCustomCSS() {
    const cssContent = document.getElementById('custom-css-textarea').value;
    
    // Apply CSS to the page
    applyCustomCSS(cssContent);
    
    // Save to storage
    chrome.storage.local.set({ customCSS: cssContent });
    
    // Close the editor
    closeCSSEditor();
    
    showMessage('Custom CSS/HTML saved');
}

// Show message
function showMessage(content) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = content;
        messageElement.style.display = 'block';
        messageElement.style.opacity = '1';
        
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 500);
        }, 4000);
    }
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function getValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value : null;
}

function setValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value;
    }
}

function setStyle(elementId, styles) {
    const element = document.getElementById(elementId);
    if (element) {
        Object.assign(element.style, styles);
    }
}

function setAttribute(elementId, attribute, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.setAttribute(attribute, value);
    }
}

function setProperty(elementId, property, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element[property] = value;
    }
}

function addClickHandler(elementId, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener('click', handler);
    }
}

function setHTML(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

function detachElement(elementId) {
    const element = document.getElementById(elementId);
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function toggleElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

function backgroundController(background_setting) {
    if (background_setting) {
        setValue('background-setting', background_setting);
        if (background_setting === "Color") {
            changeBackgroundColor();
            showElement('fieldset-color');
            hideElement('fieldset-pexels');
            hideElement('focusClimbPushPin');
            hideElement('photographer');
        } else if (background_setting === "Pexels") {
            showPexelsBackground();
            hideElement('fieldset-color');
            showElement('fieldset-pexels');
            showElement('focusClimbPushPin');
            showElement('photographer');
        } else {
            offlineBackgroundPictures();
            hideElement('fieldset-color');
            hideElement('fieldset-pexels');
            hideElement('focusClimbPushPin');
            hideElement('photographer');
        }
    } else {
        offlineBackgroundPictures();
        hideElement('fieldset-color');
        hideElement('fieldset-pexels');
    }
}

function changeBackgroundColor(color_code) {
    if (color_code) {
        chrome.storage.local.set({ colorsPalette: color_code });
    } else {
        chrome.storage.local.get(["colorsPalette"]).then((result) => {
            setValue('colorsPalette', result.color_code);
        });
    }
    setStyle('fc-wallpaper-photo-hd', {
        backgroundColor: color_code,
        backgroundImage: ''
    });
}

function loadBackgroundFromLocalStorage() {
    if (focus_climb_push_pin) {
        return false;
    }

    chrome.storage.local.get([
        'backgroundImage', 
        'backgroundImagePhotographer', 
        'backgroundImagePhotographerlink',
        'preloadedImage',
        'preloadedPhotographerName',
        'preloadedPhotoUrl',
        'preloadedPhotoTitle'
    ], function(result) {
        // First try to use preloaded image if available
        if (result.preloadedImage) {
            setStyle('wallpaper-image', {
                backgroundImage: `url(${result.preloadedImage})`
            });
            setAttribute('photographer_link', 'href', result.preloadedPhotoUrl);
            setAttribute('photographer_link', 'alt', result.preloadedPhotographerName);
            setText('photo-title', result.preloadedPhotoTitle);
            
            // Clear the preloaded image after using it
            chrome.storage.local.set({
                preloadedImage: null,
                preloadedPhotographerName: null,
                preloadedPhotoUrl: null,
                preloadedPhotoTitle: null
            });
        } 
        // Fall back to regular background image
        else if (result.backgroundImage) {
            setStyle('wallpaper-image', {
                backgroundImage: `url(${result.backgroundImage})`
            });
            setAttribute('photographer_link', 'href', result.backgroundImagePhotographerlink);
            setAttribute('photographer_link', 'alt', result.backgroundImagePhotographer);
        }
    });
}

function fetchNewBackground(searchTerm, searchLimit = 0) {
    if (focus_climb_push_pin) {
        setStyle('fc-wallpaper-photo-hd', {
            backgroundImage: `url(${focus_climb_push_pin.backgroundImage})`
        });
        setAttribute('photographer_link', 'href', focus_climb_push_pin.backgroundImagePhotographerlink);
        setAttribute('photographer_link', 'alt', focus_climb_push_pin.backgroundImagePhotographer);
        return false;
    }

    showElement('focusClimbPushPin');
    setProperty('pin', 'disabled', false);

    if (!searchLimit) {
        searchLimit = topics[searchTerm] || 8000;
        var number = 1 + Math.floor(Math.random() * searchLimit);
    } else {
        var number = 1 + Math.floor(Math.random() * searchLimit);
    }

    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&orientation=landscape&size=large&per_page=1&page=${number}`, {
        headers: {
            'Authorization': focusClimbPexelsToken
        }
    })
    .then(response => response.json())
    .then(result => {
        try {
            var total_results = result.total_results;
            topics[searchTerm] = total_results;
            if (result.photos[0].src.original) {
                changeBackground(result);
            }
        } catch (error) {
            if (background_retry_count < 3) {
                background_retry_count += 1;
                if (total_results) {
                    fetchNewBackground(searchTerm, total_results);
                } else {
                    fetchNewBackground(searchTerm);
                }
            } else {
                background_retry_count = 1;
                showMessage("Something is wrong, couldn't fetch any image, maybe your search term or ...!");
            }
        }
    })
    .catch(error => {
        showMessage("Something is wrong, couldn't fetch any image!");
        offlineBackgroundPictures();
    });
}

function offlineBackgroundPictures() {
    var local_background_image = 'background.jpg';
    setStyle('fc-wallpaper-photo-hd', {
        backgroundImage: `url('${local_background_image}')`
    });
    hideElement('focusClimbPushPin');
    hideElement('photographer');
    setProperty('pin', 'disabled', true);
}

function updateBackground() {
    var background = $("#focusClimbSearchTerm").val();
    fetchNewBackground(background);
}

function toggleModalPopup(height, width, title, contentDive) {
    const modal = document.getElementById('my-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const divToMove = document.getElementById(contentDive);

    if (modal && modalTitle && modalContent && divToMove) {
        modal.style.height = height;
        modal.style.width = width;
        modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
        modalTitle.textContent = title;
        modalContent.innerHTML = divToMove.innerHTML;

        const closeButton = document.getElementById('modal-close');
        if (closeButton) {
            closeButton.onclick = function() {
                modal.style.display = 'none';
            };
        }
    }
}

addClickHandler('AI-container-settings', function() {
    open_ai_settings_modal(true);
});

function faveiconURL(u, s = 32) {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", s);
    return url.toString();
}

function getTopSites() {
    chrome.topSites.get(function(sites) {
        var container = document.querySelector('.top-sites');
        for (var i = 0; i < sites.length; i++) {
            var site = sites[i];
            var link = document.createElement('a');
            link.classList.add('site-link');
            link.href = site.url;
            var icon = document.createElement('img');
            icon.classList.add('site-icon');
            icon.src = faveiconURL(site.url);
            var title = document.createElement('span');
            title.classList.add('site-title');
            title.textContent = site.title;
            link.appendChild(icon);
            var div = document.createElement('div');
            div.classList.add('site');
            div.appendChild(link);
            container.appendChild(div);
        }
    });
}

function checkIfCurrentPhotoLiked() {
    const photoUrl = document.getElementById('photographer-link').href;
    if (!photoUrl || photoUrl === '#') return;
    
    chrome.storage.local.get(['favoritePhotos'], function(result) {
        const favorites = result.favoritePhotos || [];
        const isLiked = favorites.some(photo => photo.photoUrl === photoUrl);
        
        if (isLiked) {
            document.getElementById('like-photo').classList.add('liked');
            document.getElementById('like-photo').title = "Remove from favorites";
        } else {
            document.getElementById('like-photo').classList.remove('liked');
            document.getElementById('like-photo').title = "Add to favorites";
        }
    });
}

async function toggleLikeCurrentPhoto() {
    const likeButton = document.getElementById('like-photo');
    const photoUrl = document.getElementById('photographer-link').href;
    const photoTitle = document.getElementById('photo-title').textContent;
    const photographerName = document.getElementById('photographer-name').textContent;
    const backgroundElement = document.getElementById('wallpaper-image');
    
    if (!photoUrl || photoUrl === '#') {
        showMessage('No valid photo to favorite');
        return;
    }
    
    if (!backgroundElement) {
        showMessage('Error: Could not find background element');
        return;
    }
    
    try {
        // Get the current background image URL
        const backgroundImage = backgroundElement.style.backgroundImage;
        if (!backgroundImage || backgroundImage === 'none') {
            showMessage('No background image to favorite');
            return;
        }
        
        // Extract the URL from the background-image style
        const imageUrl = backgroundImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
        
        const newPhoto = {
            photoUrl: imageUrl,
            photoTitle: photoTitle,
            photographerName: photographerName,
            imageData: backgroundImage
        };
        
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: "manageFavoritePhotos",
                photo: newPhoto
            }, response => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response.success) {
            if (response.action === 'added') {
                likeButton.classList.add('liked');
                likeButton.title = "Remove from favorites";
                showMessage('Added to favorites');
            } else {
                likeButton.classList.remove('liked');
                likeButton.title = "Add to favorites";
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

async function showFavoritesModal() {
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = ''; // Clear previous content
    
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: "getAllFavorites"
            }, response => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response.success) {
            const favorites = response.favorites;
            
            if (favorites.length === 0) {
                favoritesContainer.innerHTML = '<div class="no-favorites">You have no favorite images yet. Like some images to see them here.</div>';
            } else {
                // Sort by newest first
                favorites.sort((a, b) => b.timestamp - a.timestamp);
                
                // Create elements for each favorite
                for (const favorite of favorites) {
                    const favoriteItem = document.createElement('div');
                    favoriteItem.className = 'favorite-item';
                    favoriteItem.dataset.url = favorite.photoUrl;
                    
                    // Create image element
                    const img = document.createElement('img');
                    img.src = favorite.photoUrl;
                    img.alt = favorite.photoTitle;
                    
                    // Create info div
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'favorite-info';
                    infoDiv.textContent = favorite.photoTitle;
                    
                    // Create actions div
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'favorite-actions';
                    
                    // Create delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'delete-favorite';
                    deleteButton.title = "Remove from favorites";
                    deleteButton.textContent = '✕';
                    
                    // Add click handlers
                    favoriteItem.addEventListener('click', function(e) {
                        if (!e.target.closest('.delete-favorite')) {
                            setFavoriteAsBackground(favorite);
                        }
                    });
                    
                    deleteButton.addEventListener('click', function(e) {
                        e.stopPropagation();
                        deleteFavorite(favorite.photoUrl);
                    });
                    
                    // Assemble the elements
                    actionsDiv.appendChild(deleteButton);
                    favoriteItem.appendChild(img);
                    favoriteItem.appendChild(infoDiv);
                    favoriteItem.appendChild(actionsDiv);
                    favoritesContainer.appendChild(favoriteItem);
                }
            }
        } else {
            throw new Error(response.error || 'Failed to load favorites');
        }
        
        document.getElementById('favorites-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Error showing favorites:', error);
        showMessage('Error loading favorites: ' + error.message);
    }
}

function closeFavoritesModal() {
    document.getElementById('favorites-modal').classList.add('hidden');
}

function setFavoriteAsBackground(favorite) {
    // Apply the image data
    applyBackgroundImage(favorite.imageData);
    
    // Update the photographer info
    document.getElementById('photographer-name').textContent = favorite.photographerName;
    document.getElementById('photographer-link').href = favorite.photoUrl;
    document.getElementById('photo-title').textContent = favorite.photoTitle;
    document.getElementById('photographer-info').style.display = 'block';
    
    // Update like button state
    document.getElementById('like-photo').classList.add('liked');
    document.getElementById('like-photo').title = "Remove from favorites";
    
    // Save to storage
    chrome.storage.local.set({
        backgroundImage: favorite.imageData,
        photographerName: favorite.photographerName,
        photoUrl: favorite.photoUrl,
        photoTitle: favorite.photoTitle,
        backgroundType: 'pexels'
    });
    
    // Change the background type select to pexels
    document.getElementById('background-setting').value = 'pexels';
    
    // Close the modal
    closeFavoritesModal();
    
    showMessage('Background set from favorites');
}

async function deleteFavorite(photoUrl) {
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: "manageFavoritePhotos",
                photo: { photoUrl: photoUrl }
            }, response => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response.success) {
            showFavoritesModal(); // Refresh the modal
            showMessage('Removed from favorites');
        } else {
            throw new Error(response.error || 'Failed to delete favorite');
        }
    } catch (error) {
        console.error('Error deleting favorite:', error);
        showMessage('Error deleting favorite: ' + error.message);
    }
}

async function deleteAllFavorites() {
    if (confirm('Are you sure you want to delete all favorite images?')) {
        try {
            // Clear IndexedDB
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('TabChiDB');
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            const transaction = db.transaction('favoritePhotos', 'readwrite');
            const store = transaction.objectStore('favoritePhotos');
            
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            // Clear cache
            const cache = await caches.open('tabchi-images');
            await cache.keys().then(keys => {
                return Promise.all(keys.map(key => cache.delete(key)));
            });
            
            showFavoritesModal(); // Refresh the modal
            showMessage('All favorites deleted');
        } catch (error) {
            console.error('Error deleting all favorites:', error);
            showMessage('Error deleting all favorites: ' + error.message);
        }
    }
}
