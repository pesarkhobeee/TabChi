// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to open new tab button
    document.getElementById('open-tab').addEventListener('click', function() {
        chrome.tabs.create({ url: 'chrome://newtab' });
    });
});
