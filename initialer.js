topics = {};
elements = [];
elements_index = 0;
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

$(document).ready(function() {
  keyboardManager();
  initiateSettings();
  clockUpdate();
  setInterval(clockUpdate, 1000);
  changeButtonsStatus();
  getTopSites();
  loadWeatherOptions();
  loadBookmarks();
  main_menu_actions();

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "updateNotes") {
      // Update the content in this instance (new tab page)
      $("#popup_note_textarea").val(message.notes);
    }
  });

});

function initiateSettings() {
  focusClimbSearchTerm = localStorage.getItem("focusClimbSearchTerm");
  if (focusClimbSearchTerm) {
    $("#focusClimbSearchTerm").val(focusClimbSearchTerm);
  }

  focusClimbPexelsToken = localStorage.getItem("focusClimbPexelsToken");
  if (focusClimbPexelsToken) {
    $("#focusClimbPexelsToken").val(focusClimbPexelsToken);
  } else {
    focusClimbPexelsToken = '563492ad6f917000010000010b883213d49b45daaa804a8854ad452c';
  }

  focus_climb_clock = localStorage.getItem("focusClimbClock");
  if (focus_climb_clock && focus_climb_clock == "hide") {
    $("#digital-clock").hide();
  } else {
    $("#digital-clock").show();
  }

  focusClimbPushPin = localStorage.getItem("focusClimbPushPin");
  if (focusClimbPushPin) {
    focus_climb_push_pin = true;
    elements.push(JSON.parse(focusClimbPushPin));
    elements_index = elements.length - 1;
  }

  focusClimbNotePad = localStorage.getItem("focusClimbNotePad");
  if (focusClimbNotePad) {
    $("#popup_note_textarea").val(focusClimbNotePad);
  }

  topsites_setting = localStorage.getItem("topsites_setting");
  if (topsites_setting) {
    topsites(topsites_setting);
  }

  background_setting = localStorage.getItem("background_setting");
  backgroundController(background_setting);

  focusClimbCustomCSS = localStorage.getItem("focusClimbCustomCSS");
  if (focusClimbCustomCSS) {
    $("head").append(focusClimbCustomCSS);
    $("#customcss_textarea").val(focusClimbCustomCSS);
  }

  jumps_textarea = localStorage.getItem("jumps_textarea");
  if (jumps_textarea) {
    $("#jumps_textarea").val(jumps_textarea);
  }
}
