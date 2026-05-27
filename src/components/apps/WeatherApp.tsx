import { useState, useEffect } from 'react';
import { MapPin, Thermometer, Wind, Droplets, Eye, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  visibility: number;
  city: string;
}

const weatherIcons: Record<number, React.ReactNode> = {
  0: <Sun className="w-16 h-16 text-yellow-400" />,
  1: <Sun className="w-16 h-16 text-yellow-400" />,
  2: <Cloud className="w-16 h-16 text-muted-foreground" />,
  3: <Cloud className="w-16 h-16 text-muted-foreground" />,
  45: <CloudFog className="w-16 h-16 text-muted-foreground" />,
  48: <CloudFog className="w-16 h-16 text-muted-foreground" />,
  51: <CloudRain className="w-16 h-16 text-primary" />,
  61: <CloudRain className="w-16 h-16 text-primary" />,
  71: <CloudSnow className="w-16 h-16 text-blue-300" />,
  95: <CloudLightning className="w-16 h-16 text-yellow-500" />,
};

const weatherLabels: Record<number, string> = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Dense Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
  80: 'Rain Showers', 95: 'Thunderstorm',
};

function getWeatherIcon(code: number) {
  if (code <= 1) return weatherIcons[0];
  if (code <= 3) return weatherIcons[3];
  if (code <= 48) return weatherIcons[45];
  if (code <= 57) return weatherIcons[51];
  if (code <= 67) return weatherIcons[61];
  if (code <= 77) return weatherIcons[71];
  return weatherIcons[95];
}

export function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hourly, setHourly] = useState<{ time: string; temp: number; code: number }[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode
          let city = 'Your Location';
          try {
            const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1`);
            const geoData = await geo.json();
            if (geoData.results?.[0]) city = geoData.results[0].name;
          } catch {}

          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code,visibility&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=1`
          );
          const data = await res.json();
          setWeather({
            temperature: data.current.temperature_2m,
            feelsLike: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            windDirection: data.current.wind_direction_10m,
            weatherCode: data.current.weather_code,
            visibility: data.current.visibility / 1000,
            city,
          });
          const now = new Date().getHours();
          setHourly(
            data.hourly.time.slice(now, now + 12).map((t: string, i: number) => ({
              time: new Date(t).toLocaleTimeString([], { hour: '2-digit' }),
              temp: data.hourly.temperature_2m[now + i],
              code: data.hourly.weather_code[now + i],
            }))
          );
        } catch {
          setError('Failed to fetch weather data');
        }
        setLoading(false);
      },
      () => { setError('Location access denied. Enable location to see weather.'); setLoading(false); },
      { timeout: 10000 }
    );
  }, []);

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <p className="text-sm text-muted-foreground text-center">{error}</p>
    </div>
  );

  if (!weather) return null;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-primary/5 to-background overflow-y-auto win-scrollbar">
      {/* Main */}
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        {getWeatherIcon(weather.weatherCode)}
        <p className="text-4xl font-light text-foreground mt-3">{Math.round(weather.temperature)}°C</p>
        <p className="text-sm text-muted-foreground mt-1">{weatherLabels[weather.weatherCode] || 'Unknown'}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />{weather.city}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <DetailCard icon={<Thermometer className="w-4 h-4" />} label="Feels Like" value={`${Math.round(weather.feelsLike)}°C`} />
        <DetailCard icon={<Droplets className="w-4 h-4" />} label="Humidity" value={`${weather.humidity}%`} />
        <DetailCard icon={<Wind className="w-4 h-4" />} label="Wind" value={`${weather.windSpeed} km/h`} />
        <DetailCard icon={<Eye className="w-4 h-4" />} label="Visibility" value={`${weather.visibility.toFixed(1)} km`} />
      </div>

      {/* Hourly */}
      <div className="px-4 pb-4">
        <p className="text-xs font-medium text-foreground mb-2">Hourly Forecast</p>
        <div className="flex gap-3 overflow-x-auto win-scrollbar pb-2">
          {hourly.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[50px] bg-muted rounded-lg p-2">
              <span className="text-[10px] text-muted-foreground">{h.time}</span>
              <span className="text-lg">{h.code <= 1 ? '☀️' : h.code <= 3 ? '⛅' : h.code <= 67 ? '🌧️' : '❄️'}</span>
              <span className="text-xs font-medium text-foreground">{Math.round(h.temp)}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
