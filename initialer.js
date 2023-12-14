/*
main file, all the flow control and functionality logic is starting from here.
*/

topics = {};
background_retry_count = 1;
focus_climb_clock = "show";
focus_climb_push_pin = false;
focusClimbPexelsToken = "";
focusClimbSearchTerm = "";
focus_climb_clock = "";
focusClimbPushPin = "";
focusClimbNotePad = "";
topsites_setting = "";
background_setting = "";

$(document).ready(function () {
  // Loading custom CSS first, we don't want users see the delay!
  chrome.storage.sync.get(["focusClimbCustomCSS"]).then((result) => {
    if (result.focusClimbCustomCSS) {
      $("head").append(result.focusClimbCustomCSS);
      $("#customcss_textarea").val(result.focusClimbCustomCSS);
    }
  });

  keyboardManager();
  initiateSettings();
  clockUpdate();
  setInterval(clockUpdate, 1000);
  changePinRelatedButtonsStatus();
  getTopSites();
  loadWeatherOptions();
  loadBookmarks();
  main_menu_actions();

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
      if (message.action === "updateNotes") {
        // Update the content in this instance (new tab page)
        $("#popup_note_textarea").val(message.notes);
      }
    },
  );
});

function initiateSettings() {
  chrome.storage.sync
    .get([
      "focusClimbSearchTerm",
      "focusClimbPexelsToken",
      "focus_climb_clock",
      "focusClimbPushPin",
      "focusClimbNotePad",
      "topsites_setting",
      "background_setting",
      "jumps_textarea",
    ])
    .then((result) => {
      if (result.focusClimbSearchTerm) {
        $("#focusClimbSearchTerm").val(result.focusClimbSearchTerm);
      }

      if (result.focusClimbPexelsToken) {
        focusClimbPexelsToken = result.focusClimbPexelsToken;
        $("#focusClimbPexelsToken").val(focusClimbPexelsToken);
      } else {
        focusClimbPexelsToken =
          "563492ad6f917000010000010b883213d49b45daaa804a8854ad452c";
      }

      if (result.focus_climb_clock && result.focus_climb_clock == "hide") {
        $("#digital-clock").hide();
      } else {
        $("#digital-clock").show();
      }

      if (result.focusClimbPushPin) {
        try {
          focus_climb_push_pin = result.focusClimbPushPin;
        } catch {
          console.log("There was a problem with pinned image!");
        }
      }

      if (result.focusClimbNotePad) {
        $("#popup_note_textarea").val(result.focusClimbNotePad);
      }

      if (result.topsites_setting) {
        topsites(result.topsites_setting);
      }

      backgroundController(result.background_setting);

      if (result.jumps_textarea) {
        $("#jumps_textarea").val(result.jumps_textarea);
      }
    });
}
