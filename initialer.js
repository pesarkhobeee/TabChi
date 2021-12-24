topics = {};
elements = [];
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
} else {
  focusClimbPexelsToken = '563492ad6f917000010000010b883213d49b45daaa804a8854ad452c';
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
  fetchNewBackground(background);
}
