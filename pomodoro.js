var intervalHandler;
var currentPercent = 0;
var currentSecond = 0;
var percent = 100;
var pomodoroCount = 0;
var clicked = false;
var xPomodoro = 90;
var yPomodoro = 110;
var radiusPomodoro = 75;
var xMarker = 10;
var yMarker = 20;
var pomodoroWorkTimeInSeconds = 1500;
var pomodoroRestTimeInSeconds = 300;
var pomodoroWorkColor = "#ffffff";
var pomodoroRestColor = "#f3d8a1";

function resetDefaults(){
  clearInterval(intervalHandler);
  currentPercent = 0;
  currentSecond = 0;
  clicked = false;
}

function drawArc(x, y, radius, canvas, color) {
  pomodoroCanvas = document.getElementById(canvas).getContext("2d");
  if(canvas == "pomodoroTimer") {
    pomodoroCanvas.clearRect(0, 0, 180, 200);
  }
  pomodoroCanvas.beginPath();
  pomodoroCanvas.moveTo(x, y);
  pomodoroCanvas.fillStyle = color;
  pomodoroCanvas.shadowColor = "#ffff00";
  pomodoroCanvas.shadowBlur = 15;
  pomodoroCanvas.arc(x, y, radius, 270 * (Math.PI / 180), (360 * currentPercent / 100 - 90) * (Math.PI / 180));
  pomodoroCanvas.fill();
  pomodoroCanvas.font = "12px Arial";
  if(radius >= 75){
    // Means we are drawing the Pomodoro timer adn not the markers :)
    pomodoroCanvas.fillText(Math.round(currentPercent) + "% Pomodoro", 15, 20);
    document.title = Math.round(currentPercent) + "% Pomodoro";
  }
}

function drawPomodoro() {
  currentSecond += 1;
  if(pomodoroCount % 2 == 0){
    // Means we are dealing with the pomodoro work timer
    color = pomodoroWorkColor;
    currentPercent = (100/pomodoroWorkTimeInSeconds) * currentSecond;
  } else {
    // Means we are dealing with the pomodoro rest timer
    color = pomodoroRestColor;
    currentPercent = (100/pomodoroRestTimeInSeconds) * currentSecond;
  }

  if (currentPercent < percent && clicked) {
    // Draw the main timer
    drawArc(xPomodoro, yPomodoro, radiusPomodoro, "pomodoroTimer", color);
  } else if(clicked) 
  {
    resetDefaults();
    // draw the markers
    if(pomodoroCount % 8 == 0){
      xMarker +=35;
      yMarker =20;
    } else {
      yMarker += 35;
    }
    drawArc(xMarker, 20 + yMarker, 15, "pomodoroMarkers",color);
    pomodoroCount += 1;
    drawArc(xPomodoro, yPomodoro, 15, "pomodoroTimer", pomodoroWorkColor);
    document.title = "Pomodoro Finished!";
  }
}

// Define Pomodoro button and how to interact with user mouse!
const canvas = document.getElementById('pomodoroTimer');
canvas.onmouseenter = function(e) {
  drawArc(xPomodoro, yPomodoro, 15, "pomodoroTimer", pomodoroRestColor);
  document.body.style.cursor = "pointer";
}
canvas.onmouseleave = function(e) {
  drawArc(xPomodoro, yPomodoro, 15, "pomodoroTimer", pomodoroWorkColor);
  document.body.style.cursor = "default";
}
canvas.addEventListener('click', function(event) {
  if (typeof intervalHandler !== 'undefined' || intervalHandler !== null) {
    resetDefaults();
  } 
  clicked = true;
  intervalHandler = setInterval(() => {
    requestAnimationFrame(drawPomodoro);
  }, 1000);
 
}, false);


drawArc(xPomodoro, yPomodoro, 15, "pomodoroTimer", "#ffffff");

