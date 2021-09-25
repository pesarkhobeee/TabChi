elements = []
elements_index = 0;
background_retry_count = 1;

var focusClimbSearchTerm = localStorage.getItem("focusClimbSearchTerm");
console.log(focusClimbSearchTerm);
if(focusClimbSearchTerm){
    $("#background").val(focusClimbSearchTerm); 
}

var focusClimbPexelsToken = localStorage.getItem("focusClimbPexelsToken");
if(focusClimbPexelsToken){
    $("#focusClimbPexelsToken").val(focusClimbPexelsToken); 
}

function message(content){
  $("#message").text(content);
  $("#message").fadeIn("slow");
  $("#message").delay(3000).fadeOut("slow");
}

function changebackground(searchTerm){

  var number = 1 + Math.floor(Math.random() * 200);
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
      console.log(result);
      elements.push(result)
      try {
        var bg = result['photos'][0]['src']['large2x'];
        elements_index = elements.length - 1;
        $("body").css("background-image", "url('" + bg + "')");
      } catch (error) {
        if(background_retry_count < 3) {
            background_retry_count += 1;
            changebackground(searchTerm);
        } else {
            background_retry_count = 1;
            message("Couldn't find anything related to your search term!");
        }
      }
    },
  }).fail(function (jqXHR, textStatus, errorThrown) {
    $("body").css("background-image", "url('mountain.jpg')");
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

function updateBackground() {
  var background = $("#background").val();
  changebackground(background);
}

$( "#focusClimbPexelsToken" ).focusout(function() {
  var pexels = $("#focusClimbPexelsToken").val();
  localStorage.setItem("focusClimbPexelsToken", pexels);
  updateBackground();
})

$( "#background" ).focusout(function() {
  var background = $("#background").val();
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

function next(){
  if(elements_index < (elements.length - 1)){
    elements_index += 1;
    var bg = elements[elements_index]['photos'][0]['src']['large2x'];
    console.log(bg);
    $("body").css("background-image", "url('" + bg + "')");
  }
}

function previous(){
  if(elements_index > 0){
    elements_index -= 1;
    var bg = elements[elements_index]['photos'][0]['src']['large2x'];
    console.log(bg);
    $("body").css("background-image", "url('" + bg + "')");
  }
}

window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }

  switch (event.key) {
    case "B":
      updateBackground();
      break;
    case "N":
      next();
      break;
    case "P":
      previous();
      break;
    case "M":
      $('.handle').trigger('click');
      break;
    default:
      return; // Quit when this doesn't handle the key event.
  }
}, true);

$(document).ready(function() {
  updateBackground();
  clockUpdate();
  setInterval(clockUpdate, 1000);
})

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
