/* weather.js —— Open-Meteo 天气 + 地理编码 */
export const WMO = {
  0: ['晴', 'Clear'], 1: ['大部晴朗', 'Mostly clear'], 2: ['多云', 'Partly cloudy'], 3: ['阴', 'Overcast'],
  45: ['雾', 'Fog'], 48: ['雾凇', 'Rime fog'],
  51: ['毛毛雨', 'Light drizzle'], 53: ['毛毛雨', 'Drizzle'], 55: ['密毛毛雨', 'Dense drizzle'],
  61: ['小雨', 'Light rain'], 63: ['中雨', 'Rain'], 65: ['大雨', 'Heavy rain'],
  66: ['冻雨', 'Freezing rain'], 67: ['强冻雨', 'Heavy freezing rain'],
  71: ['小雪', 'Light snow'], 73: ['中雪', 'Snow'], 75: ['大雪', 'Heavy snow'], 77: ['雪粒', 'Snow grains'],
  80: ['阵雨', 'Rain showers'], 81: ['强阵雨', 'Heavy showers'], 82: ['暴阵雨', 'Violent showers'],
  85: ['阵雪', 'Snow showers'], 86: ['强阵雪', 'Heavy snow showers'],
  95: ['雷阵雨', 'Thunderstorm'], 96: ['雷阵雨伴冰雹', 'Thunderstorm w/ hail'], 99: ['强雷暴冰雹', 'Severe thunderstorm']
};

export const EMOJI = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁', 45: '🌫', 48: '🌫', 51: '🌦', 53: '🌦', 55: '🌧',
  61: '🌧', 63: '🌧', 65: '🌧', 66: '🌧', 67: '🌧', 71: '🌨', 73: '🌨', 75: '❄', 77: '❄',
  80: '🌦', 81: '🌧', 82: '⛈', 85: '🌨', 86: '❄', 95: '⛈', 96: '⛈', 99: '⛈'
};

export async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error('city not found');
  return data.results[0];
}

export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=4`;
  const res = await fetch(url);
  return res.json();
}

export async function weatherByCity(city) {
  const geo = await geocode(city);
  const data = await fetchWeather(geo.latitude, geo.longitude);
  return { label: geo.name || city, data, geo: false };
}

export async function weatherByCoords(lat, lon, label) {
  const data = await fetchWeather(lat, lon);
  return { label: label || '我的位置', data, geo: true };
}
