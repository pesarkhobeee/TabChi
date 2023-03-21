topics = {};
elements = [];
elements_index = 0;
background_retry_count = 1;
focus_climb_clock = "show";
focus_climb_push_pin = false;
focusClimbPexelsToken = "";

$(document).ready(function() {
  initiateSettings();
  updateBackground();
  clockUpdate();
  setInterval(clockUpdate, 1000);
  changeButtonsStatus();
  getTopSites();

// TODO: lets make a hackable plugin
var test = `
  <link rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Kenia">
<style>
body {
font-family: "Kenia", serif;
}
#digital-clock {
  font-family: "Kenia", serif;
}
input {
  font-family: "Kenia", serif;
}
.site-icon {background: none;}
.site-link {
  background: none;
  width: 40px;
  height:40px;
}
.site-link:hover {
  background: rgba(127, 127, 127, 0.5);
  transform: translateY(-5px);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}
`
//$("head").append(test);
});

function initiateSettings(){
  var focusClimbSearchTerm = localStorage.getItem("focusClimbSearchTerm");
  if(focusClimbSearchTerm){
      $("#focusClimbSearchTerm").val(focusClimbSearchTerm); 
  }

  focusClimbPexelsToken = localStorage.getItem("focusClimbPexelsToken");
  if(focusClimbPexelsToken){
      $("#focusClimbPexelsToken").val(focusClimbPexelsToken); 
  } else {
    focusClimbPexelsToken = '563492ad6f917000010000010b883213d49b45daaa804a8854ad452c';
  }

  var focus_climb_clock = localStorage.getItem("focusClimbClock");
  if(focus_climb_clock && focus_climb_clock == "hide"){
    $("#digital-clock").hide();
  } else {
    $("#digital-clock").show();
  }

  var focusClimbPushPin = localStorage.getItem("focusClimbPushPin");
  if(focusClimbPushPin){
    focus_climb_push_pin = true;
    elements.push(JSON.parse(focusClimbPushPin));
    elements_index = elements.length - 1;
  }

  var focusClimbNotePad = localStorage.getItem("focusClimbNotePad");
  if(focusClimbNotePad){
      $("#popup_note_textarea").val(focusClimbNotePad); 
  }

  var topsites_setting = localStorage.getItem("topsites_setting");
  if(topsites_setting){
    topsites(topsites_setting);
  }
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

