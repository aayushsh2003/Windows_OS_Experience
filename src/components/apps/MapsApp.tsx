import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, X, MapPin, Navigation, Ruler } from 'lucide-react';
import { MapSidebar } from './maps/MapSidebar';
import { MapControls } from './maps/MapControls';
import { useMapData } from './maps/useMapData';
import type { SearchResult, FavoritePlace, NearbyPlace } from './maps/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color: string) => new L.DivIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><div style="width:8px;height:8px;background:white;border-radius:50%;margin:6px auto;transform:rotate(45deg)"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const blueIcon = createIcon('hsl(207,90%,54%)');
const redIcon = createIcon('hsl(0,84%,60%)');
const greenIcon = createIcon('hsl(142,76%,36%)');
const goldIcon = createIcon('hsl(45,93%,47%)');

const measureDot = new L.DivIcon({
  className: '',
  html: '<div style="width:10px;height:10px;background:hsl(0,84%,60%);border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const MAP_STYLES = {
  light: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', name: 'Light' },
  dark: { url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', name: 'Dark' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', name: 'Satellite' },
  topo: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', name: 'Terrain' },
};

type MapStyleKey = keyof typeof MAP_STYLES;

function MapEventHandler({ onClick, active }: { onClick: (lat: number, lon: number) => void; active: boolean }) {
  useMapEvents({
    click(e) { if (active) onClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.2 }); }, [center, zoom, map]);
  return null;
}

function LiveLocation({ tracking, onUpdate }: { tracking: boolean; onUpdate: (lat: number, lon: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!tracking) return;
    const id = navigator.geolocation?.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        onUpdate(latitude, longitude);
        map.flyTo([latitude, longitude], 15, { duration: 1 });
      },
      undefined,
      { enableHighAccuracy: true }
    );
    return () => { if (id !== undefined) navigator.geolocation.clearWatch(id); };
  }, [tracking, map, onUpdate]);
  return null;
}

export function MapsApp() {
  const data = useMapData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('light');
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number }>({ center: [28.6139, 77.209], zoom: 12 });
  const [tracking, setTracking] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(null);
  const [routing, setRouting] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  const goTo = (lat: number, lon: number, zoom = 15) => setFlyTarget({ center: [lat, lon], zoom });

  const handleSelectResult = (r: SearchResult) => {
    const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
    goTo(lat, lon);
    data.addMarker(lat, lon, r.display_name.split(',')[0], 'search');
    data.fetchWeather(lat, lon);
    data.fetchNearby(lat, lon);
    data.setResults([]);
    data.setSearch(r.display_name.split(',')[0]);
  };

  const handleSelectFavorite = (f: FavoritePlace) => {
    goTo(f.lat, f.lon);
    data.fetchWeather(f.lat, f.lon);
  };

  const handleSelectNearby = (p: NearbyPlace) => {
    goTo(p.lat, p.lon, 17);
    data.addMarker(p.lat, p.lon, p.name, 'nearby');
  };

  const handleLocate = () => {
    if (tracking) { setTracking(false); return; }
    navigator.geolocation?.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      setUserPos({ lat: latitude, lon: longitude });
      goTo(latitude, longitude);
      data.fetchWeather(latitude, longitude);
      data.fetchNearby(latitude, longitude);
      setTracking(true);
    });
  };

  const handleMapClick = (lat: number, lon: number) => {
    if (data.measuring) {
      data.addMeasurePoint(lat, lon);
    } else if (routing) {
      data.handleRouteClick(lat, lon);
      if (data.routePoints.length >= 1) setRouting(false);
    }
  };

  const handleShare = () => {
    const { center } = flyTarget;
    const url = `https://www.openstreetmap.org/#map=15/${center[0]}/${center[1]}`;
    navigator.clipboard?.writeText(url);
  };

  const toggleStyle = () => {
    const keys: MapStyleKey[] = ['light', 'dark', 'satellite', 'topo'];
    setMapStyle(keys[(keys.indexOf(mapStyle) + 1) % keys.length]);
  };

  const startRouting = () => {
    data.clearRoute();
    data.stopMeasuring();
    setRouting(true);
    setActiveTab('route');
    if (!sidebarOpen) setSidebarOpen(true);
  };

  const toggleMeasure = () => {
    if (data.measuring) {
      data.stopMeasuring();
    } else {
      data.startMeasuring();
      setRouting(false);
    }
  };

  const handleHistorySelect = (q: string) => {
    data.setSearch(q);
    data.searchPlaces(q);
  };

  const getMarkerIcon = (type?: string) => {
    if (type === 'route-start') return greenIcon;
    if (type === 'route-end') return redIcon;
    if (type === 'nearby') return goldIcon;
    return blueIcon;
  };

  const measureLinePositions: [number, number][] = data.measurePoints.map(p => [p.lat, p.lon]);

  return (
    <div className="flex h-full bg-background relative overflow-hidden">
      <MapSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        search={data.search}
        onSearchChange={data.handleSearchInput}
        onSearch={() => data.searchPlaces()}
        searching={data.searching}
        results={data.results}
        onSelectResult={handleSelectResult}
        favorites={data.favorites}
        onRemoveFavorite={data.removeFavorite}
        onSelectFavorite={handleSelectFavorite}
        nearbyPlaces={data.nearbyPlaces}
        onSelectNearby={handleSelectNearby}
        weather={data.weather}
        routeInfo={data.routeInfo}
        onClearRoute={() => { data.clearRoute(); setRouting(false); }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        travelMode={data.travelMode}
        onTravelModeChange={data.changeTravelMode}
        searchHistory={data.searchHistory}
        onClearHistory={data.clearHistory}
        onHistorySelect={handleHistorySelect}
        measuring={data.measuring}
        measureDistance={data.measureDistance}
        onStartMeasure={() => { data.startMeasuring(); setRouting(false); }}
        onStopMeasure={data.stopMeasuring}
      />

      <div className="flex-1 relative">
        <MapControls
          onZoomIn={() => setFlyTarget(p => ({ ...p, zoom: Math.min(18, p.zoom + 1) }))}
          onZoomOut={() => setFlyTarget(p => ({ ...p, zoom: Math.max(2, p.zoom - 1) }))}
          onLocate={handleLocate}
          onToggleStyle={toggleStyle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onShare={handleShare}
          onStartRouting={startRouting}
          onToggleMeasure={toggleMeasure}
          isTracking={tracking}
          isMeasuring={data.measuring}
          styleName={MAP_STYLES[mapStyle].name}
        />

        {/* Routing/Measuring banner */}
        {(routing || data.measuring) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2">
            {routing ? (
              <>
                <Navigation className="w-4 h-4" />
                Click {data.routePoints.length === 0 ? 'start' : 'end'} point on map
              </>
            ) : (
              <>
                <Ruler className="w-4 h-4" />
                Click points to measure · {data.measureDistance >= 1000 ? (data.measureDistance / 1000).toFixed(2) + ' km' : Math.round(data.measureDistance) + ' m'}
              </>
            )}
            <button onClick={() => { setRouting(false); data.clearRoute(); data.stopMeasuring(); }} className="ml-2 p-0.5 rounded hover:bg-primary-foreground/20">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <MapContainer
          center={flyTarget.center}
          zoom={flyTarget.zoom}
          className="w-full h-full z-0"
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={MAP_STYLES[mapStyle].url} />
          <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />
          <MapEventHandler onClick={handleMapClick} active={routing || data.measuring} />
          <LiveLocation tracking={tracking} onUpdate={(lat, lon) => setUserPos({ lat, lon })} />

          {/* User location with accuracy circle */}
          {userPos && (
            <>
              <Circle center={[userPos.lat, userPos.lon]} radius={50} pathOptions={{ color: 'hsl(207,90%,54%)', fillColor: 'hsl(207,90%,54%)', fillOpacity: 0.1, weight: 1 }} />
              <Marker
                position={[userPos.lat, userPos.lon]}
                icon={new L.DivIcon({
                  className: '',
                  html: '<div style="width:16px;height:16px;background:hsl(207,90%,54%);border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px hsl(207,90%,54%,0.3),0 2px 8px rgba(0,0,0,0.3)"></div>',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                })}
              >
                <Popup><span className="text-xs font-medium">You are here</span></Popup>
              </Marker>
            </>
          )}

          {/* Markers */}
          {data.markers.map(m => (
            <Marker key={m.id} position={[m.lat, m.lon]} icon={getMarkerIcon(m.type)}>
              <Popup>
                <div className="min-w-[140px]">
                  <p className="font-semibold text-xs mb-1">{m.name}</p>
                  <p className="text-[10px] text-gray-500 mb-2">{m.lat.toFixed(5)}, {m.lon.toFixed(5)}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => data.toggleFavorite(m.name, m.lat, m.lon)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                    >
                      <Star className="w-3 h-3" /> Save
                    </button>
                    <button
                      onClick={() => data.removeMarker(m.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-red-50 hover:bg-red-100 text-red-700"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route polyline */}
          {data.routeInfo && (
            <Polyline
              positions={data.routeInfo.geometry}
              pathOptions={{ color: 'hsl(207,90%,54%)', weight: 5, opacity: 0.8 }}
            />
          )}

          {/* Measure points & line */}
          {data.measurePoints.length > 0 && (
            <>
              {measureLinePositions.length >= 2 && (
                <Polyline positions={measureLinePositions} pathOptions={{ color: 'hsl(0,84%,60%)', weight: 3, dashArray: '8,6' }} />
              )}
              {data.measurePoints.map((p, i) => (
                <Marker key={`m-${i}`} position={[p.lat, p.lon]} icon={measureDot} />
              ))}
            </>
          )}
        </MapContainer>

        {/* Status Bar */}
        <div className="absolute bottom-2 left-2 z-10">
          <div className="bg-background/80 backdrop-blur border border-border rounded-lg px-2.5 py-1 shadow flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground font-mono">
              {flyTarget.center[0].toFixed(4)}, {flyTarget.center[1].toFixed(4)}
            </span>
            <span className="text-[9px] text-border">|</span>
            <span className="text-[9px] text-muted-foreground">Zoom {flyTarget.zoom}</span>
            <span className="text-[9px] text-border">|</span>
            <span className="text-[9px] text-primary font-medium">{MAP_STYLES[mapStyle].name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
