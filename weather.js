// Save weather settings to storage
function saveWeatherOptions() {
  const weatherEnabled = document.getElementById('weather-toggle').checked;
  const cityName = document.getElementById('city').value;
  const unit = document.getElementById('unit').value;

  chrome.storage.local.set({ weatherEnabled, cityName, unit });

  // Show or hide weather options based on the weatherEnabled value
  const weatherOptions = document.querySelector('.weather-options');
  weatherOptions.style.display = weatherEnabled ? 'flex' : 'none';
  
  const weatherContainer = document.getElementById('weather');
  if (weatherEnabled && cityName) {
    weatherForecast(cityName, unit);
    weatherContainer.style.display = 'block';
  } else {
    weatherContainer.style.display = 'none';
  }
}

// Load values from storage
function loadWeatherOptions() {
  chrome.storage.local.get(['weatherEnabled', 'cityName', 'unit']).then((result) => {
    const weatherEnabled = result.weatherEnabled || false;
    const cityName = result.cityName || '';
    const unit = result.unit || 'C';

    document.getElementById('weather-toggle').checked = weatherEnabled;
    document.getElementById('city').value = cityName;
    document.getElementById('unit').value = unit;

    // Show or hide weather options based on the weatherEnabled value
    const weatherOptions = document.querySelector('.weather-options');
    weatherOptions.style.display = weatherEnabled ? 'flex' : 'none';

    // Attach event listeners
    document.getElementById('weather-toggle').addEventListener('change', saveWeatherOptions);
    document.getElementById('city').addEventListener('change', saveWeatherOptions);
    document.getElementById('unit').addEventListener('change', saveWeatherOptions);

    const weatherContainer = document.getElementById('weather');
    if (weatherEnabled && cityName) {
      weatherContainer.style.display = 'block';
      weatherForecast(cityName, unit);
    } else {
      weatherContainer.style.display = 'none';
    }
  });
}

// Fetch weather data
async function weatherForecast(city, unit) {
  const apikey = "df2f25b6da165d261b6d85f82def636e"; // Replace with your openweathermap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apikey}`;
  const weatherContainer = document.getElementById('weather');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    const name = data.name;
    const weather = data.weather[0].description;
    const icon = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    let temp = data.main.temp;

    // Convert temperature if needed
    if (unit === "F") {
      temp = (temp * 1.8) + 32;
      temp = `${temp.toFixed(1)} °F`;
    } else {
      temp = `${temp.toFixed(1)} °C`;
    }

    weatherContainer.innerHTML = `<p><img src='${icon}' alt='Weather Icon'> ${temp}, ${weather} in ${name}</p>`;
  } catch (error) {
    showMessage(`Error fetching weather data for ${city}: ${error.message}`);
    weatherContainer.innerHTML = `<p>Weather data unavailable</p>`;
  }
}

// Show message
function showMessage(message) {
  const messageElement = document.getElementById('message');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  }
}

// Initialize weather module when DOM is loaded
document.addEventListener('DOMContentLoaded', loadWeatherOptions);
