import { useEffect, useState, useCallback } from 'react';
import { t } from '../lib/i18n.js';
import { WMO, EMOJI, weatherByCity, weatherByCoords } from '../lib/weather.js';

export default function WeatherCard({ city, onLocated }) {
  const [state, setState] = useState({ status: 'loading' });

  const load = useCallback(async (c) => {
    setState({ status: 'loading' });
    try {
      const r = await weatherByCity(c);
      setState({ status: 'ok', ...r });
    } catch (e) {
      setState({ status: 'error', label: c });
    }
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) { alert(t('geo_unsupported')); return; }
    setState(s => ({ ...s, locating: true }));
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const r = await weatherByCoords(lat, lon, t('my_location'));
        setState({ status: 'ok', ...r });
        if (onLocated) onLocated({ lat, lon, label: t('my_location') });
      } catch (e) {
        setState({ status: 'error', label: t('my_location') });
      }
    }, () => {
      setState(s => ({ ...s, locating: false }));
      alert(t('geo_denied'));
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }, [onLocated]);

  useEffect(() => { load(city); }, [city, load]);

  const LocateBtn = () => (
    <button className={`wx-locate${state.locating ? ' loading' : ''}`} onClick={locate}>
      <svg viewBox="0 0 24 24" width="13" height="13">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" fill="none" />
      </svg>
      <span>{state.locating ? t('locating') : t('locate')}</span>
    </button>
  );

  const head = (
    <div className="card-title">
      <span className="dot" />
      <span>{t('weather')}</span>
      <LocateBtn />
    </div>
  );

  if (state.status === 'loading') {
    return <div className="card weather-card flat">{head}<div className="muted small">{t('loading_weather')}</div></div>;
  }
  if (state.status === 'error') {
    return (
      <div className="card weather-card flat">
        {head}
        <div className="wx-city">📍 {state.label}</div>
        <div className="muted small" style={{ marginTop: 8 }}>{t('weather_fail')}</div>
      </div>
    );
  }

  const cw = state.data.current_weather;
  const code = cw.weathercode;
  const daily = state.data.daily;
  const [zh, en] = WMO[code] || ['未知', 'Unknown'];
  const desc = (document.documentElement.getAttribute('data-mode') && t('weather') === 'Weather') ? en : zh;

  return (
    <div className="card weather-card flat">
      {head}
      <div className="wx-main">
        <div className="wx-ico-big">{EMOJI[code] || '🌡'}</div>
        <div>
          <div className="wx-city">{state.geo ? '🎯' : '📍'} {state.label}</div>
          <div className="wx-temp">{Math.round(cw.temperature)}<em>°C</em></div>
          <div className="wx-desc muted">{desc} · 风 {Math.round(cw.windspeed)} km/h</div>
        </div>
      </div>
      <div className="wx-days">
        {daily.time.map((d, i) => {
          const dt = new Date(d + 'T00:00:00');
          const names = ['日', '一', '二', '三', '四', '五', '六'];
          const namesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const isEn = t('weather') === 'Weather';
          const name = i === 0 ? (isEn ? 'Today' : '今天') : (isEn ? namesEn[dt.getDay()] : names[dt.getDay()]);
          return (
            <div className="wx-day" key={d}>
              <div className="wx-day-name">{name}</div>
              <div className="wx-day-ico">{EMOJI[daily.weathercode[i]] || '🌡'}</div>
              <div className="wx-day-temp">
                {Math.round(daily.temperature_2m_max[i])}°<span>{Math.round(daily.temperature_2m_min[i])}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
