/*
This file is dedicated to all functionalities that have to run in the background.
*/

// Listen for messages from NotePad and sync all the open tabs' notepads with it
chrome.runtime.onMessage.addListener(function (message) {
  if (message.action === "updateNotes") {
    // Update the content in all open instances (new tab pages)
    chrome.tabs.query({ url: "chrome://newtab/" }, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: "updateNotes",
          notes: message.notes,
        });
      });
    });
  } else if (message.action === "jumpHosts") {
    gotoHost(message.host);
  }
});

function gotoHost(text) {
  chrome.storage.sync.get(["jumps_textarea"]).then((result) => {
    if (result.jumps_textarea) {
      try {
        var jumps = JSON.parse(result.jumps_textarea);
        let shortcut = jumps.find((s) => s.shortkey == text);

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

chrome.commands.onCommand.addListener(function (command) {
  if (command === "_execute_action") {
    chrome.browserAction.openPopup();
  }
});
