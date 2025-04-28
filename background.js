// Listen for messages from NotePad
chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === "updateNotes") {
        // Update the content in all open instances (new tab pages)
        chrome.tabs.query({ url: "chrome://newtab/" }, function(tabs) {
            tabs.forEach(function(tab) {
                chrome.tabs.sendMessage(tab.id, { action: "updateNotes", notes: message.notes });
            });
        });
    }
});

// Initialize default values if not already set
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get(['notesContent', 'weatherEnabled', 'cityName', 'unit'], function(result) {
        if (!result.notesContent) {
            chrome.storage.local.set({ notesContent: 'Welcome to TabChi Simplified!' });
        }
        
        if (result.weatherEnabled === undefined) {
            chrome.storage.local.set({ weatherEnabled: false });
        }
        
        if (!result.cityName) {
            chrome.storage.local.set({ cityName: '' });
        }
        
        if (!result.unit) {
            chrome.storage.local.set({ unit: 'C' });
        }
    });
});

function gotoHost(text) {
    chrome.storage.local.get(["jumps_textarea"]).then((result) => {

        if (result.jumps_textarea) {
            try {
                var jumps = JSON.parse(result.jumps_textarea);
                let shortcut = jumps.find(s => s.shortkey == text);

                if (shortcut) {
                    chrome.tabs.update({ url: shortcut.url });
                }
            } catch (e) {
                console.error("Invalid JSON content in jumps_textarea: " + e);
            }
        }
    });
}

chrome.omnibox.onInputEntered.addListener(gotoHost);

chrome.commands.onCommand.addListener(function(command) {
    if (command === "_execute_action") {
        chrome.browserAction.openPopup();
    }
});
