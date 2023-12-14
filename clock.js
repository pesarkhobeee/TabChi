/*
This file is dedicated to all the functions that are related to clock.
*/

function clockUpdate() {
  var date = new Date();
  function addZero(x) {
    if (x < 10) {
      return (x = "0" + x);
    } else {
      return x;
    }
  }

  function twelveHour(x) {
    if (x > 12) {
      return (x = x - 12);
    } else if (x == 0) {
      return (x = 12);
    } else {
      return x;
    }
  }

  //TODO: make twelveHour optional
  //var h = addZero(twelveHour(date.getHours()));
  var h = addZero(date.getHours());
  var m = addZero(date.getMinutes());
  var s = addZero(date.getSeconds());

  $("#digital-clock").text(h + ":" + m);
}
