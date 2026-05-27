export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  name: string;
  type?: string;
  isFavorite?: boolean;
}

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  place_id: number;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  geometry: [number, number][];
}

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export interface NearbyPlace {
  name: string;
  lat: number;
  lon: number;
  type: string;
  distance?: number;
}

export interface FavoritePlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  addedAt: number;
}

export interface MeasurePoint {
  lat: number;
  lon: number;
}

export type TravelMode = 'driving' | 'walking' | 'cycling';

export function getFavorites(): FavoritePlace[] {
  try {
    return JSON.parse(localStorage.getItem('map-favorites') || '[]');
  } catch { return []; }
}

export function saveFavorites(favs: FavoritePlace[]) {
  localStorage.setItem('map-favorites', JSON.stringify(favs));
}

export function addFavorite(place: Omit<FavoritePlace, 'id' | 'addedAt'>): FavoritePlace[] {
  const favs = getFavorites();
  const newFav: FavoritePlace = { ...place, id: Date.now().toString(), addedAt: Date.now() };
  const updated = [newFav, ...favs.filter(f => !(Math.abs(f.lat - place.lat) < 0.0001 && Math.abs(f.lon - place.lon) < 0.0001))];
  saveFavorites(updated);
  return updated;
}

export function removeFavorite(id: string): FavoritePlace[] {
  const favs = getFavorites().filter(f => f.id !== id);
  saveFavorites(favs);
  return favs;
}

export function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem('map-search-history') || '[]');
  } catch { return []; }
}

export function addSearchHistory(query: string): string[] {
  const history = getSearchHistory().filter(h => h.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...history].slice(0, 10);
  localStorage.setItem('map-search-history', JSON.stringify(updated));
  return updated;
}

export function clearSearchHistory(): string[] {
  localStorage.removeItem('map-search-history');
  return [];
}
