import { startClock } from './clock.js';
import { initNotes } from './notes.js';
import WeatherForecast, { loadWeatherSettings, saveWeatherSettings, toggleWeatherExpand, switchForecastTab } from './weather.js';
import { initSettings } from './settings.js';
import { initBackgroundUI } from './background-ui.js';
import { initFavorites } from './favorites.js';

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  initBackgroundUI();
  startClock();
  initNotes();
  initFavorites();

  const wf = new WeatherForecast();
  wf.init();
  loadWeatherSettings();
  document.getElementById('weather-toggle').addEventListener('change', saveWeatherSettings);
  document.getElementById('weather-forecast-toggle').addEventListener('change', saveWeatherSettings);
  document.getElementById('city').addEventListener('change', saveWeatherSettings);
  document.getElementById('unit').addEventListener('change', saveWeatherSettings);
  document.getElementById('openweather-api-key').addEventListener('change', saveWeatherSettings);
  document.getElementById('weather-expand').addEventListener('click', toggleWeatherExpand);
  document.getElementById('tab-hourly').addEventListener('click', () => switchForecastTab('hourly'));
  document.getElementById('tab-daily').addEventListener('click', () => switchForecastTab('daily'));

  // TODO: initialize background, CSS, favorites UIs as separate modules
});
