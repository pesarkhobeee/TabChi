// Listen for messages from NotePad
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            switch (message.action) {
                case "updateNotes":
                    // Update the content in all open instances (new tab pages)
                    await broadcast("updateNotes", { notes: message.notes });
                    sendResponse({ success: true });
                    break;
                case "updateMarkdownPreview":
                    // Sync markdown preview state across tabs
                    await broadcast("updateMarkdownPreview", { isPreviewActive: message.isPreviewActive });
                    sendResponse({ success: true });
                    break;
                case "updateNotesMinimized":
                    // Sync notes minimized state across tabs
                    await broadcast("updateNotesMinimized", { isMinimized: message.isMinimized });
                    sendResponse({ success: true });
                    break;
                case "manageFavoritePhotos": {
                    const result = await manageFavoritePhotos(message.photo);
                    sendResponse({ success: true, ...result });
                    break;
                }
                case "getAllFavorites": {
                    const favorites = await getAllFavoritePhotos();
                    sendResponse({ success: true, favorites });
                    break;
                }
                default:
                    console.warn("Unknown action:", message.action);
                    sendResponse({ success: false, error: "Unknown action" });
            }
        } catch (error) {
            console.error("Error handling message:", error);
            sendResponse({ success: false, error: error.message });
        }
    })();
    return true;
});

// Helper functions for querying and broadcasting messages to new tab pages
async function getNewTabTabs() {
    return await chrome.tabs.query({ url: "chrome://newtab/" });
}

async function broadcast(action, data = {}) {
    const tabs = await getNewTabTabs();
    for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { action, ...data });
    }
}

// Initialize default values in storage when extension is installed
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('Extension installed: ', details.reason);
    
    if (details.reason === 'update') {
        // Clean up old favorites on update
        cleanupOldFavorites().then(success => {
            if (!success) {
                console.warn('Failed to clean up old favorites during update');
            }
        });
    }
    
    // Initialize storage with default values
    chrome.storage.local.get([
        'notesContent',
        'weatherEnabled',
        'cityName',
        'unit',
        'backgroundType',
        'backgroundColor',
        'customCSS',
        'notesFullscreen',
        'markdownPreviewActive',
        'notesMinimized',
        'pexelsAutoRefresh',
        'preloadedPexelsImage',
        'favoritePhotos',
        'showWeatherForecast',
        'openWeatherApiKey',
        'weatherExpanded',
        'weatherForecastTab'
    ], function(result) {
        let defaults = {};
        
        // Only set defaults for undefined settings
        if (result.notesContent === undefined) {
            defaults.notesContent = '# Welcome to TabChi!\n\nThis is a place for your notes.\n\n- Click anywhere to edit\n- Use markdown for formatting\n- Your notes are saved automatically\n\n## Markdown Tips\n\n**Bold text** or __also bold__\n\n*Italic text* or _also italic_\n\n## Lists\n- Item 1\n- Item 2\n  - Nested item\n\n1. Numbered item 1\n2. Numbered item 2\n\n## Links\n[TabChi GitHub](https://github.com/yourusername/tabchi)\n\n## Code\n`inline code`\n\n```javascript\n// Code block\nfunction hello() {\n  console.log("Hello TabChi!");\n}\n```\n\n> Blockquote example\n\n## Divider\n---\n\nEnjoy your new tab page!';
        }
        
        if (result.weatherEnabled === undefined) {
            defaults.weatherEnabled = true;
        }
        
        if (result.cityName === undefined) {
            defaults.cityName = 'New York';
        }
        
        if (result.unit === undefined) {
            defaults.unit = 'metric';
        }
        
        if (result.backgroundType === undefined) {
            defaults.backgroundType = 'color';
        }
        
        if (result.backgroundColor === undefined) {
            defaults.backgroundColor = '#f5f5f5';
        }
        
        if (result.customCSS === undefined) {
            defaults.customCSS = '';
        }

        if (result.notesFullscreen === undefined) {
            defaults.notesFullscreen = false;
        }

        if (result.markdownPreviewActive === undefined) {
            defaults.markdownPreviewActive = false;
        }

        if (result.notesMinimized === undefined) {
            defaults.notesMinimized = false;
        }

        if (result.pexelsAutoRefresh === undefined) {
            defaults.pexelsAutoRefresh = false;
        }

        if (result.preloadedPexelsImage === undefined) {
            defaults.preloadedPexelsImage = null;
        }

        if (result.favoritePhotos === undefined) {
            defaults.favoritePhotos = [];
        }
        
        if (result.showWeatherForecast === undefined) {
            defaults.showWeatherForecast = false;
        }
        
        if (result.openWeatherApiKey === undefined) {
            defaults.openWeatherApiKey = '';
        }
        
        if (result.weatherExpanded === undefined) {
            defaults.weatherExpanded = false;
        }
        
        if (result.weatherForecastTab === undefined) {
            defaults.weatherForecastTab = 'hourly';
        }
        
        // Save defaults
        if (Object.keys(defaults).length > 0) {
            chrome.storage.local.set(defaults);
            console.log('Default settings initialized: ', defaults);
        }
    });

    if (details.reason === 'install' || details.reason === 'update') {
        chrome.storage.local.get(['pexelsAutoRefresh', 'preloadedImage', 'backgroundType'], function(result) {
            // Always preload if using Pexels and there's no preloaded image yet
            if ((result.backgroundType === 'pexels' || result.pexelsAutoRefresh) && !result.preloadedImage) {
                preloadNextBackground();
            }
        });
    }
});

// Clean up when extension is disabled or uninstalled
chrome.runtime.onSuspend.addListener(function() {
    // Clean up the preloaded image data when extension is disabled
    chrome.storage.local.remove([
        'preloadedImage',
        'preloadedPhotographerName',
        'preloadedPhotoUrl',
        'preloadedPhotoTitle'
    ]);
});

// Listen for storage changes to synchronize between tabs
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local') {
        // When pexelsAutoRefresh is disabled, clean up preloaded images
        if (changes.pexelsAutoRefresh && changes.pexelsAutoRefresh.newValue === false) {
            chrome.storage.local.remove([
                'preloadedImage',
                'preloadedPhotographerName',
                'preloadedPhotoUrl',
                'preloadedPhotoTitle'
            ]);
        }
        
        // Broadcast note changes to all open tabs
        if (changes.notesContent || changes.notesFullscreen || changes.markdownPreviewActive || changes.notesMinimized) {
            chrome.tabs.query({url: "chrome://newtab/"}, function(tabs) {
                tabs.forEach(function(tab) {
                    if (changes.notesContent) {
                        chrome.tabs.sendMessage(tab.id, {
                            action: "updateNotes",
                            notes: changes.notesContent.newValue
                        });
                    }
                    
                    if (changes.notesFullscreen) {
                        chrome.tabs.sendMessage(tab.id, {
                            action: "updateNotesFullscreen",
                            isFullscreen: changes.notesFullscreen.newValue
                        });
                    }
                    
                    if (changes.markdownPreviewActive) {
                        chrome.tabs.sendMessage(tab.id, {
                            action: "updateMarkdownPreview",
                            isPreviewActive: changes.markdownPreviewActive.newValue
                        });
                    }
                    
                    if (changes.notesMinimized) {
                        chrome.tabs.sendMessage(tab.id, {
                            action: "updateNotesMinimized",
                            isMinimized: changes.notesMinimized.newValue
                        });
                    }
                });
            });
        }
        
        // Broadcast weather widget state changes to all open tabs
        if (changes.weatherExpanded || changes.weatherForecastTab) {
            chrome.tabs.query({url: "chrome://newtab/"}, function(tabs) {
                tabs.forEach(function(tab) {
                    if (changes.weatherExpanded) {
                        chrome.tabs.sendMessage(tab.id, {
                            action: "updateWeatherExpanded",
                            isExpanded: changes.weatherExpanded.newValue
                        });
                    }
                    
                    if (changes.weatherForecastTab) {
                        chrome.tabs.sendMessage(tab.id, {
                            action: "updateWeatherForecastTab",
                            tab: changes.weatherForecastTab.newValue
                        });
                    }
                });
            });
        }
        
        // Handle favorite photos changes
        if (changes.favoritePhotos) {
            chrome.tabs.query({url: "chrome://newtab/"}, function(tabs) {
                tabs.forEach(function(tab) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "updateFavorites",
                        favorites: changes.favoritePhotos.newValue
                    });
                });
            });
        }

        // When pexelsAutoRefresh is enabled, start preloading
        if (changes.pexelsAutoRefresh && changes.pexelsAutoRefresh.newValue === true) {
            preloadNextBackground();
        }
        
        // When a new tab is opened and uses the preloaded image, preload the next one immediately
        if (changes.preloadedImage) {
            // When the preloaded image is used (set to null), preload the next one
            if (changes.preloadedImage.newValue === null) {
                preloadNextBackground();
            }
            // When a new preloaded image is set, preload the next one in advance
            else if (changes.preloadedImage.oldValue === null && changes.preloadedImage.newValue) {
                // Queue up the next image preloading after a short delay
                setTimeout(() => {
                    preloadNextBackground();
                }, 1000);
            }
        }
    }
});

// Add this function to check storage quota
function checkStorageQuota() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
            const quota = 5 * 1024 * 1024; // 5MB in bytes
            const remainingSpace = quota - bytesInUse;
            resolve(remainingSpace);
        });
    });
}

// Add this function to estimate image size
function estimateImageSize(base64String) {
    // Remove the data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    // Calculate size in bytes
    return Math.ceil((base64Data.length * 3) / 4);
}

// Add cleanup function for old favorites
async function cleanupOldFavorites() {
    try {
        const result = await chrome.storage.local.get(['favoritePhotos']);
        let favorites = result.favoritePhotos || [];
        
        // If we have more than 20 favorites, keep only the most recent 20
        if (favorites.length > 20) {
            favorites = favorites.slice(-20);
            await chrome.storage.local.set({ favoritePhotos: favorites });
        }
        
        // Check if we're still over quota
        const remainingSpace = await checkStorageQuota();
        if (remainingSpace < 1024 * 1024) { // Less than 1MB remaining
            // Remove oldest photos until we have at least 1MB free
            while (favorites.length > 0 && remainingSpace < 1024 * 1024) {
                favorites.shift();
            }
            await chrome.storage.local.set({ favoritePhotos: favorites });
        }
        
        return true;
    } catch (error) {
        console.error('Error cleaning up favorites:', error);
        return false;
    }
}

// Initialize IndexedDB
let db;
const DB_NAME = 'TabChiDB';
const STORE_NAME = 'favoritePhotos';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onerror = () => {
            console.error('Error opening IndexedDB');
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'photoUrl' });
            }
        };
    });
}

// Cache image in Cache Storage
async function cacheImage(url, imageData) {
    try {
        const cache = await caches.open('tabchi-images');
        const response = new Response(imageData);
        await cache.put(url, response);
        return true;
    } catch (error) {
        console.error('Error caching image:', error);
        return false;
    }
}

// Get cached image
async function getCachedImage(url) {
    try {
        const cache = await caches.open('tabchi-images');
        const response = await cache.match(url);
        if (response) {
            return await response.blob();
        }
        return null;
    } catch (error) {
        console.error('Error getting cached image:', error);
        return null;
    }
}

// Manage favorite photos using IndexedDB
async function manageFavoritePhotos(newPhoto) {
    try {
        if (!db) {
            await initDB();
        }
        
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Check if photo already exists
        const existingPhoto = await new Promise((resolve) => {
            const request = store.get(newPhoto.photoUrl);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
        
        if (existingPhoto) {
            // Remove from favorites
            await new Promise((resolve, reject) => {
                const request = store.delete(newPhoto.photoUrl);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            // Remove from cache
            const cache = await caches.open('tabchi-images');
            await cache.delete(newPhoto.photoUrl);
            
            return { success: true, action: 'removed' };
        } else {
            // Add to favorites
            const photoData = {
                photoUrl: newPhoto.photoUrl,
                photoTitle: newPhoto.photoTitle,
                photographerName: newPhoto.photographerName,
                timestamp: Date.now()
            };
            
            // Store metadata in IndexedDB
            await new Promise((resolve, reject) => {
                const request = store.add(photoData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            // Cache the image
            await cacheImage(newPhoto.photoUrl, newPhoto.imageData);
            
            return { success: true, action: 'added' };
        }
    } catch (error) {
        console.error('Error managing favorite photos:', error);
        throw error;
    }
}

// Get all favorite photos
async function getAllFavoritePhotos() {
    try {
        if (!db) {
            await initDB();
        }
        
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting favorite photos:', error);
        return [];
    }
}

// Preload next background image
async function preloadNextBackground() {
    try {
        const result = await chrome.storage.local.get(['pexelsAutoRefresh', 'pexelsSearch', 'pexelsApiKey', 'preloadedImage']);
        
        // If we already have a preloaded image and not in auto-refresh mode, don't fetch another
        if (!result.pexelsAutoRefresh && result.preloadedImage) {
            return false;
        }
        
        if (result.pexelsAutoRefresh && result.pexelsSearch && result.pexelsApiKey) {
            // Use a random page to get varied images
            const page = Math.floor(Math.random() * 100) + 1;
            
            const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(result.pexelsSearch)}&per_page=1&page=${page}`, {
                headers: {
                    'Authorization': result.pexelsApiKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch from Pexels API');
            }
            
            const data = await response.json();
            if (data.photos && data.photos.length > 0) {
                const photo = data.photos[0];
                const imageUrl = photo.src.original;
                
                // Download the image in advance to ensure it's cached
                const imgBlob = await fetch(imageUrl).then(r => r.blob());
                const imgDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(imgBlob);
                });
                
                // Store the fully preloaded image data
                await chrome.storage.local.set({
                    preloadedImage: imgDataUrl, // Store the data URL instead of just the URL
                    preloadedPhotographerName: photo.photographer,
                    preloadedPhotoUrl: photo.url,
                    preloadedPhotoTitle: photo.alt || result.pexelsSearch
                });
                
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error preloading background:', error);
        return false;
    }
}
