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
  
  $("#menu-bar a").click(function(){
    menu();
  });
  
  var slider = $("#menu-bar").slideReveal({
    // width: 100,
    push: false,
    position: "right",
    // speed: 600,
    trigger: $(".handle"),
    // autoEscape: false,
    shown: function(obj){
      obj.find(".handle").html('>>');
      obj.addClass("left-shadow-overlay");
    },
    hidden: function(obj){
      obj.find(".handle").html('<<');
      obj.removeClass("left-shadow-overlay");
    }
  });
  
  
  $( "#focusClimbPexelsToken" ).focusout(function() {
    var pexels = $("#focusClimbPexelsToken").val();
    localStorage.setItem("focusClimbPexelsToken", pexels);
    focusClimbPexelsToken = pexels;
    updateBackground();
  });

  $( "#popup_note_textarea" ).focusout(function() {
    var notes = $("#popup_note_textarea").val();
    localStorage.setItem("focusClimbNotePad", notes);
  });
  
  $('#focusClimbPexelsToken').keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
     {
        $('#focusClimbPexelsToken').blur();
        return false;  
     }
   });
  
  $( "#focusClimbSearchTerm" ).focusout(function() {
    var background = $("#focusClimbSearchTerm").val();
    localStorage.setItem("focusClimbSearchTerm", background);
    updateBackground();
  });
  
  $('#focusClimbSearchTerm').keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
     {
        $('#focusClimbSearchTerm').blur();
        return false;  
     }
   });
  
  $( "#changebackground" ).click(function() {
    updateBackground();
  })
  
  $( "#previous" ).click(function() {
    previous();  
  })
  
  $( "#next" ).click(function() {
    next();   
  })
  
  $( "#clock" ).click(function() {
    toggleClock();
  })

  $( "#focusClimbPushPin" ).click(function(){
    togglePin();
  })

  $( "#pin" ).click(function(){
    togglePin();
  })

  $( "#toggleNotepad" ).click(function(){
    toggleNotepad();
  })

  $( "#focusClimbNotepad" ).click(function(){
    toggleNotepad();
  })
  
  function next(){
    if(elements_index < (elements.length - 1)){
      elements_index += 1;
      changeBackground(elements_index);
      changeButtonsStatus();
    }
  }
  
  function previous(){
    if(elements_index > 0){
      elements_index -= 1;
      changeBackground(elements_index);
      changeButtonsStatus();
    }
  }
  
  function toggleClock(){
    $("#digital-clock").toggle();
    if (focus_climb_clock == "show") {
      focus_climb_clock = "hide";
    } else {
      focus_climb_clock = "show";
    }
    localStorage.setItem("focusClimbClock", focus_climb_clock);
  }

  function toggleNotepad(){
    $("#popup_note_textarea").toggle();
  }

  function togglePin(){
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
      $(".top-sites").fadeOut();
    } else {
      $(".top-sites").toggle();
    }
  }


  $('#colorsPalette').on('change', function() {
    var colorsPalette = this.value;
    $("#fc-wallpaper-photo-hd").css({"background-color": colorsPalette, "background-image": ""});
  });
  
  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
  
    if(event.ctrlKey ) {
      switch (event.key) {
        case "V":
          updateBackground();
          break;
        case "N":
          next();
          break;
        case "B":
          previous();
          break;
        case "C":
          toggleClock();
          break;
        case "M":
          $('.handle').trigger('click');
          break;
        case "P":
          togglePin();
          break;
        case "T":
          toggleNotepad();
          break;
        case "S":
          topsites();
          break;
        default:
          return; // Quit when this doesn't handle the key event.
      }
    }

  }, true);