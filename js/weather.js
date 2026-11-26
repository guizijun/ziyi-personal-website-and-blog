/* weather.js —— 天气与地区（Open-Meteo 免费接口，无需 key） */
window.Weather = (function () {
  const WMO = {
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
  const EMOJI = {
    0:'☀️',1:'🌤',2:'⛅',3:'☁',45:'🌫',48:'🌫',51:'🌦',53:'🌦',55:'🌧',
    61:'🌧',63:'🌧',65:'🌧',66:'🌧',67:'🌧',71:'🌨',73:'🌨',75:'❄',77:'❄',
    80:'🌦',81:'🌧',82:'⛈',85:'🌨',86:'❄',95:'⛈',96:'⛈',99:'⛈'
  };

  async function geocode(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || !data.results.length) throw new Error('city not found');
    return data.results[0];
  }

  async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=4`;
    const res = await fetch(url);
    return res.json();
  }

  function render(el, city, data, opts) {
    const cw = data.current_weather;
    const code = cw.weathercode;
    const [zh, en] = WMO[code] || ['未知', 'Unknown'];
    const lang = window.APP_STATE?.lang || 'zh';
    const desc = lang === 'en' ? en : zh;
    const daily = data.daily;

    const days = daily.time.map((d, i) => {
      const dt = new Date(d + 'T00:00:00');
      const name = lang === 'en'
        ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]
        : ['日','一','二','三','四','五','六'][dt.getDay()];
      return `
        <div class="wx-day">
          <div class="wx-day-name">${i === 0 ? (lang === 'en' ? 'Today' : '今天') : name}</div>
          <div class="wx-day-ico">${EMOJI[daily.weathercode[i]] || '🌡'}</div>
          <div class="wx-day-temp">${Math.round(daily.temperature_2m_max[i])}°<span>${Math.round(daily.temperature_2m_min[i])}°</span></div>
        </div>`;
    }).join('');

    const isGeo = opts && opts.geo;
    el.innerHTML = `
      <div class="card-title">
        <span class="dot"></span><span data-i18n="weather">${window.t('weather')}</span>
        <button class="wx-locate" id="wx-locate" title="${window.t('locate')}">
          <svg viewBox="0 0 24 24" width="13" height="13"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>
          <span>${window.t('locate')}</span>
        </button>
      </div>
      <div class="wx-main">
        <div class="wx-ico-big">${EMOJI[code] || '🌡'}</div>
        <div>
          <div class="wx-city">${isGeo ? '🎯' : '📍'} ${city}</div>
          <div class="wx-temp">${Math.round(cw.temperature)}<em>°C</em></div>
          <div class="wx-desc muted">${desc} · 风 ${Math.round(cw.windspeed)} km/h</div>
        </div>
      </div>
      <div class="wx-days">${days}</div>`;
    const btn = el.querySelector('#wx-locate');
    if (btn) btn.addEventListener('click', () => locate(el));
  }

  async function load(targetEl, city) {
    const el = typeof targetEl === 'string' ? document.querySelector(targetEl) : targetEl;
    if (!el) return;
    el.innerHTML = `<div class="muted small">${window.t('loading_weather')}</div>`;
    try {
      const geo = await geocode(city);
      const data = await fetchWeather(geo.latitude, geo.longitude);
      render(el, geo.name || city, data);
    } catch (e) {
      renderError(el, city);
    }
  }

  async function loadCoords(targetEl, lat, lon, label) {
    const el = typeof targetEl === 'string' ? document.querySelector(targetEl) : targetEl;
    if (!el) return;
    el.innerHTML = `<div class="muted small">${window.t('loading_weather')}</div>`;
    try {
      const data = await fetchWeather(lat, lon);
      render(el, label || '我的位置', data, { geo: true });
    } catch (e) {
      renderError(el, label || '我的位置');
    }
  }

  function renderError(el, city) {
    el.innerHTML = `
      <div class="card-title">
        <span class="dot"></span>${window.t('weather')}
        <button class="wx-locate" id="wx-locate">
          <svg viewBox="0 0 24 24" width="13" height="13"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>
          <span>${window.t('locate')}</span>
        </button>
      </div>
      <div class="wx-city">📍 ${city}</div>
      <div class="muted small" style="margin-top:8px">${window.t('weather_fail')}</div>`;
    const btn = el.querySelector('#wx-locate');
    if (btn) btn.addEventListener('click', () => locate(el));
  }

  /* 浏览器定位 → 拉取当地天气 */
  function locate(targetEl) {
    const el = typeof targetEl === 'string' ? document.querySelector(targetEl) : targetEl;
    if (!el) return;
    if (!navigator.geolocation) {
      alert(window.t('geo_unsupported'));
      return;
    }
    el.insertAdjacentHTML('beforeend', '');
    const btn = el.querySelector('#wx-locate');
    if (btn) btn.classList.add('loading');
    if (btn) btn.querySelector('span').textContent = window.t('locating');

    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      // 持久化定位结果
      try {
        const prefs = window.Theme ? window.Theme.prefs : {};
        if (window.Theme) {
          window.Theme.save({ ...prefs, coords: { lat, lon }, city: window.t('my_location') });
        }
      } catch (e) { /* 忽略 */ }
      await loadCoords(el, lat, lon, window.t('my_location'));
    }, () => {
      if (btn) {
        btn.classList.remove('loading');
        btn.querySelector('span').textContent = window.t('locate');
      }
      alert(window.t('geo_denied'));
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  return { load, loadCoords, locate };
})();
