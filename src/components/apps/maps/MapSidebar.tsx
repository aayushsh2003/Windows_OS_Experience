import { Search, Star, Navigation, MapPin, Trash2, Clock, ChevronRight, X, Compass, Route, Cloud, Car, Footprints, Bike, Ruler } from 'lucide-react';
import type { SearchResult, FavoritePlace, NearbyPlace, WeatherData, RouteInfo, TravelMode } from './types';

interface MapSidebarProps {
  open: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (val: string) => void;
  onSearch: () => void;
  searching: boolean;
  results: SearchResult[];
  onSelectResult: (r: SearchResult) => void;
  favorites: FavoritePlace[];
  onRemoveFavorite: (id: string) => void;
  onSelectFavorite: (f: FavoritePlace) => void;
  nearbyPlaces: NearbyPlace[];
  onSelectNearby: (p: NearbyPlace) => void;
  weather: WeatherData | null;
  routeInfo: RouteInfo | null;
  onClearRoute: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  travelMode: TravelMode;
  onTravelModeChange: (mode: TravelMode) => void;
  searchHistory: string[];
  onClearHistory: () => void;
  onHistorySelect: (q: string) => void;
  measuring: boolean;
  measureDistance: number;
  onStartMeasure: () => void;
  onStopMeasure: () => void;
}

export function MapSidebar({
  open, onClose, search, onSearchChange, onSearch, searching, results,
  onSelectResult, favorites, onRemoveFavorite, onSelectFavorite,
  nearbyPlaces, onSelectNearby, weather, routeInfo, onClearRoute,
  activeTab, onTabChange, travelMode, onTravelModeChange,
  searchHistory, onClearHistory, onHistorySelect,
  measuring, measureDistance, onStartMeasure, onStopMeasure
}: MapSidebarProps) {
  const tabs = [
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'route', icon: Route, label: 'Route' },
    { id: 'nearby', icon: Compass, label: 'Nearby' },
    { id: 'favorites', icon: Star, label: 'Saved' },
    { id: 'weather', icon: Cloud, label: 'Weather' },
  ];

  const travelModes: { mode: TravelMode; icon: typeof Car; label: string }[] = [
    { mode: 'driving', icon: Car, label: 'Drive' },
    { mode: 'walking', icon: Footprints, label: 'Walk' },
    { mode: 'cycling', icon: Bike, label: 'Bike' },
  ];

  return (
    <div className={`absolute top-0 left-0 h-full z-20 transition-all duration-300 ${open ? 'w-[320px]' : 'w-0'} overflow-hidden`}>
      <div className="h-full w-[320px] bg-background/95 backdrop-blur-xl border-r border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">Maps</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-medium transition-colors ${activeTab === t.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'search' && (
            <div className="p-3">
              <div className="flex gap-2 mb-3">
                <div className="flex-1 flex items-center bg-muted rounded-lg px-3 py-2 gap-2">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSearch()}
                    placeholder="Search places..."
                    className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <button onClick={onSearch} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
                  Go
                </button>
              </div>

              {/* Measure tool */}
              <button
                onClick={measuring ? onStopMeasure : onStartMeasure}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-3 transition-colors ${measuring ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent'}`}
              >
                <Ruler className="w-4 h-4" />
                {measuring ? `Measuring: ${measureDistance >= 1000 ? (measureDistance / 1000).toFixed(2) + ' km' : Math.round(measureDistance) + ' m'}` : 'Measure distance'}
              </button>

              {searching && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => onSelectResult(r)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted text-left transition-colors mb-1"
                >
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{r.display_name.split(',')[0]}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{r.display_name.split(',').slice(1, 3).join(',')}</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground mt-1 shrink-0" />
                </button>
              ))}

              {!searching && results.length === 0 && !search && searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</span>
                    <button onClick={onClearHistory} className="text-[10px] text-destructive hover:underline">Clear</button>
                  </div>
                  {searchHistory.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => onHistorySelect(h)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors mb-0.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-foreground truncate">{h}</span>
                    </button>
                  ))}
                </div>
              )}

              {!searching && results.length === 0 && search && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No results found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'route' && (
            <div className="p-3">
              {/* Travel mode selector */}
              <div className="flex gap-1 mb-3 bg-muted rounded-lg p-1">
                {travelModes.map(tm => (
                  <button
                    key={tm.mode}
                    onClick={() => onTravelModeChange(tm.mode)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[10px] font-medium transition-all ${travelMode === tm.mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <tm.icon className="w-3.5 h-3.5" />
                    {tm.label}
                  </button>
                ))}
              </div>

              {routeInfo ? (
                <div className="space-y-3">
                  <div className="bg-muted rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Route className="w-5 h-5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Route Info</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-primary">{(routeInfo.distance / 1000).toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">km</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-primary">
                          {routeInfo.duration >= 3600
                            ? `${Math.floor(routeInfo.duration / 3600)}h ${Math.round((routeInfo.duration % 3600) / 60)}m`
                            : `${Math.round(routeInfo.duration / 60)}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{routeInfo.duration >= 3600 ? '' : 'min'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                      {travelMode === 'driving' && <Car className="w-3.5 h-3.5" />}
                      {travelMode === 'walking' && <Footprints className="w-3.5 h-3.5" />}
                      {travelMode === 'cycling' && <Bike className="w-3.5 h-3.5" />}
                      <span className="capitalize">{travelMode}</span>
                    </div>
                  </div>
                  <button onClick={onClearRoute} className="w-full py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors">
                    Clear Route
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Route className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Click the route button then click two points on the map</p>
                  <p className="text-[10px] mt-1 opacity-60">Select travel mode above</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="p-3">
              {nearbyPlaces.length > 0 ? nearbyPlaces.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onSelectNearby(p)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted text-left transition-colors mb-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{p.type.replace(/_/g, ' ')}</p>
                  </div>
                </button>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Compass className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Search or locate yourself to find nearby places</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="p-3">
              {favorites.length > 0 ? favorites.map(f => (
                <div key={f.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors mb-1">
                  <button onClick={() => onSelectFavorite(f)} className="flex-1 flex items-center gap-2.5 text-left min-w-0">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">{f.lat.toFixed(4)}, {f.lon.toFixed(4)}</p>
                    </div>
                  </button>
                  <button onClick={() => onRemoveFavorite(f.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No saved places yet</p>
                  <p className="text-[10px] mt-1 opacity-60">Click the star icon on markers to save</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="p-3">
              {weather ? (
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="" className="w-14 h-14" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{Math.round(weather.temperature)}°C</p>
                      <p className="text-xs text-muted-foreground capitalize">{weather.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <p className="text-xs font-bold text-foreground">{Math.round(weather.feelsLike)}°</p>
                      <p className="text-[9px] text-muted-foreground">Feels like</p>
                    </div>
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <p className="text-xs font-bold text-foreground">{weather.humidity}%</p>
                      <p className="text-[9px] text-muted-foreground">Humidity</p>
                    </div>
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <p className="text-xs font-bold text-foreground">{weather.windSpeed}</p>
                      <p className="text-[9px] text-muted-foreground">Wind m/s</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Cloud className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Weather data unavailable</p>
                  <p className="text-[10px] mt-1 opacity-60">Navigate to a location to see weather</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
