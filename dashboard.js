// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings toggle
    initSettings();
    
    // Load notes from storage
    loadNotes();
    
    // Load background settings
    loadBackgroundSettings();
    
    // Set up event listeners for notes
    document.getElementById('notes-textarea').addEventListener('input', saveNotes);
});

// Toggle settings panel
function initSettings() {
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsContainer = document.getElementById('settings-container');
    
    settingsToggle.addEventListener('click', function() {
        settingsContainer.classList.toggle('settings-open');
    });
    
    // Close settings panel when clicking outside
    document.addEventListener('click', function(event) {
        if (!settingsContainer.contains(event.target) && settingsContainer.classList.contains('settings-open')) {
            settingsContainer.classList.remove('settings-open');
        }
    });
    
    // Set up background settings
    const backgroundSetting = document.getElementById('background-setting');
    const colorPickerContainer = document.getElementById('color-picker-container');
    const imageUploadContainer = document.getElementById('image-upload-container');
    
    backgroundSetting.addEventListener('change', function() {
        if (this.value === 'color') {
            colorPickerContainer.style.display = 'block';
            imageUploadContainer.style.display = 'none';
        } else {
            colorPickerContainer.style.display = 'none';
            imageUploadContainer.style.display = 'block';
        }
        saveBackgroundSettings();
    });
    
    // Save background color when changed
    document.getElementById('background-color').addEventListener('change', saveBackgroundSettings);
    
    // Handle image upload
    document.getElementById('background-image').addEventListener('change', handleImageUpload);
}

// Load notes from storage
function loadNotes() {
    chrome.storage.local.get(['notesContent'], function(result) {
        const notesTextarea = document.getElementById('notes-textarea');
        if (result.notesContent) {
            notesTextarea.value = result.notesContent;
        }
    });
}

// Save notes to storage
function saveNotes() {
    const notesContent = document.getElementById('notes-textarea').value;
    chrome.storage.local.set({ notesContent: notesContent });
}

// Load background settings
function loadBackgroundSettings() {
    chrome.storage.local.get(['backgroundType', 'backgroundColor', 'backgroundImage'], function(result) {
        const backgroundType = result.backgroundType || 'color';
        const backgroundColor = result.backgroundColor || '#5EA9BE';
        const backgroundImage = result.backgroundImage;
        
        // Set the select value
        const backgroundSetting = document.getElementById('background-setting');
        backgroundSetting.value = backgroundType;
        
        // Set the color value
        const backgroundColorPicker = document.getElementById('background-color');
        backgroundColorPicker.value = backgroundColor;
        
        // Show/hide the appropriate container
        const colorPickerContainer = document.getElementById('color-picker-container');
        const imageUploadContainer = document.getElementById('image-upload-container');
        
        if (backgroundType === 'color') {
            colorPickerContainer.style.display = 'block';
            imageUploadContainer.style.display = 'none';
            document.body.style.backgroundColor = backgroundColor;
        } else {
            colorPickerContainer.style.display = 'none';
            imageUploadContainer.style.display = 'block';
            
            if (backgroundImage) {
                applyBackgroundImage(backgroundImage);
            }
        }
    });
}

// Save background settings
function saveBackgroundSettings() {
    const backgroundType = document.getElementById('background-setting').value;
    const backgroundColor = document.getElementById('background-color').value;
    
    chrome.storage.local.set({
        backgroundType: backgroundType,
        backgroundColor: backgroundColor
    });
    
    // Apply the changes immediately
    if (backgroundType === 'color') {
        document.body.style.backgroundColor = backgroundColor;
        document.getElementById('wallpaper-image').style.backgroundImage = 'none';
    }
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const backgroundImage = e.target.result;
            chrome.storage.local.set({ backgroundImage: backgroundImage });
            applyBackgroundImage(backgroundImage);
        };
        
        reader.readAsDataURL(file);
    }
}

// Apply background image
function applyBackgroundImage(imageData) {
    document.getElementById('wallpaper-image').style.backgroundImage = `url(${imageData})`;
}

// Show message
function showMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    setTimeout(function() {
        messageElement.style.display = 'none';
    }, 3000);
}

function showMessage(content) {
  $("#message").html(content);
  $("#message").fadeIn("slow");
  $("#message").delay(4000).fadeOut("slow");
}

function backgroundController(background_setting) {
  if (background_setting) {
    $("#background-setting").val(background_setting);
    if (background_setting == "Color") {
      changeBackgroundColor();
      $("#fieldset-color").show();
      $("#fieldset-pexels").hide();
      $("#focusClimbPushPin").hide();
      $("#photographer").hide();
    } else if (background_setting == "Pexels") {
      showPexelsBackground();
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

function showPexelsBackground() {
  // Here we want to check if it is the firt time, we like to sho the offline picture
  // otherwise we will show what we have as a saved base64 one
  // and also we trigger the updating picture part
  loadBackgroundFromLocalStorage();
  updateBackground();
}

function changeBackgroundColor(color_code) {
  if (color_code) {
    chrome.storage.local.set({ colorsPalette: color_code });
  } else {
    chrome.storage.local.get(["colorsPalette"]).then((result) => {
      $("#colorsPalette").val(result.color_code);
    });
  }
  $("#fc-wallpaper-photo-hd").css({ "background-color": color_code, "background-image": "" });
}

function changeBackground(image) {
  var bg = image['photos'][0]['src']['original'];
  var photographer = image['photos'][0]['photographer'];
  var photographer_url = image['photos'][0]['url'];


  // Fetch the image as a Blob, convert to Base64, and save to localStorage
  fetch(bg + '?fit=crop&h=1080&w=1920')
    .then(response => response.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        if (focus_climb_push_pin == false) {
          const base64Image = reader.result;
          chrome.storage.local.set({ backgroundImage: base64Image });
          chrome.storage.local.set({ backgroundImagePhotographer: photographer });
          chrome.storage.local.set({ backgroundImagePhotographerlink: photographer_url });
        }
      };
      reader.readAsDataURL(blob);
    });

  changeButtonsStatus();
}

function loadBackgroundFromLocalStorage() {
  // TODO : this should not be called when focus_climb_push_pin is set
  if (focus_climb_push_pin) {
    return false;
  }

  chrome.storage.local.get(['backgroundImage', 'backgroundImagePhotographer', 'backgroundImagePhotographerlink']).then((result) => {
    if (result.backgroundImage) {
      $("#fc-wallpaper-photo-hd").css("background-image", 'url(' + result.backgroundImage + ')');
      $("#photographer_link").attr("href", result.backgroundImagePhotographerlink);
      $("#photographer_link").attr("alt", result.backgroundImagePhotographer);
    }
  });
}

function fetchNewBackground(searchTerm, searchLimit = 0) {
  if (focus_climb_push_pin) {
    // TODO: add pushed pin reader here
    $("#fc-wallpaper-photo-hd").css("background-image", 'url(' + focus_climb_push_pin.backgroundImage + ')');
    $("#photographer_link").attr("href", focus_climb_push_pin.backgroundImagePhotographerlink);
    $("#photographer_link").attr("alt", focus_climb_push_pin.backgroundImagePhotographer);
    console.log(focus_climb_push_pin.backgroundImagePhotographerlink);
    console.log(focus_climb_push_pin.backgroundImagePhotographer);
    console.log(focus_climb_push_pin.backgroundImage);
    return false;
  }
  $("#focusClimbPushPin").fadeIn();
  $("#pin").prop("disabled", false);

  if (!searchLimit) {
    searchLimit = topics[searchTerm] || 8000;
    var number = 1 + Math.floor(Math.random() * searchLimit);
  } else {
    var number = 1 + Math.floor(Math.random() * searchLimit);
  }

  $.getJSON({
    url: "https://api.pexels.com/v1/search",
    headers: {
      'Authorization': focusClimbPexelsToken
    },
    data: {
      query: searchTerm,
      orientation: "landscape",
      size: "large",
      per_page: 1,
      page: number
    },
    success: function(result) {
      try {
        var total_results = result['total_results'];
        topics[searchTerm] = total_results;
        if (result['photos'][0]['src']['original']) {
          changeBackground(result);
        }
      } catch (error) {
        if (background_retry_count < 3) {
          background_retry_count += 1;
          if (total_results) {
            fetchNewBackground(searchTerm, total_results);
          } else {
            fetchNewBackground(searchTerm);
          }
        } else {
          background_retry_count = 1;
          showMessage("Something is wrong, couldn't fetch any image, maybe your search term or ...!");
        }
      }
    },
  }).fail(function(jqXHR, textStatus, errorThrown) {
    showMessage("Something is wrong, couldn't fetch any image!");
    offlineBackgroundPictures();
  });

}

function offlineBackgroundPictures() {
  //var local_background_image = 'images/' + ( 1 + Math.floor(Math.random() * 12) ) + '.jpg';
  var local_background_image = 'background.jpg';
  $("#fc-wallpaper-photo-hd").css("background-image", "url('" + local_background_image + "')");
  $("#focusClimbPushPin").hide();
  $("#photographer").hide();
  $("#pin").prop("disabled", true);
}

function updateBackground() {
  var background = $("#focusClimbSearchTerm").val();
  fetchNewBackground(background);
}

// create a modal function
function toggleModalPopup(height, width, title, contentDive) {
  $("#my-modal").css({ "height": height, "width": width }).toggle();
  $("#modal-title").html(title);

  // Get the div to move
  var $divToMove = $("#" + contentDive);

  // Detach the div to move from its original location
  $divToMove.detach();

  $("#modal-content").html($divToMove.html());
  // Close the modal
  $("#modal-close").click(function() {
    $("#my-modal").css("display", "none");
  });
}

$("#AI-container-settings").click(function() {
  open_ai_settings_modal(true);
});

function faveiconURL(u, s = 32) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", s);
  return url.toString();
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
      icon.src = faveiconURL(site.url);
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
