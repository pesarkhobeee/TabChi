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
var pomodoroRestSkipColor = "#cb911a";
var skipRest = false;

function resetDefaults(){
  clearInterval(intervalHandler);
  currentPercent = 0;
  currentSecond = 0;
  clicked = false;
  skipRest = false;
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
    pomodoroCanvas.fillText(Math.floor(currentSecond / 60) + " Minutes Pomodoro", 15, 20);
    document.title = Math.floor(currentSecond / 60) + " Minutes Pomodoro";
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
    if(skipRest) {
      currentPercent = percent;
      color = pomodoroRestSkipColor;
    } else {
      currentPercent = (100/pomodoroRestTimeInSeconds) * currentSecond;
    }
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
  if(clicked == false) {
    drawArc(xPomodoro, yPomodoro, 15, "pomodoroTimer", pomodoroRestColor);
    document.body.style.cursor = "pointer";
  }
}
canvas.onmouseleave = function(e) {
  if(clicked == false) {
    drawArc(xPomodoro, yPomodoro, 15, "pomodoroTimer", pomodoroWorkColor);
    document.body.style.cursor = "default";
  }
}
canvas.addEventListener('click', function(e) {
    if (typeof intervalHandler !== 'undefined' || intervalHandler !== null) {
      resetDefaults();
    } 
    clicked = true;
    intervalHandler = setInterval(() => {
      requestAnimationFrame(drawPomodoro);
    }, 1000);
}, false);
canvas.addEventListener('contextmenu', e => {
  skipRest = true;
  drawPomodoro();
  e.preventDefault();
});


drawArc(xPomodoro, yPomodoro, 15, "pomodoroTimer", pomodoroWorkColor);

