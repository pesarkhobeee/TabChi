elements = []
elements_index = 0;
background_retry_count = 1;
focus_climb_clock = "show";

var focusClimbSearchTerm = localStorage.getItem("focusClimbSearchTerm");
if(focusClimbSearchTerm){
    $("#focusClimbSearchTerm").val(focusClimbSearchTerm); 
}

var focusClimbPexelsToken = localStorage.getItem("focusClimbPexelsToken");
if(focusClimbPexelsToken){
    $("#focusClimbPexelsToken").val(focusClimbPexelsToken); 
}

var focus_climb_clock = localStorage.getItem("focusClimbClock");
if(focus_climb_clock && focus_climb_clock == "hide"){
  $("#digital-clock").hide();
} else {
  $("#digital-clock").show();
}

$(document).ready(function() {
  updateBackground();
  clockUpdate();
  setInterval(clockUpdate, 1000);
})

function updateBackground() {
  var background = $("#focusClimbSearchTerm").val();
  changeBackground(background);
}

function showMessage(content, fade_out_speed = 3000){
  $("#message").html(content);
  $("#message").fadeIn("slow");
  $("#message").delay(fade_out_speed).fadeOut("slow");
}

function changeBackground(searchTerm, searchLimit=0){

  if(!searchLimit) {
    var number = 1 + Math.floor(Math.random() * 200);
  } else {
    var number = 1 + Math.floor(Math.random() * searchLimit);
  }

  $.getJSON({
    url: "https://api.pexels.com/v1/search",
    headers: {
      'Authorization': '563492ad6f917000010000010b883213d49b45daaa804a8854ad452c'
    },
    data: {
      query: searchTerm,
      orientation: "landscape",
      size: "large",
      per_page: 1,
      page: number
    },
    success: function( result ) {
      elements.push(result)
      try {
        var total_results = result['total_results'];
        var bg = result['photos'][0]['src']['large2x'];
        console.log(bg);
        elements_index = elements.length - 1;
        $("body").css("background-image", "url('" + bg + "')");
        var photographer = result['photos'][0]['photographer'];
        var photographer_url = result['photos'][0]['photographer_url'];
        var photographer_link = "<a id='photographer_link' href='" + photographer_url + "' target='_blank' >" + photographer + "</a>"
        console.log(photographer_link);
        showMessage(photographer_link, 5000);
      } catch (error) {
        if(background_retry_count < 3) {
            background_retry_count += 1;
            if(total_results) {
                changeBackground(searchTerm, total_results);
            } else {
                changeBackground(searchTerm);
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
  });
}

function menu() {
    $("#menu-bar").slideReveal("show");
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
  updateBackground();
})

$( "#focusClimbSearchTerm" ).focusout(function() {
  var background = $("#focusClimbSearchTerm").val();
  localStorage.setItem("focusClimbSearchTerm", background);
  updateBackground();
})

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

function next(){
  if(elements_index < (elements.length - 1)){
    elements_index += 1;
    var bg = elements[elements_index]['photos'][0]['src']['large2x'];
    $("body").css("background-image", "url('" + bg + "')");
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

function previous(){
  if(elements_index > 0){
    elements_index -= 1;
    var bg = elements[elements_index]['photos'][0]['src']['large2x'];
    $("body").css("background-image", "url('" + bg + "')");
  }
}

window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }

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
    default:
      return; // Quit when this doesn't handle the key event.
  }
}, true);

function clockUpdate() {
  var date = new Date();
  $('#digital-clock').css({'color': '#fff', 'text-shadow': '0 0 6px #ff0'});
  function addZero(x) {
    if (x < 10) {
      return x = '0' + x;
    } else {
      return x;
    }
  }

  function twelveHour(x) {
    if (x > 12) {
      return x = x - 12;
    } else if (x == 0) {
      return x = 12;
    } else {
      return x;
    }
  }

  var h = addZero(twelveHour(date.getHours()));
  var m = addZero(date.getMinutes());
  var s = addZero(date.getSeconds());

  $('#digital-clock').text(h + ':' + m)
}
