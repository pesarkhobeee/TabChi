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
    chrome.storage.sync.set({ colorsPalette: color_code });
    $("#fc-wallpaper-photo-hd").css({
      "background-color": color_code,
      "background-image": "",
    });
  } else {
    chrome.storage.sync.get(["colorsPalette"]).then((result) => {
      $("#colorsPalette").val(result.colorsPalette);
      color_code = result.colorsPalette;
      $("#fc-wallpaper-photo-hd").css({
        "background-color": color_code,
        "background-image": "",
      });
    });
  }
}

function changeBackground(image) {
  var bg = image["photos"][0]["src"]["original"];
  var photographer = image["photos"][0]["photographer"];
  var photographer_url = image["photos"][0]["url"];

  // Fetch the image as a Blob, convert to Base64, and save to localStorage
  fetch(bg + "?fit=crop&h=1080&w=1920")
    .then((response) => response.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (focus_climb_push_pin == false) {
          const base64Image = reader.result;
          chrome.storage.local.set({ backgroundImage: base64Image });
          chrome.storage.local.set({
            backgroundImagePhotographer: photographer,
          });
          chrome.storage.local.set({
            backgroundImagePhotographerlink: photographer_url,
          });
        }
      };
      reader.readAsDataURL(blob);
    });

  changePinRelatedButtonsStatus();
}

function loadBackgroundFromLocalStorage() {
  // TODO : this should not be called when focus_climb_push_pin is set
  if (focus_climb_push_pin) {
    return false;
  }

  chrome.storage.local
    .get([
      "backgroundImage",
      "backgroundImagePhotographer",
      "backgroundImagePhotographerlink",
    ])
    .then((result) => {
      if (result.backgroundImage) {
        $("#fc-wallpaper-photo-hd").css(
          "background-image",
          "url(" + result.backgroundImage + ")",
        );
        $("#photographer_link").attr(
          "href",
          result.backgroundImagePhotographerlink,
        );
        $("#photographer_link").attr("alt", result.backgroundImagePhotographer);
      }
    });
}

function fetchNewBackground(searchTerm, searchLimit = 0) {
  if (focus_climb_push_pin) {
    // TODO: add pushed pin reader here
    $("#fc-wallpaper-photo-hd").css(
      "background-image",
      "url(" + focus_climb_push_pin.backgroundImage + ")",
    );
    $("#photographer_link").attr(
      "href",
      focus_climb_push_pin.backgroundImagePhotographerlink,
    );
    $("#photographer_link").attr(
      "alt",
      focus_climb_push_pin.backgroundImagePhotographer,
    );
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
      Authorization: focusClimbPexelsToken,
    },
    data: {
      query: searchTerm,
      orientation: "landscape",
      size: "large",
      per_page: 1,
      page: number,
    },
    success: function (result) {
      try {
        var total_results = result["total_results"];
        topics[searchTerm] = total_results;
        if (result["photos"][0]["src"]["original"]) {
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
          showMessage(
            "Something is wrong, couldn't fetch any image, maybe your search term or ...!",
          );
        }
      }
    },
  }).fail(function (jqXHR, textStatus, errorThrown) {
    showMessage("Something is wrong, couldn't fetch any image!");
    offlineBackgroundPictures();
  });
}

function offlineBackgroundPictures() {
  //var local_background_image = 'images/' + ( 1 + Math.floor(Math.random() * 12) ) + '.jpg';
  var local_background_image = "background.jpg";
  $("#fc-wallpaper-photo-hd").css(
    "background-image",
    "url('" + local_background_image + "')",
  );
  $("#focusClimbPushPin").hide();
  $("#photographer").hide();
  $("#pin").prop("disabled", true);
}

function updateBackground() {
  var background = $("#focusClimbSearchTerm").val();
  fetchNewBackground(background);
}
