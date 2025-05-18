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

// Export control functions for dashboard UI
export { loadWeatherSettings, saveWeatherSettings, toggleWeatherExpand, switchForecastTab };
