// Weather functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load weather settings
    loadWeatherSettings();
    
    // Set up weather toggle
    document.getElementById('weather-toggle').addEventListener('change', toggleWeather);
    
    // Set up weather forecast toggle
    document.getElementById('weather-forecast-toggle').addEventListener('change', saveWeatherSettings);
    
    // City name and unit change handlers
    document.getElementById('city').addEventListener('change', saveWeatherSettings);
    document.getElementById('unit').addEventListener('change', saveWeatherSettings);
    document.getElementById('openweather-api-key').addEventListener('change', saveWeatherSettings);
    
    // Set up weather expand button
    document.getElementById('weather-expand').addEventListener('click', toggleWeatherExpand);
    
    // Set up forecast tabs
    document.getElementById('tab-hourly').addEventListener('click', function() {
        switchForecastTab('hourly');
    });
    
    document.getElementById('tab-daily').addEventListener('click', function() {
        switchForecastTab('daily');
    });
});

// Load weather settings from storage
function loadWeatherSettings() {
    chrome.storage.local.get([
        'weatherEnabled', 
        'cityName', 
        'unit',
        'showWeatherForecast',
        'openWeatherApiKey',
        'weatherExpanded',
        'weatherForecastTab'
    ], function(result) {
        // Set toggle state
        document.getElementById('weather-toggle').checked = result.weatherEnabled || false;
        
        // Set city name
        document.getElementById('city').value = result.cityName || 'New York';
        
        // Set unit
        document.getElementById('unit').value = result.unit || 'metric';
        
        // Set forecast toggle
        document.getElementById('weather-forecast-toggle').checked = result.showWeatherForecast || false;
        
        // Set OpenWeather API key
        document.getElementById('openweather-api-key').value = result.openWeatherApiKey || '';
        
        // Show/hide weather options
        document.querySelector('.weather-options').style.display = 
            result.weatherEnabled ? 'block' : 'none';
        
        // Load weather if enabled
        if (result.weatherEnabled) {
            loadWeather(result.cityName, result.unit, result.showWeatherForecast, result.openWeatherApiKey);
            
            // Restore expanded state if previously expanded
            if (result.weatherExpanded) {
                document.getElementById('weather').classList.add('expanded');
                
                // Load forecast data for the expanded view
                const city = result.cityName || 'New York';
                const unit = result.unit || 'metric';
                const apiKey = result.openWeatherApiKey || '';
                
                loadHourlyForecast(city, unit, apiKey);
                loadDailyForecast(city, unit, apiKey);
                
                // Also restore the selected tab
                if (result.weatherForecastTab) {
                    switchForecastTab(result.weatherForecastTab);
                }
            }
        }
    });
}

// Toggle weather display
function toggleWeather() {
    const isEnabled = document.getElementById('weather-toggle').checked;
    document.querySelector('.weather-options').style.display = isEnabled ? 'block' : 'none';
    
    if (isEnabled) {
        const city = document.getElementById('city').value;
        const unit = document.getElementById('unit').value;
        const showForecast = document.getElementById('weather-forecast-toggle').checked;
        const apiKey = document.getElementById('openweather-api-key').value;
        
        if (city) {
            loadWeather(city, unit, showForecast, apiKey);
        }
    } else {
        document.getElementById('weather').style.display = 'none';
    }
    
    saveWeatherSettings();
}

// Save weather settings to storage
function saveWeatherSettings() {
    const isEnabled = document.getElementById('weather-toggle').checked;
    const city = document.getElementById('city').value;
  const unit = document.getElementById('unit').value;
    const showForecast = document.getElementById('weather-forecast-toggle').checked;
    const apiKey = document.getElementById('openweather-api-key').value;
    
    chrome.storage.local.set({
        weatherEnabled: isEnabled,
        cityName: city,
        unit: unit,
        showWeatherForecast: showForecast,
        openWeatherApiKey: apiKey
    });
    
    if (isEnabled && city) {
        loadWeather(city, unit, showForecast, apiKey);
    }
}

// Toggle weather expand view
function toggleWeatherExpand() {
    const weatherElement = document.getElementById('weather');
    weatherElement.classList.toggle('expanded');
    
    // Save expanded state to storage
    const isExpanded = weatherElement.classList.contains('expanded');
    chrome.storage.local.set({ weatherExpanded: isExpanded });
    
    // Only fetch forecast data if expanded and not already loaded
    if (isExpanded) {
        const city = document.getElementById('city').value;
        const unit = document.getElementById('unit').value;
        const apiKey = document.getElementById('openweather-api-key').value;
        
        if (document.getElementById('hourly-forecast').children.length === 0) {
            loadHourlyForecast(city, unit, apiKey);
        }
        
        if (document.getElementById('daily-forecast').children.length === 0) {
            loadDailyForecast(city, unit, apiKey);
        }
    }
}

// Switch between hourly and daily forecast tabs
function switchForecastTab(tabName) {
    // Update tab active state
    document.getElementById('tab-hourly').classList.toggle('active', tabName === 'hourly');
    document.getElementById('tab-daily').classList.toggle('active', tabName === 'daily');
    
    // Show the selected forecast container
    document.getElementById('hourly-forecast').classList.toggle('hidden', tabName !== 'hourly');
    document.getElementById('daily-forecast').classList.toggle('hidden', tabName !== 'daily');
    
    // Save selected tab to storage
    chrome.storage.local.set({ weatherForecastTab: tabName });
}

// Load weather data
function loadWeather(city, unit, showForecast, apiKey) {
    if (!apiKey) {
        apiKey = '4d8fb5b93d4af21d66a2948710284366'; // Default API key
    }
    
    const unitSymbol = unit === 'metric' ? 'C' : 'F';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Update weather display
            const temperature = Math.round(data.main.temp);
            const description = data.weather[0].description;
            const iconCode = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            
            document.getElementById('weather-temp').textContent = `${temperature}°${unitSymbol}`;
            document.getElementById('weather-desc').textContent = description;
            document.getElementById('weather-icon').src = iconUrl;
            document.getElementById('weather-location').textContent = data.name;
            
            // Show weather widget
            document.getElementById('weather').style.display = 'block';
            
            // Initialize forecast display if enabled
            if (showForecast) {
                // Pre-load forecast data
                loadHourlyForecast(city, unit, apiKey);
                loadDailyForecast(city, unit, apiKey);
            }
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            document.getElementById('weather').style.display = 'none';
        });
}

// Load hourly forecast data
function loadHourlyForecast(city, unit, apiKey) {
    if (!apiKey) {
        apiKey = '4d8fb5b93d4af21d66a2948710284366'; // Default API key
    }
    
    const unitSymbol = unit === 'metric' ? 'C' : 'F';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const hourlyContainer = document.getElementById('hourly-forecast');
            hourlyContainer.innerHTML = ''; // Clear previous content
            
            // Get forecast items (limited to first 24 hours - 8 items, 3-hour intervals)
            const forecastItems = data.list.slice(0, 8);
            
            forecastItems.forEach(item => {
                const dateTime = new Date(item.dt * 1000);
                const hour = dateTime.getHours();
                const formattedHour = hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour-12}pm` : `${hour}am`;
                const temp = Math.round(item.main.temp);
                const iconCode = item.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
                
                const hourlyItem = document.createElement('div');
                hourlyItem.className = 'hourly-item';
                hourlyItem.innerHTML = `
                    <div class="hourly-time">${formattedHour}</div>
                    <img class="hourly-icon" src="${iconUrl}" alt="${item.weather[0].description}">
                    <div class="hourly-temp">${temp}°${unitSymbol}</div>
                `;
                
                hourlyContainer.appendChild(hourlyItem);
            });
        })
        .catch(error => {
            console.error('Error fetching hourly forecast:', error);
            document.getElementById('hourly-forecast').innerHTML = '<div class="forecast-error">Unable to load hourly forecast</div>';
        });
}

// Load daily forecast data
function loadDailyForecast(city, unit, apiKey) {
    if (!apiKey) {
        apiKey = '4d8fb5b93d4af21d66a2948710284366'; // Default API key
    }
    
    const unitSymbol = unit === 'metric' ? 'C' : 'F';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`;
    
    fetch(url)
        .then(response => {
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
            return response.json();
        })
        .then(data => {
            const dailyContainer = document.getElementById('daily-forecast');
            dailyContainer.innerHTML = ''; // Clear previous content
            
            // Process daily forecast (we'll use noon forecast for each day)
            const dayMap = new Map();
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Group forecasts by day
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dayOfWeek = days[date.getDay()];
                const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                
                if (!dayMap.has(dayKey)) {
                    dayMap.set(dayKey, {
                        dayOfWeek: dayOfWeek,
                        temps: [],
                        icons: []
                    });
                }
                
                // Add temperatures and icons
                dayMap.get(dayKey).temps.push(item.main.temp);
                dayMap.get(dayKey).icons.push(item.weather[0].icon);
            });
            
            // Create daily forecast items (limit to 7 days)
            let counter = 0;
            for (const [key, day] of dayMap) {
                if (counter >= 7) break;
                
                // Calculate high and low temperatures
                const highTemp = Math.round(Math.max(...day.temps));
                const lowTemp = Math.round(Math.min(...day.temps));
                
                // Get the most frequent icon for the day
                const iconCounts = {};
                day.icons.forEach(icon => {
                    iconCounts[icon] = (iconCounts[icon] || 0) + 1;
                });
                
                let mostFrequentIcon = day.icons[0];
                let maxCount = 0;
                for (const icon in iconCounts) {
                    if (iconCounts[icon] > maxCount) {
                        maxCount = iconCounts[icon];
                        mostFrequentIcon = icon;
                    }
                }
                
                const iconUrl = `https://openweathermap.org/img/wn/${mostFrequentIcon}.png`;
                
                const dailyItem = document.createElement('div');
                dailyItem.className = 'daily-item';
                dailyItem.innerHTML = `
                    <div class="daily-day">${day.dayOfWeek}</div>
                    <img class="daily-icon" src="${iconUrl}" alt="Weather">
                    <div class="daily-temp">
                        <div class="daily-high">${highTemp}°${unitSymbol}</div>
                        <div class="daily-low">${lowTemp}°${unitSymbol}</div>
                    </div>
                `;
                
                dailyContainer.appendChild(dailyItem);
                counter++;
            }
        })
        .catch(error => {
            console.error('Error fetching daily forecast:', error);
            document.getElementById('daily-forecast').innerHTML = '<div class="forecast-error">Unable to load daily forecast</div>';
        });
}

class WeatherForecast {
  constructor() {
    this.container = null;
    this.apiKey = '';
    this.city = '';
    this.unit = 'metric';
    this.showWeatherForecast = false;
    this.initialized = false;
    this.settings = {
      city: '',
      apiKey: '',
      unit: 'metric',
      showWeatherForecast: false
    };
    this.currentTab = 'hourly';
  }

  async init() {
    if (this.initialized) return;
    
    await this.loadSettings();
    this.createUI();
    
    if (this.settings.showWeatherForecast && this.settings.apiKey && this.settings.city) {
      this.fetchWeatherData();
    }
    
    this.listenForStorageChanges();
    this.initialized = true;
  }

  async loadSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get(
        ['city', 'apiKey', 'unit', 'showWeatherForecast', 'openWeatherApiKey'], 
        (result) => {
          this.settings.city = result.city || '';
          this.settings.apiKey = result.openWeatherApiKey || '';
          this.settings.unit = result.unit || 'metric';
          this.settings.showWeatherForecast = result.showWeatherForecast || false;
          resolve();
        }
      );
    });
  }

  listenForStorageChanges() {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        let needsRefresh = false;
        
        if (changes.city) {
          this.settings.city = changes.city.newValue;
          needsRefresh = true;
        }
        
        if (changes.openWeatherApiKey) {
          this.settings.apiKey = changes.openWeatherApiKey.newValue;
          needsRefresh = true;
        }
        
        if (changes.unit) {
          this.settings.unit = changes.unit.newValue;
          needsRefresh = true;
        }
        
        if (changes.showWeatherForecast) {
          this.settings.showWeatherForecast = changes.showWeatherForecast.newValue;
          this.toggleVisibility(this.settings.showWeatherForecast);
        }
        
        if (needsRefresh && this.settings.showWeatherForecast && this.settings.apiKey && this.settings.city) {
          this.fetchWeatherData();
        }
      }
    });
  }

  createUI() {
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'weather-container';
      
      if (!this.settings.showWeatherForecast) {
        this.container.classList.add('hidden');
      }
      
      document.body.appendChild(this.container);
    }
    
    this.container.innerHTML = `
      <div class="weather-header">
        <h3 class="weather-title">Weather</h3>
        <div class="weather-controls">
          <button class="weather-control-btn settings-btn" title="Settings">⚙️</button>
          <button class="weather-control-btn expand-btn" title="Show forecast">↓</button>
          <button class="weather-control-btn refresh-btn" title="Refresh">🔄</button>
        </div>
      </div>
      <div class="weather-current">
        <img class="weather-icon" src="" alt="Weather icon">
        <div class="weather-details">
          <div class="weather-city"></div>
          <div class="weather-temp"></div>
          <div class="weather-description"></div>
          <div class="weather-info"></div>
        </div>
      </div>
      <div class="weather-forecast">
        <div class="forecast-tabs">
          <button class="forecast-tab hourly-tab active" data-tab="hourly">Hourly</button>
          <button class="forecast-tab daily-tab" data-tab="daily">Daily</button>
        </div>
        <div class="forecast-content hourly-forecast active">
          <div class="forecast-items"></div>
        </div>
        <div class="forecast-content daily-forecast">
          <div class="forecast-items"></div>
        </div>
      </div>
      <div class="settings-form">
        <div class="settings-row">
          <label for="weather-api-key">OpenWeather API Key</label>
          <input type="text" id="weather-api-key" placeholder="Enter your API key">
        </div>
        <div class="settings-row">
          <label for="weather-city">City</label>
          <input type="text" id="weather-city" placeholder="Enter city name">
        </div>
        <div class="settings-row">
          <label for="weather-unit">Unit</label>
          <select id="weather-unit">
            <option value="metric">Celsius</option>
            <option value="imperial">Fahrenheit</option>
          </select>
        </div>
        <div class="settings-row">
          <label>
            <input type="checkbox" id="show-weather">
            Show weather forecast
          </label>
        </div>
        <div class="settings-actions">
          <button class="cancel-settings">Cancel</button>
          <button class="save-settings">Save</button>
        </div>
      </div>
      <div class="weather-error"></div>
    `;
    
    // Add event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Settings button
    this.container.querySelector('.settings-btn').addEventListener('click', () => {
      this.toggleSettings();
    });
    
    // Expand button
    this.container.querySelector('.expand-btn').addEventListener('click', () => {
      this.toggleExpand();
    });
    
    // Refresh button
    this.container.querySelector('.refresh-btn').addEventListener('click', () => {
      this.fetchWeatherData();
    });
    
    // Forecast tabs
    this.container.querySelectorAll('.forecast-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
    
    // Settings form
    const settingsForm = this.container.querySelector('.settings-form');
    const apiKeyInput = settingsForm.querySelector('#weather-api-key');
    const cityInput = settingsForm.querySelector('#weather-city');
    const unitSelect = settingsForm.querySelector('#weather-unit');
    const showWeatherCheck = settingsForm.querySelector('#show-weather');
    
    // Set initial values
    apiKeyInput.value = this.settings.apiKey;
    cityInput.value = this.settings.city;
    unitSelect.value = this.settings.unit;
    showWeatherCheck.checked = this.settings.showWeatherForecast;
    
    // Save settings
    this.container.querySelector('.save-settings').addEventListener('click', () => {
      this.saveSettings({
        apiKey: apiKeyInput.value,
        city: cityInput.value,
        unit: unitSelect.value,
        showWeatherForecast: showWeatherCheck.checked
      });
      this.toggleSettings(false);
    });
    
    // Cancel settings
    this.container.querySelector('.cancel-settings').addEventListener('click', () => {
      // Reset form values
      apiKeyInput.value = this.settings.apiKey;
      cityInput.value = this.settings.city;
      unitSelect.value = this.settings.unit;
      showWeatherCheck.checked = this.settings.showWeatherForecast;
      
      this.toggleSettings(false);
    });
  }

  toggleSettings(show) {
    const settingsForm = this.container.querySelector('.settings-form');
    if (show === undefined) {
      settingsForm.classList.toggle('visible');
    } else {
      if (show) {
        settingsForm.classList.add('visible');
      } else {
        settingsForm.classList.remove('visible');
      }
    }
  }

  toggleExpand() {
    this.container.classList.toggle('expanded');
    const expandBtn = this.container.querySelector('.expand-btn');
    if (this.container.classList.contains('expanded')) {
      expandBtn.textContent = '↑';
      expandBtn.title = 'Hide forecast';
    } else {
      expandBtn.textContent = '↓';
      expandBtn.title = 'Show forecast';
    }
  }

  toggleVisibility(show) {
    if (show) {
      this.container.classList.remove('hidden');
    } else {
      this.container.classList.add('hidden');
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update tab buttons
    this.container.querySelectorAll('.forecast-tab').forEach(tabBtn => {
      if (tabBtn.dataset.tab === tab) {
        tabBtn.classList.add('active');
      } else {
        tabBtn.classList.remove('active');
      }
    });
    
    // Update content
    this.container.querySelectorAll('.forecast-content').forEach(content => {
      if (content.classList.contains(`${tab}-forecast`)) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }

  async saveSettings(settings) {
    await chrome.storage.local.set({
      openWeatherApiKey: settings.apiKey,
      city: settings.city,
      unit: settings.unit,
      showWeatherForecast: settings.showWeatherForecast
    });
  }

  showError(message) {
    const errorEl = this.container.querySelector('.weather-error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    // Clear current weather data
    this.clearWeatherData();
    
    // Hide after 5 seconds
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }

  clearWeatherData() {
    this.container.querySelector('.weather-icon').src = '';
    this.container.querySelector('.weather-city').textContent = '';
    this.container.querySelector('.weather-temp').textContent = '';
    this.container.querySelector('.weather-description').textContent = '';
    this.container.querySelector('.weather-info').textContent = '';
    this.container.querySelector('.hourly-forecast .forecast-items').innerHTML = '';
    this.container.querySelector('.daily-forecast .forecast-items').innerHTML = '';
  }

  async fetchWeatherData() {
    if (!this.settings.apiKey || !this.settings.city) {
      this.showError('API key and city are required');
      return;
    }
    
    try {
      // Get current weather
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.settings.city)}&appid=${this.settings.apiKey}&units=${this.settings.unit}`;
      const currentResponse = await fetch(currentUrl);
      
      if (!currentResponse.ok) {
        const errorData = await currentResponse.json();
        throw new Error(errorData.message || 'Failed to fetch current weather');
      }
      
      const currentData = await currentResponse.json();
      this.updateCurrentWeather(currentData);
      
      // Get forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(this.settings.city)}&appid=${this.settings.apiKey}&units=${this.settings.unit}`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json();
        throw new Error(errorData.message || 'Failed to fetch forecast');
      }
      
      const forecastData = await forecastResponse.json();
      this.updateForecast(forecastData);
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      this.showError(`Error: ${error.message}`);
    }
  }

  updateCurrentWeather(data) {
    const tempUnit = this.settings.unit === 'metric' ? '°C' : '°F';
    const speedUnit = this.settings.unit === 'metric' ? 'm/s' : 'mph';
    
    this.container.querySelector('.weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    this.container.querySelector('.weather-city').textContent = `${data.name}, ${data.sys.country}`;
    this.container.querySelector('.weather-temp').textContent = `${Math.round(data.main.temp)}${tempUnit}`;
    this.container.querySelector('.weather-description').textContent = data.weather[0].description;
    
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    
    this.container.querySelector('.weather-info').textContent = 
      `Feels like: ${feelsLike}${tempUnit} | Humidity: ${humidity}% | Wind: ${windSpeed} ${speedUnit}`;
  }

  updateForecast(data) {
    const hourlyContainer = this.container.querySelector('.hourly-forecast .forecast-items');
    const dailyContainer = this.container.querySelector('.daily-forecast .forecast-items');
    
    // Clear previous forecasts
    hourlyContainer.innerHTML = '';
    dailyContainer.innerHTML = '';
    
    const tempUnit = this.settings.unit === 'metric' ? '°C' : '°F';
    const forecasts = data.list;
    
    // Process hourly forecast (next 24 hours)
    const hourlyForecasts = forecasts.slice(0, 8); // 8 x 3 hours = 24 hours
    
    hourlyForecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const hour = date.getHours();
      const formattedHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      
      const temp = Math.round(forecast.main.temp);
      const icon = forecast.weather[0].icon;
      
      const forecastItem = document.createElement('div');
      forecastItem.className = 'forecast-item';
      forecastItem.innerHTML = `
        <div class="forecast-time">${formattedHour}</div>
        <img class="forecast-icon" src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather icon">
        <div class="forecast-temp">${temp}${tempUnit}</div>
      `;
      
      hourlyContainer.appendChild(forecastItem);
    });
    
    // Process daily forecast
    // Group forecasts by day
    const dailyMap = new Map();
    
    forecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayKey = `${day} ${dateStr}`;
      
      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, {
          dayKey,
          temps: [],
          icons: [],
          descriptions: []
        });
      }
      
      const dayData = dailyMap.get(dayKey);
      dayData.temps.push(forecast.main.temp);
      dayData.icons.push(forecast.weather[0].icon);
      dayData.descriptions.push(forecast.weather[0].description);
    });
    
    // Create a forecast item for each day
    dailyMap.forEach((dayData, dayKey) => {
      // Skip today as we already show current weather
      if (dayMap.size > 1 && Array.from(dailyMap.keys())[0] === dayKey) {
        return;
      }
      
      const minTemp = Math.round(Math.min(...dayData.temps));
      const maxTemp = Math.round(Math.max(...dayData.temps));
      
      // Most frequent icon for the day
      const iconFrequency = {};
      dayData.icons.forEach(icon => {
        iconFrequency[icon] = (iconFrequency[icon] || 0) + 1;
      });
      
      let mostFrequentIcon = dayData.icons[0];
      let maxFrequency = 0;
      
      Object.entries(iconFrequency).forEach(([icon, frequency]) => {
        if (frequency > maxFrequency) {
          mostFrequentIcon = icon;
          maxFrequency = frequency;
        }
      });
      
      const forecastItem = document.createElement('div');
      forecastItem.className = 'forecast-item';
      forecastItem.innerHTML = `
        <div class="forecast-day">${dayKey}</div>
        <img class="forecast-icon" src="http://openweathermap.org/img/wn/${mostFrequentIcon}.png" alt="Weather icon">
        <div class="forecast-temp">
          <span>${maxTemp}${tempUnit}</span>
          <span class="forecast-temp-min">${minTemp}${tempUnit}</span>
        </div>
      `;
      
      dailyContainer.appendChild(forecastItem);
    });
  }
}

// Export control functions for dashboard UI
export { loadWeatherSettings, saveWeatherSettings, toggleWeatherExpand, switchForecastTab };

// Export the module
export default WeatherForecast;
