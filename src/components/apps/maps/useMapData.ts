import { useState, useCallback, useRef } from 'react';
import type { SearchResult, RouteInfo, WeatherData, NearbyPlace, FavoritePlace, MapMarker, MeasurePoint, TravelMode } from './types';
import { getFavorites, addFavorite, removeFavorite as removeFav, getSearchHistory, addSearchHistory, clearSearchHistory } from './types';

function haversineDistance(a: MeasurePoint, b: MeasurePoint): number {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const sa = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
}

export function useMapData() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routePoints, setRoutePoints] = useState<{ lat: number; lon: number }[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [favorites, setFavorites] = useState<FavoritePlace[]>(getFavorites());
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [searchHistory, setSearchHistoryState] = useState<string[]>(getSearchHistory());
  const [measurePoints, setMeasurePoints] = useState<MeasurePoint[]>([]);
  const [measuring, setMeasuring] = useState(false);
  const [measureDistance, setMeasureDistance] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const searchPlaces = useCallback(async (query?: string) => {
    const q = query || search;
    if (!q.trim()) return;
    setSearching(true);
    setSearchHistoryState(addSearchHistory(q.trim()));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&addressdetails=1`);
      const data: SearchResult[] = await res.json();
      setResults(data);
    } catch { setResults([]); }
    setSearching(false);
  }, [search]);

  const handleSearchInput = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.trim().length >= 2) {
      searchTimeout.current = setTimeout(() => searchPlaces(val), 400);
    } else {
      setResults([]);
    }
  };

  const addMarker = useCallback((lat: number, lon: number, name: string, type?: string) => {
    setMarkers(prev => [...prev, { id: Date.now().toString(), lat, lon, name, type }]);
  }, []);

  const removeMarker = useCallback((id: string) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
  }, []);

  const fetchRoute = useCallback(async (from: { lat: number; lon: number }, to: { lat: number; lon: number }, mode?: TravelMode) => {
    const profile = mode || travelMode;
    const osrmProfile = profile === 'walking' ? 'foot' : profile === 'cycling' ? 'bike' : 'driving';
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/${osrmProfile}/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes?.[0]) {
        const route = data.routes[0];
        const coords: [number, number][] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
        setRouteInfo({ distance: route.distance, duration: route.duration, geometry: coords });
      }
    } catch { /* silent */ }
  }, [travelMode]);

  const handleRouteClick = useCallback((lat: number, lon: number) => {
    const pts = [...routePoints, { lat, lon }];
    setRoutePoints(pts);
    if (pts.length === 1) {
      addMarker(lat, lon, 'Start', 'route-start');
    } else if (pts.length === 2) {
      addMarker(lat, lon, 'End', 'route-end');
      fetchRoute(pts[0], pts[1]);
    }
  }, [routePoints, addMarker, fetchRoute]);

  const clearRoute = useCallback(() => {
    setRouteInfo(null);
    setRoutePoints([]);
    setMarkers(prev => prev.filter(m => m.type !== 'route-start' && m.type !== 'route-end'));
  }, []);

  const changeTravelMode = useCallback((mode: TravelMode) => {
    setTravelMode(mode);
    if (routePoints.length === 2) {
      fetchRoute(routePoints[0], routePoints[1], mode);
    }
  }, [routePoints, fetchRoute]);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
      );
      const data = await res.json();
      const c = data.current;
      const wmoToDesc: Record<number, { desc: string; icon: string }> = {
        0: { desc: 'Clear sky', icon: '01d' }, 1: { desc: 'Mainly clear', icon: '02d' },
        2: { desc: 'Partly cloudy', icon: '03d' }, 3: { desc: 'Overcast', icon: '04d' },
        45: { desc: 'Foggy', icon: '50d' }, 48: { desc: 'Rime fog', icon: '50d' },
        51: { desc: 'Light drizzle', icon: '09d' }, 53: { desc: 'Drizzle', icon: '09d' },
        55: { desc: 'Dense drizzle', icon: '09d' }, 61: { desc: 'Slight rain', icon: '10d' },
        63: { desc: 'Moderate rain', icon: '10d' }, 65: { desc: 'Heavy rain', icon: '10d' },
        71: { desc: 'Slight snow', icon: '13d' }, 73: { desc: 'Moderate snow', icon: '13d' },
        75: { desc: 'Heavy snow', icon: '13d' }, 95: { desc: 'Thunderstorm', icon: '11d' },
      };
      const wmo = wmoToDesc[c.weather_code] || { desc: 'Unknown', icon: '01d' };
      setWeather({
        temperature: c.temperature_2m,
        description: wmo.desc,
        icon: wmo.icon,
        humidity: c.relative_humidity_2m,
        windSpeed: c.wind_speed_10m,
        feelsLike: c.apparent_temperature,
      });
    } catch { /* silent */ }
  }, []);

  const fetchNearby = useCallback(async (lat: number, lon: number) => {
    try {
      const query = `[out:json][timeout:10];(node["amenity"](around:1000,${lat},${lon});node["tourism"](around:1000,${lat},${lon}););out body 15;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const data = await res.json();
      const places: NearbyPlace[] = (data.elements || [])
        .filter((e: any) => e.tags?.name)
        .map((e: any) => ({
          name: e.tags.name,
          lat: e.lat,
          lon: e.lon,
          type: e.tags.amenity || e.tags.tourism || 'place',
        }));
      setNearbyPlaces(places);
    } catch { setNearbyPlaces([]); }
  }, []);

  const toggleFavorite = useCallback((name: string, lat: number, lon: number) => {
    const existing = favorites.find(f => Math.abs(f.lat - lat) < 0.0001 && Math.abs(f.lon - lon) < 0.0001);
    if (existing) {
      setFavorites(removeFav(existing.id));
    } else {
      setFavorites(addFavorite({ name, lat, lon }));
    }
  }, [favorites]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(removeFav(id));
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistoryState(clearSearchHistory());
  }, []);

  // Measurement
  const startMeasuring = useCallback(() => {
    setMeasuring(true);
    setMeasurePoints([]);
    setMeasureDistance(0);
  }, []);

  const stopMeasuring = useCallback(() => {
    setMeasuring(false);
    setMeasurePoints([]);
    setMeasureDistance(0);
  }, []);

  const addMeasurePoint = useCallback((lat: number, lon: number) => {
    setMeasurePoints(prev => {
      const next = [...prev, { lat, lon }];
      if (next.length >= 2) {
        let total = 0;
        for (let i = 1; i < next.length; i++) total += haversineDistance(next[i - 1], next[i]);
        setMeasureDistance(total);
      }
      return next;
    });
  }, []);

  return {
    search, setSearch, results, setResults, searching, searchPlaces, handleSearchInput,
    markers, addMarker, removeMarker,
    routeInfo, routePoints, handleRouteClick, clearRoute, fetchRoute,
    weather, fetchWeather,
    nearbyPlaces, fetchNearby,
    favorites, toggleFavorite, removeFavorite,
    travelMode, changeTravelMode,
    searchHistory, clearHistory,
    measuring, measurePoints, measureDistance, startMeasuring, stopMeasuring, addMeasurePoint,
  };
}
