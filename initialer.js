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
  initiateSettings();
  clockUpdate();
  setInterval(clockUpdate, 1000);
  changeButtonsStatus();
  getTopSites();

  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    generateBookmarks(bookmarkTreeNodes[0].children, $('#bookmarksList'));
  });

  loadWeatherOptions();

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

function createListItem(parent, node) {
  const li = $('<li>');
  
  if (node.children) {
    const folderIcon = '📁 ';
    li.text(folderIcon + node.title);

    const nestedList = $('<ul>', { class: 'nested' });
    for (const child of node.children) {
      createListItem(nestedList, child);
    }
    li.append(nestedList);
    li.on('click', function (event) {
      event.stopPropagation();
      $('.nested').not(nestedList.parentsUntil('#bookmarksList')).not(nestedList).hide();
      nestedList.toggle();
    });
  } else if (node.url) {
    const linkIcon = '🔗 ';
    li.text(linkIcon + node.title);

    li.on('click', function () {
      window.open(node.url, '_self');
    });
  }

  parent.append(li);
}


function generateBookmarks(bookmarkNodes, parent) {
  for (const node of bookmarkNodes) {
    createListItem(parent, node);
  }
}

// Save values to localStorage
function saveWeatherOptions() {
  const weatherEnabled = $('#weather-toggle').is(':checked');
  const cityName = $('#city').val();
  const unit = $('#unit').val();

  localStorage.setItem('weatherEnabled', weatherEnabled);
  localStorage.setItem('cityName', cityName);
  localStorage.setItem('unit', unit);

    // Show or hide weather options based on the weatherEnabled value
    if (weatherEnabled) {
      $('.weather-options').css('display', 'flex');
  } else {
      $('.weather-options').css('display', 'none');
  }
  if(weatherEnabled && cityName) {
    weatherForecast(cityName, unit);
    $('#weather').fadeIn('slow');
  } else {
    $('#weather').fadeOut('slow');
  }
}

// Load values from localStorage
function loadWeatherOptions(){
  const weatherEnabled = localStorage.getItem('weatherEnabled') === 'true';
  const cityName = localStorage.getItem('cityName') || '';
  const unit = localStorage.getItem('unit') || 'C';

  $('#weather-toggle').prop('checked', weatherEnabled);
  $('#city').val(cityName);
  $('#unit').val(unit);

  // Show or hide weather options based on the weatherEnabled value
  if (weatherEnabled) {
      $('.weather-options').css('display', 'flex');
  } else {
      $('.weather-options').css('display', 'none');
  }

  // Attach event listeners to the controls
  $('#weather-toggle').on('change', saveWeatherOptions);
  $('#city').on('change', saveWeatherOptions);
  $('#unit').on('change', saveWeatherOptions);
  
  if(weatherEnabled && cityName) {
    $('#weather').fadeIn('slow');
    weatherForecast(cityName, unit);
  }
}

function weatherForecast(city, unit){

  var apikey = "df2f25b6da165d261b6d85f82def636e"; // Replace with your openweathermap API key
  var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + apikey;

  $.getJSON(url, function(data) {
    var name = data.name;
    var weather = data.weather[0].description;
    var icon = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    var temp = data.main.temp;

      // Convert temperature to Fahrenheit if requested
    if (unit == "F") {
      temp = (temp * 1.8) + 32;
      temp = temp.toFixed(1) + " &deg;F";
    } else {
      temp = temp.toFixed(1) + " &deg;C";
    }

    $("#weather").html("<p><img src='" + icon + "' alt='Weather Icon'> " + temp + ", " + weather + " in " + name + "</p>");
  }).fail(function() {
    showMessage("Error fetching weather data for " + city);
  });
}




