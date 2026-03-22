import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Thermometer, Calendar } from 'lucide-react';

const LAT = 41.9270; // Kingston, NY area
const LON = -73.9974;

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York&forecast_days=3`);
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
    // Update every 30 mins
    const timer = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (code) => {
    if (code <= 1) return <Sun className="text-amber-400" />;
    if (code <= 3) return <Cloud className="text-slate-400" />;
    if (code <= 65) return <CloudRain className="text-blue-400" />;
    if (code <= 99) return <CloudLightning className="text-amber-600" />;
    return <Cloud className="text-slate-400" />;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) return (
    <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center rounded-2xl">
      <span className="text-slate-700 font-bold uppercase tracking-widest text-xs">Syncing Satellite...</span>
    </div>
  );

  if (!weather) return null;

  const current = weather.current;
  const daily = weather.daily;

  return (
    <div className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 text-white h-full shadow-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Background Icon */}
      <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
        <Sun size={120} />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">LOCAL CONDITIONS // HUDSON VALLEY</h2>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-black tracking-tighter">{Math.round(current.temperature_2m)}°</span>
            <div>
              <p className="text-sm font-bold text-slate-200">Feels like {Math.round(current.apparent_temperature)}°</p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase">
                {getWeatherIcon(current.weather_code)}
                <span>STATION ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
           <Wind size={18} className="text-slate-400 mb-1" />
           <span className="text-xs font-black">{Math.round(current.wind_speed_10m)} <span className="text-[8px] opacity-40">MPH</span></span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center gap-2">
           <Thermometer size={14} className="text-slate-500" />
           <span className="text-[10px] uppercase font-bold text-slate-400">Low: {Math.round(daily.temperature_2m_min[0])}°</span>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center gap-2">
           <CloudRain size={14} className="text-blue-500" />
           <span className="text-[10px] uppercase font-bold text-slate-400">Rain: {daily.precipitation_probability_max[0]}%</span>
        </div>
      </div>

      {/* Forecast */}
      <div>
        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
           <Calendar size={12} /> 3-DAY FORECAST
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {daily.time.map((date, i) => {
            const d = new Date(date + 'T00:00:00');
            return (
              <div key={date} className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">{dayNames[d.getDay()]}</p>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(daily.weather_code[i])}
                </div>
                <div className="flex justify-center gap-2">
                  <span className="text-xs font-black">{Math.round(daily.temperature_2m_max[i])}°</span>
                  <span className="text-xs font-bold text-slate-500">{Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
