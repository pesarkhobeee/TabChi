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


chrome.omnibox.onInputEntered.addListener(function(text) {
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
});

// TODO: bring from dahsboard.js the changeBackground and test it here
//   chrome.runtime.sendMessage({ action: "updateNotes", notes: notes });
//   use this to trigger if it possible
