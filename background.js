chrome.omnibox.onInputEntered.addListener(function(text) {
    var jumps_textarea = localStorage.getItem("jumps_textarea");
    if(jumps_textarea){
        try {
            var jumps = JSON.parse(jumps_textarea);

            shortcut = jumps.find(s => s.shortkey === text);
            var url = shortcut ? shortcut.url : null;

            if (url) {
                chrome.tabs.update({url: url});
            } else {
                chrome.tabs.update({url: text});
            }
        } catch(e) {
            console.error("Invalid JSON content in jumps_textarea: " + e);
        }
    }
});
