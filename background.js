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
    var jumps_textarea = localStorage.getItem("jumps_textarea");
    if (jumps_textarea) {
        try {
            var jumps = JSON.parse(jumps_textarea);

            shortcut = jumps.find(s => s.shortkey === text);
            var url = shortcut ? shortcut.url : null;

            if (url) {
                chrome.tabs.update({ url: url });
            } else {
                chrome.tabs.update({ url: text });
            }
        } catch (e) {
            console.error("Invalid JSON content in jumps_textarea: " + e);
        }
    }
});
