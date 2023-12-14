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

// create a modal function
function toggleModalPopup(height, width, title, contentDive) {
  $("#my-modal").css({ height: height, width: width }).toggle();
  $("#modal-title").html(title);

  // Get the div to move
  var $divToMove = $("#" + contentDive);

  // Detach the div to move from its original location
  $divToMove.detach();

  $("#modal-content").html($divToMove.html());
  // Close the modal
  $("#modal-close").click(function () {
    $("#my-modal").css("display", "none");
  });
}

$("#AI-container-settings").click(function () {
  open_ai_settings_modal(true);
});

function getTopSites() {
  chrome.topSites.get(function (sites) {
    var container = document.querySelector(".top-sites");
    for (var i = 0; i < sites.length; i++) {
      var site = sites[i];
      var link = document.createElement("a");
      link.classList.add("site-link");
      link.href = site.url;
      var icon = document.createElement("img");
      icon.classList.add("site-icon");
      icon.src = getFaveiconURL(site.url);
      var title = document.createElement("span");
      title.classList.add("site-title");
      title.textContent = site.title;
      link.appendChild(icon);
      //link.appendChild(title);
      var div = document.createElement("div");
      div.classList.add("site");
      div.appendChild(link);
      container.appendChild(div);
    }
  });
}
