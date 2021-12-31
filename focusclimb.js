function showMessage(content){
  $("#message").html(content);
  $("#message").fadeIn("slow");
}

function changeBackground(elements_index) {
  var bg = elements[elements_index]['photos'][0]['src']['original'];
  console.log(bg);
  
  $("#fc-wallpaper-photo").css("background-image", 'url(' +  bg  + '?auto=compress&cs=tinysrgb&&fit=crop&h=54&w=96)');
  $("#fc-wallpaper-photo-hd").hide();
  $("#fc-wallpaper-photo-hd").css("background-image", 'url(' +  bg   + '?fit=crop&h=1080&w=1920)');
  $("#fc-wallpaper-photo-hd").show(2000);

  var photographer = elements[elements_index]['photos'][0]['photographer'];
  var photographer_url = elements[elements_index]['photos'][0]['url'];
  var photographer_link = "<a id='photographer_link' href='" + photographer_url + "' target='_blank' alt='" + photographer + "'> &#128247;</a>"
  console.log(photographer_link);
  showMessage(photographer_link);

  changeButtonsStatus();
}

function fetchNewBackground(searchTerm, searchLimit=0){
  if(!searchLimit) {
    searchLimit = topics[searchTerm] || 8000;
    console.log(searchLimit);
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
        elements.push(result);
        elements_index = elements.length - 1;
        var total_results = result['total_results'];
        //TODO: save topics to the localStorage and fetch them in the initializing 
        topics[searchTerm] = total_results;
        changeBackground(elements_index);
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
            showMessage("Couldn't find anything related to your search term!");
        }
      }
    },
  }).fail(function (jqXHR, textStatus, errorThrown) {
    var local_background_image = 'images/' + ( 1 + Math.floor(Math.random() * 12) ) + '.jpg';
    $("body").css("background-image", "url('" + local_background_image + "')");
    showMessage("Something is wrong, couldn't fetch any image!");
  });
}
