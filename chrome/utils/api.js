// API utility functions

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const PEXELS_BASE = 'https://api.pexels.com/v1';

/**
 * Fetch current weather from OpenWeather API
 */
export async function fetchCurrentWeather(city, unit, apiKey) {
  const url = `${OPENWEATHER_BASE}/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

/**
 * Fetch forecast data (3h intervals) from OpenWeather API
 */
export async function fetchForecast(city, unit, apiKey) {
  const url = `${OPENWEATHER_BASE}/forecast?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
  return res.json();
}

/**
 * Fetch a random photo from Pexels based on searchTerm
 */
export async function fetchPexelsPhoto(searchTerm, apiKey) {
  const page = Math.floor(Math.random() * 15) + 1;
  const url = `${PEXELS_BASE}/search?query=${encodeURIComponent(searchTerm)}&per_page=1&page=${page}`;
  const res = await fetch(url, { headers: { 'Authorization': apiKey } });
  if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
  const data = await res.json();
  if (!data.photos || data.photos.length === 0) throw new Error('No photos found');
  return data.photos[0];
}

/**
 * Preload and return image data for a Pexels photo
 */
export async function preloadPhoto(photo) {
  const blob = await fetch(photo.src.original).then(r => r.blob());
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}