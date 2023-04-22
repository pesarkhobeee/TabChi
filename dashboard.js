function showMessage(content){
  $("#message").html(content);
  $("#message").fadeIn("slow");
  $("#message").delay(4000).fadeOut("slow");
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

function changeBackgroundColor(color_code) {
  if(color_code) {
    localStorage.setItem("colorsPalette", color_code);
  } else {
    color_code = localStorage.getItem("colorsPalette");
    $("#colorsPalette").val(color_code);
  }
  $("#fc-wallpaper-photo-hd").css({"background-color": color_code, "background-image": ""});
}

function changeBackground(elements_index) {
  var bg = elements[elements_index]['photos'][0]['src']['original'];
  
  $("#fc-wallpaper-photo").css("background-image", 'url(' +  bg  + '?auto=compress&cs=tinysrgb&&fit=crop&h=54&w=96)');
  $("#fc-wallpaper-photo-hd").hide();
  $("#fc-wallpaper-photo-hd").css("background-image", 'url(' +  bg   + '?fit=crop&h=1080&w=1920)');
  $("#fc-wallpaper-photo-hd").show(2000);

  var photographer = elements[elements_index]['photos'][0]['photographer'];
  var photographer_url = elements[elements_index]['photos'][0]['url'];
  $("#photographer_link").attr("href", photographer_url);
  $("#photographer_link").attr("alt", photographer);

  changeButtonsStatus();
}

function fetchNewBackground(searchTerm, searchLimit=0){
  if(focus_climb_push_pin) {
    changeBackground(elements_index);
    return false;
  }
  $("#focusClimbPushPin").fadeIn();
  $("#pin").prop("disabled",false);

  if(!searchLimit) {
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
    success: function( result ) {
      try {
        var total_results = result['total_results'];
        topics[searchTerm] = total_results;
        if (result['photos'][0]['src']['original']) {
          elements.push(result);
          elements_index = elements.length - 1;
          changeBackground(elements_index);
        }
      } catch (error) {
        if(background_retry_count < 3) {
            background_retry_count += 1;
            if(total_results) {
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
  }).fail(function (jqXHR, textStatus, errorThrown) {
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
  $("#pin").prop("disabled",true);
}

function updateBackground() {
  var background = $("#focusClimbSearchTerm").val();
  fetchNewBackground(background);
}

// create a modal function
function toggleModalPopup(height, width, title, contentDive){
  $("#my-modal").css({"height":height, "width":width}).toggle();
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
