export interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    maxTemp: number;
    minTemp: number;
  }>;
}

// WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs
export const getWeatherDescription = (code: number): string => {
  if (code === 0) return '晴朗';
  if (code === 1 || code === 2 || code === 3) return '多云';
  if (code === 45 || code === 48) return '雾';
  if (code >= 51 && code <= 55) return '毛毛雨';
  if (code >= 61 && code <= 65) return '雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return '阵雨';
  if (code >= 95 && code <= 99) return '雷暴';
  return '未知';
};

interface GeoResult {
    lat: number;
    lon: number;
    name: string;
}

export const getCoordinates = async (city: string): Promise<GeoResult> => {
  try {
      const response = await fetch(
        `http://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`
      );
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        throw new Error('City not found');
      }
      return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name };
  } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
  }
};

export const fetchWeather = async (lat: number = 39.9042, lon: number = 116.4074): Promise<WeatherData> => {
  const response = await fetch(
    `http://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await response.json();

  return {
    current: {
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m,
    },
    daily: data.daily.time.map((time: string, index: number) => ({
      date: time,
      weatherCode: data.daily.weather_code[index],
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
    })),
  };
};
