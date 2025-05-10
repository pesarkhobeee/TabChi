import { startClock } from './clock.js';
import { initNotes } from './notes.js';
import WeatherForecast, { loadWeatherSettings, saveWeatherSettings, toggleWeatherExpand, switchForecastTab } from './weather.js';
import { initSettings } from './settings.js';
import { initBackgroundUI } from './background-ui.js';
import { initFavorites } from './favorites.js';
import {initCustomCSS, openCSSEditor, closeCSSEditor, saveCustomCSS} from './custom-css.js';


// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  initBackgroundUI();
  initFavorites();
  startClock();
  initNotes();
  initCustomCSS();

  const wf = new WeatherForecast();
  wf.init();
  loadWeatherSettings();
  document.getElementById('weather-toggle').addEventListener('change', saveWeatherSettings);
  document.getElementById('weather-forecast-toggle').addEventListener('change', saveWeatherSettings);
  document.getElementById('city').addEventListener('change', saveWeatherSettings);
  document.getElementById('unit').addEventListener('change', saveWeatherSettings);
  document.getElementById('openweather-api-key').addEventListener('change', saveWeatherSettings);
  document.getElementById('weather-expand').addEventListener('click', toggleWeatherExpand);
  document.getElementById('toggle-css-editor').addEventListener('click', openCSSEditor);
  document.getElementById('close-css-editor').addEventListener('click', closeCSSEditor);
  document.getElementById('save-css').addEventListener('click', saveCustomCSS);
  document.getElementById('tab-hourly').addEventListener('click', () => switchForecastTab('hourly'));
  document.getElementById('tab-daily').addEventListener('click', () => switchForecastTab('daily'));
});
