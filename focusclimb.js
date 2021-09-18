elements = []
elements_index = 0;

var focusClimbSearchTerm = localStorage.getItem("focusClimbSearchTerm");
if(focusClimbSearchTerm){
    $("#background").val(focusClimbSearchTerm); 
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
      elements_index = elements.length - 1;
      var bg = result['photos'][0]['src']['large2x'];
      console.log(bg);
       $("body").css("background-image", "url('" + bg + "')");
    }
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

var background = $("#background").val();
changebackground(background);

$( "#background" ).focusout(function() {
var background = $("#background").val();
  changebackground(background);
  localStorage.setItem("focusClimbSearchTerm", background);
})

$( "#changebackground" ).click(function() {
var background = $("#background").val();
  changebackground(background);
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
        var background = $("#background").val();
      changebackground(background);
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
