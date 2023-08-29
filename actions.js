function menu() {
  $("#menu-bar").slideReveal("show");
}

function changeButtonsStatus() {
  if (focus_climb_push_pin) {
    $('#changebackground').prop('disabled', true);
    $('#pin').val("UnPin the current picture");
  } else {
    $('#changebackground').prop('disabled', false);
    $('#pin').val("Pin the current picture");
  }

  if (elements_index > 0) {
    $('#previous').prop('disabled', false);
  } else {
    $('#previous').prop('disabled', true);
  }

  if (elements_index < (elements.length - 1)) {
    $('#next').prop('disabled', false);
  } else {
    $('#next').prop('disabled', true);
  }

  if (focus_climb_push_pin) {
    $("#focusClimbPushPin").css("opacity", 1);
  } else {
    $("#focusClimbPushPin").css("opacity", 0.4);
  }
}

$("#menu-bar a").click(function() {
  menu();
});

var slider = $("#menu-bar").slideReveal({
  // width: 100,
  push: false,
  position: "right",
  // speed: 600,
  trigger: $(".handle"),
  // autoEscape: false,
  shown: function(obj) {
    obj.find(".handle").html('>>');
    obj.addClass("left-shadow-overlay");
  },
  hidden: function(obj) {
    obj.find(".handle").html('<<');
    obj.removeClass("left-shadow-overlay");
  }
});

$("#focusClimbPexelsToken").focusout(function() {
  var pexels = $("#focusClimbPexelsToken").val();
  localStorage.setItem("focusClimbPexelsToken", pexels);
  focusClimbPexelsToken = pexels;
  updateBackground();
});

/*
 * TODO: Whenever it is saving the notes, it should also send a signal, telling other instanses to update themself
 *   focusClimbNotePad = localStorage.getItem("focusClimbNotePad");
  if(focusClimbNotePad){
      $("#popup_note_textarea").val(focusClimbNotePad); 
  }
*/

// Listen for focusout event on the textarea
$("#popup_note_textarea").focusout(function() {
  var notes = $("#popup_note_textarea").val();
  localStorage.setItem("focusClimbNotePad", notes);

  // Notify other instances to update their content
  chrome.runtime.sendMessage({ action: "updateNotes", notes: notes });
});

$('#focusClimbPexelsToken').keypress(function(e) {
  var key = e.which;
  if (key == 13)  // the enter key code
  {
    $('#focusClimbPexelsToken').blur();
    return false;
  }
});

$("#focusClimbSearchTerm").focusout(function() {
  var background = $("#focusClimbSearchTerm").val();
  localStorage.setItem("focusClimbSearchTerm", background);
  updateBackground();
});

$('#focusClimbSearchTerm').keypress(function(e) {
  var key = e.which;
  if (key == 13)  // the enter key code
  {
    $('#focusClimbSearchTerm').blur();
    return false;
  }
});

$("#changebackground").click(function() {
  updateBackground();
})

$("#previous").click(function() {
  previous();
})

$("#next").click(function() {
  next();
})

$("#clock").click(function() {
  toggleClock();
})

$("#focusClimbPushPin").click(function() {
  togglePin();
})

$("#pin").click(function() {
  togglePin();
})

function next() {
  if (elements_index < (elements.length - 1)) {
    elements_index += 1;
    changeBackground(elements_index);
    changeButtonsStatus();
  }
}

function previous() {
  if (elements_index > 0) {
    elements_index -= 1;
    changeBackground(elements_index);
    changeButtonsStatus();
  }
}

function toggleClock() {
  $("#digital-clock").toggle();
  if (focus_climb_clock == "show") {
    focus_climb_clock = "hide";
  } else {
    focus_climb_clock = "show";
  }
  localStorage.setItem("focusClimbClock", focus_climb_clock);
}

function toggleNotepad() {
  $("#popup_note_textarea").toggle();
}

function toggleBookmark() {
  $("#bookmarksContainer").toggle();
}

function togglePin() {
  if (focus_climb_push_pin) {
    localStorage.removeItem("focusClimbPushPin");
    focus_climb_push_pin = false;
  } else {
    var current_element = JSON.stringify(elements[elements_index]);
    localStorage.setItem("focusClimbPushPin", current_element);
    focus_climb_push_pin = true;
  }
  changeButtonsStatus();
}

$('#topsites-setting').on('change', function() {
  var topsites_setting = this.value;
  localStorage.setItem("topsites_setting", topsites_setting);
  topsites(topsites_setting);
});

$('#background-setting').on('change', function() {
  var background_setting = this.value;
  localStorage.setItem("background_setting", background_setting);
  backgroundController(background_setting);
});

function topsites(topsites_setting) {
  $('#topsites-setting').val(topsites_setting);
  if (topsites_setting == "Bottom") {
    $(".top-site-container").removeClass("top-site-container-vertical");
    $(".top-sites").removeClass("top-sites-vertical");
    $(".top-sites").show();
  } else if (topsites_setting == "Left") {
    $(".top-site-container").addClass("top-site-container-vertical");
    $(".top-sites").addClass("top-sites-vertical");
    $(".top-sites").show();
  } else if (topsites_setting == "Hidden") {
    $(".top-sites").hide();
  } else {
    $(".top-sites").toggle();
  }
}

$('#colorsPalette').on('change', function() {
  var colorsPalette = this.value;
  changeBackgroundColor(colorsPalette);
});

$('#customcss').on('click', function() {
  $("#customcss_textarea").toggle();
});

$("#customcss_textarea").focusout(function() {
  var customcss = $("#customcss_textarea").val();
  $("head").append(customcss);
  localStorage.setItem("focusClimbCustomCSS", customcss);
  location.reload();
});

$("#jumps_textarea").focusout(function() {
  var jumps_textarea = $("#jumps_textarea").val();
  try {
    var jumps = JSON.parse(jumps_textarea);
    localStorage.setItem("jumps_textarea", jumps_textarea);
  } catch (e) {
    showMessage("Invalid JSON content!");
  }
});

function main_menu_actions() {
  $("#focusClimbNotepad").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      $('.tabChiDeck').not('#popup_note_textarea').hide();
      $(':focus').blur();
      toggleNotepad();
      $('#popup_note_textarea').focus();
    }
  });

  $("#toggleBookmark").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      toggleBookmark();
      $('.tabChiDeck').not('#bookmarksContainer').hide();
      $(':focus').blur();
    }
  });

  $("#toggleJumps").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      $('.tabChiDeck').not('#jumps_textarea').hide();
      $(':focus').blur();
      $('#jumps_textarea').toggle();
      $('#jumps_textarea').focus();
    }
  });

  $("#ai_icon").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      $("#AI-container").toggle();
      $('.tabChiDeck').not('#AI-container').hide();
      $(':focus').blur();
      setTimeout(function() { $('#AI-user-input').focus() }, 100);

      open_ai_settings_modal();
    }
  });

  $("#main_menu_settings").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      $('.handle').trigger('click');
      $('.tabChiDeck').hide();
      $(':focus').blur();
    }
  });
}

function open_ai_settings_modal(OpenModal = false) {
  chat_gpt_token = localStorage.getItem("chat_gpt_token");
  if (chat_gpt_token) {
    $('#chat_gpt_token').attr("placeholder", chat_gpt_token);
  }

  chat_gpt_prompt = localStorage.getItem("chat_gpt_prompt");
  if (chat_gpt_token) {
    $('#chat_gpt_prompt').attr("placeholder", chat_gpt_prompt);
  }

  if (!chat_gpt_token || OpenModal) {
    toggleModalPopup("300px", "500px", "Login to ChatGPT", "ai_login");
  }

  $('#ai_login_submit').on('click', function() {
    var chat_gpt_token = $('#chat_gpt_token').val();
    if (chat_gpt_token) {
      localStorage.setItem("chat_gpt_token", chat_gpt_token);
    }

    var chat_gpt_prompt = $('#chat_gpt_prompt').val();
    if (chat_gpt_prompt) {
      localStorage.setItem("chat_gpt_prompt", chat_gpt_prompt);
    }
    $("#my-modal").css("display", "none");
  });
}
