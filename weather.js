// Save values to localStorage
function saveWeatherOptions() {
  const weatherEnabled = $("#weather-toggle").is(":checked");
  const cityName = $("#city").val();
  const unit = $("#unit").val();

  chrome.storage.sync.set({ weatherEnabled: weatherEnabled });
  chrome.storage.sync.set({ cityName: cityName });
  chrome.storage.sync.set({ unit: unit });

  // Show or hide weather options based on the weatherEnabled value
  if (weatherEnabled) {
    $(".weather-options").css("display", "flex");
  } else {
    $(".weather-options").css("display", "none");
  }
  if (weatherEnabled && cityName) {
    weatherForecast(cityName, unit);
    $("#weather").fadeIn("slow");
  } else {
    $("#weather").fadeOut("slow");
  }
}

// Load values from localStorage
function loadWeatherOptions() {
  chrome.storage.sync
    .get(["weatherEnabled", "cityName", "unit"])
    .then((result) => {
      const weatherEnabled = result.weatherEnabled;
      const cityName = result.cityName || "";
      const unit = result.unit || "C";

      $("#weather-toggle").prop("checked", weatherEnabled);
      $("#city").val(cityName);
      $("#unit").val(unit);

      // Show or hide weather options based on the weatherEnabled value
      if (weatherEnabled) {
        $(".weather-options").css("display", "flex");
      } else {
        $(".weather-options").css("display", "none");
      }

      // Attach event listeners to the controls
      $("#weather-toggle").on("change", saveWeatherOptions);
      $("#city").on("change", saveWeatherOptions);
      $("#unit").on("change", saveWeatherOptions);

      if (weatherEnabled && cityName) {
        $("#weather").fadeIn("slow");
        weatherForecast(cityName, unit);
      }
    });
}

function weatherForecast(city, unit) {
  var apikey = "df2f25b6da165d261b6d85f82def636e"; // Replace with your openweathermap API key
  var url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=metric&appid=" +
    apikey;

  $.getJSON(url, function (data) {
    var name = data.name;
    var weather = data.weather[0].description;
    var icon =
      "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    var temp = data.main.temp;

    // Convert temperature to Fahrenheit if requested
    if (unit == "F") {
      temp = temp * 1.8 + 32;
      temp = temp.toFixed(1) + " &deg;F";
    } else {
      temp = temp.toFixed(1) + " &deg;C";
    }

    $("#weather").html(
      "<p><img src='" +
        icon +
        "' alt='Weather Icon'> " +
        temp +
        ", " +
        weather +
        " in " +
        name +
        "</p>",
    );
  }).fail(function () {
    showMessage("Error fetching weather data for " + city);
  });
}
