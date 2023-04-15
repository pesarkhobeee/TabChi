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
});

function initiateSettings(){
  focusClimbSearchTerm = localStorage.getItem("focusClimbSearchTerm");
  if(focusClimbSearchTerm){
      $("#focusClimbSearchTerm").val(focusClimbSearchTerm); 
  }

  focusClimbPexelsToken = localStorage.getItem("focusClimbPexelsToken");
  if(focusClimbPexelsToken){
      $("#focusClimbPexelsToken").val(focusClimbPexelsToken); 
  } else {
    focusClimbPexelsToken = '563492ad6f917000010000010b883213d49b45daaa804a8854ad452c';
  }

  focus_climb_clock = localStorage.getItem("focusClimbClock");
  if(focus_climb_clock && focus_climb_clock == "hide"){
    $("#digital-clock").hide();
  } else {
    $("#digital-clock").show();
  }

  focusClimbPushPin = localStorage.getItem("focusClimbPushPin");
  if(focusClimbPushPin){
    focus_climb_push_pin = true;
    elements.push(JSON.parse(focusClimbPushPin));
    elements_index = elements.length - 1;
  }

  focusClimbNotePad = localStorage.getItem("focusClimbNotePad");
  if(focusClimbNotePad){
      $("#popup_note_textarea").val(focusClimbNotePad); 
  }

  topsites_setting = localStorage.getItem("topsites_setting");
  if(topsites_setting){
    topsites(topsites_setting);
  }

  background_setting = localStorage.getItem("background_setting");
  backgroundController(background_setting);

  focusClimbCustomCSS = localStorage.getItem("focusClimbCustomCSS");
  if(focusClimbCustomCSS){
    $("head").append(focusClimbCustomCSS);
    $("#customcss_textarea").val(focusClimbCustomCSS);
  }
}

function backgroundController(background_setting){
  if(background_setting){
    $("#background-setting").val(background_setting);
    if(background_setting == "Color") {
      changeBackgroundColor();
      $("#fieldset-color").show();
      $("#fieldset-pexels").hide();
      $("#focusClimbPushPin").hide();
      $("#photographer").hide();
    } else if (background_setting == "Pexels") {
      updateBackground();
      $("#fieldset-color").hide();
      $("#fieldset-pexels").show();
      $("#focusClimbPushPin").fadeIn();
      $("#photographer").fadeIn();
    } else {
      offlineBackgroundPictures();
      $("#fieldset-color").hide();
      $("#fieldset-pexels").hide();
      $("#focusClimbPushPin").hide();
      $("#photographer").hide();
    }
    
  } else {
    offlineBackgroundPictures();
    $("#fieldset-color").hide();
    $("#fieldset-pexels").hide();
  }
}

function offlineBackgroundPictures() {
  var local_background_image = 'images/' + ( 1 + Math.floor(Math.random() * 12) ) + '.jpg';
  $("#fc-wallpaper-photo-hd").css("background-image", "url('" + local_background_image + "')");
  $("#focusClimbPushPin").hide();
  $("#photographer").hide();
  $("#pin").prop("disabled",true);
}

function updateBackground() {
  var background = $("#focusClimbSearchTerm").val();
  fetchNewBackground(background);
}

function getTopSites() {
  chrome.topSites.get(function(sites) {
    var container = document.querySelector('.top-sites');
    for (var i = 0; i < sites.length; i++) {
      var site = sites[i];
      var link = document.createElement('a');
      link.classList.add('site-link');
      link.href = site.url;
      var icon = document.createElement('img');
      icon.classList.add('site-icon');
      icon.src = 'chrome://favicon/size/64@1x/' + site.url;
      var title = document.createElement('span');
      title.classList.add('site-title');
      title.textContent = site.title;
      link.appendChild(icon);
      //link.appendChild(title);
      var div = document.createElement('div');
      div.classList.add('site');
      div.appendChild(link);
      container.appendChild(div);
    }
  });
}

function main_menu_actions() {
  $("#focusClimbNotepad").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      $('.tabChiDeck').hide();
      $(':focus').blur();
      toggleNotepad();
      $('#popup_note_textarea').focus();
    }
  });
  
  $("#toggleBookmark").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      $('.tabChiDeck').hide();
      $(':focus').blur();
      toggleBookmark();
    }
  });
  
  $("#ai_icon").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      $('.tabChiDeck').hide();
      $(':focus').blur();
      $("#AI-container").toggle();
      setTimeout(function() { $('#AI-user-input').focus() }, 100);
    }
  });
  
  $("#main_menu_settings").on("click keypress", function(event) {
    if (event.type === "click" || (event.type === "keypress" && event.which === 13)) {
      $('.tabChiDeck').hide();
      $(':focus').blur();
      $('.handle').trigger('click');
    }
  });
}

