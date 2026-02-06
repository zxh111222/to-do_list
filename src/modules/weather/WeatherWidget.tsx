import { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { CloudRain, Wind, Droplets, Sun, Cloud, CloudFog, CloudSnow, CloudLightning } from 'lucide-react';
import { fetchWeather, getWeatherDescription, WeatherData, getCoordinates } from '../../services/weather';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAppStore } from '../../store/useAppStore';
// @ts-ignore
import { Lunar } from 'lunar-javascript';

const WeatherIcon = ({ code, className }: { code: number; className?: string }) => {
  if (code === 0 || code === 1) return <Sun className={className} />;
  if (code === 2 || code === 3) return <Cloud className={className} />;
  if (code === 45 || code === 48) return <CloudFog className={className} />;
  if (code >= 51 && code <= 67) return <CloudRain className={className} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  return <Sun className={className} />;
};

export const WeatherWidget = () => {
  const { weatherCity } = useAppStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Clock timer
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Weather fetch logic
    const loadWeather = async () => {
        try {
            let lat = 39.9042;
            let lon = 116.4074;

            if (weatherCity) {
                try {
                    const coords = await getCoordinates(weatherCity);
                    lat = coords.lat;
                    lon = coords.lon;
                } catch (e) {
                    console.error("City not found, using default/location", e);
                }
            }

            const data = await fetchWeather(lat, lon);
            setWeather(data);
        } catch (error) {
            console.error(error);
        }
    };

    loadWeather();
    
    return () => clearInterval(timer);
  }, [weatherCity]);

  // Lunar Date
  const lunarDate = Lunar.fromDate(currentTime);
  const lunarStr = `农历${lunarDate.getMonthInChinese()}月${lunarDate.getDayInChinese()}`;

  return (
    <GlassCard className="relative overflow-hidden group flex flex-col justify-between h-full !p-4">
       {/* Clock Section - Reduced size */}
       <div className="flex justify-between items-start mb-1">
           <div>
               <div className="text-4xl font-light tracking-tighter text-white drop-shadow-lg">
                   {format(currentTime, 'HH:mm')}
               </div>
               <div className="flex flex-col mt-0.5 space-y-0.5">
                   <div className="text-xs font-medium text-white/90 tracking-wide uppercase">
                       {format(currentTime, 'MM月dd日 EEEE', { locale: zhCN })}
                   </div>
                   <div className="text-[10px] text-white/50 font-medium">
                       {lunarStr}
                   </div>
               </div>
           </div>
           
           {weather && (
               <div className="text-right flex flex-col items-end">
                   <div className="text-3xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tracking-tighter">
                    {Math.round(weather.current.temperature)}°
                   </div>
                   <div className="text-xs text-white/80 flex items-center justify-end gap-1 mt-0.5 font-medium">
                       <WeatherIcon code={weather.current.weatherCode} className="w-3.5 h-3.5 text-blue-300" />
                       {getWeatherDescription(weather.current.weatherCode)}
                   </div>
                   <div className="text-[10px] text-white/40 mt-0.5 font-medium bg-white/5 px-1.5 py-0.5 rounded-full border border-white/5">
                        H:{Math.round(weather.daily[0].maxTemp)}° L:{Math.round(weather.daily[0].minTemp)}°
                   </div>
               </div>
           )}
       </div>

       {/* Weather Grid - Compact */}
       {weather && (
           <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2 mt-1">
                <div className="flex items-center gap-2 text-[10px] text-white/70 bg-white/5 p-1.5 rounded-lg border border-white/5">
                    <div className="p-1 bg-blue-500/20 rounded text-blue-300">
                        <Wind size={12} />
                    </div>
                    <div>
                        <div className="text-[9px] text-white/40 uppercase tracking-wider">风速</div>
                        <div className="font-semibold">{weather.current.windSpeed} km/h</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/70 bg-white/5 p-1.5 rounded-lg border border-white/5">
                    <div className="p-1 bg-cyan-500/20 rounded text-cyan-300">
                        <Droplets size={12} />
                    </div>
                    <div>
                        <div className="text-[9px] text-white/40 uppercase tracking-wider">湿度</div>
                        <div className="font-semibold">{weather.current.humidity}%</div>
                    </div>
                </div>
           </div>
       )}

       {/* Forecast - Compact */}
       {weather && (
           <div className="mt-auto pt-2 flex justify-between px-1">
                {weather.daily.slice(1, 4).map((day) => (
                    <div key={day.date} className="flex flex-col items-center gap-1 group/day cursor-default">
                        <span className="text-[9px] font-bold text-white/40 group-hover/day:text-white/60 transition-colors uppercase tracking-widest">
                            {format(new Date(day.date), 'EEE', { locale: zhCN })}
                        </span>
                        <div className="p-1.5 rounded-full bg-white/5 border border-white/5 group-hover/day:bg-white/10 transition-colors">
                            <WeatherIcon code={day.weatherCode} className="w-4 h-4 text-white/90" />
                        </div>
                        <span className="text-[9px] font-medium text-white/60 group-hover/day:text-white/80 transition-colors">
                            {Math.round(day.maxTemp)}°
                        </span>
                    </div>
                ))}
           </div>
       )}
    </GlassCard>
  );
};
