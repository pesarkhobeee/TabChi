/*
This file is dedicated to all functionalities related to altering keyboard keys's default behavior.
*/

function keyboardManager() {
  // Detect when an element with tabindex 3 receives focus
  $("[tabindex=6]").on("focus", function () {
    // Set a delay to move the focus to the element with tabindex 1 after the current event loop
    setTimeout(function () {
      $("[tabindex=1]").focus();
    }, 0);
  });

  document.addEventListener("keydown", function (event) {
    const isOnNotepadTextarea = $(document.activeElement).is(
      "#popup_note_textarea",
    );

    if (event.key === "Tab") {
      if (!isOnNotepadTextarea) {
        const fromAddressBar = !event.target.matches(
          "body, html, input, button, textarea, select, .main_menu_link",
        );
        if (fromAddressBar) {
          event.preventDefault();
          $("[tabindex=1]").focus();
        }
      } else {
        event.preventDefault();
        // Add your code to be executed when the cursor is on the notepad textarea
        // and the 'Tab' key is pressed
      }
    } else if (event.key === "Escape") {
      $(":focus").blur();
      $(".tabChiDeck").hide();
    }
  });
}
