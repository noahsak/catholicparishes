import React, { useEffect, useMemo, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";

import { Helmet } from "react-helmet-async";


// ⚠️ MARKER CLUSTERING IMPORTS
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { iconPaths } from "../liturgicalColors";
import { useLiturgicalAccentKey } from "../hooks/useLiturgicalAccentKey";
import RunningJesus from "../components/runningJesus"; 

// --- API Key from Environment Variables ---
const key = process.env.REACT_APP_STADIA_API_KEY;

// --- Storage Keys for Persistence ---
const FILTER_TYPE_KEY = "filterType";
const FILTER_DAY_KEY = "filterDay";
const CLUSTERING_TOGGLE_KEY = "clusteringEnabled"; 
const DARK_MODE_OVERRIDE_KEY = "isDarkModeOverride"; 

// --- Theme Helper Functions ---

// 🆕 Helper to get the user's operating system dark mode preference
const getSystemPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    // Default to false (Light) if media query check is unavailable (e.g., during server-side rendering)
    return false;
};

// 🔄 Updated function: Gets the initial boolean state for the theme.
// Priority: 1. Manual Override (Session Storage) -> 2. System Preference
const getInitialDarkModeOverride = () => {
    const saved = sessionStorage.getItem(DARK_MODE_OVERRIDE_KEY);
    
    if (saved !== null) {
        // 1. Manual Override exists, use it.
        return saved === 'true'; 
    }
    
    // 2. No Manual Override, use System Preference as the default.
    return getSystemPreference();
};


// --- Helper to handle overnight adoration (No change) ---
const matchesDay = (times, day) => {
  if (!times?.length) return false;

  day = day.toLowerCase();
  const daysOfWeek = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  return times.some(t => {
    const lower = t.toLowerCase();
    if (lower.includes(day)) return true;

    // Handle overnight
    if (lower.includes("overnight")) {
      const startDayMatch = /(\w+)\s+\d{1,2}:\d{2}/.exec(lower);
      if (startDayMatch) {
        const startDay = startDayMatch[1].toLowerCase();
        const startIdx = daysOfWeek.indexOf(startDay);
        const nextIdx = (startIdx + 1) % 7;
        if (daysOfWeek[nextIdx] === day) return true;
      }
    }
    return false;
  });
};

function getPopupText(lightMode, liturgicalColorKey) {
  // If the background is WHITE or ROSE, the text must be BLACK for contrast.
  if (liturgicalColorKey === "WHITE" || liturgicalColorKey === "ROSE") {
    return "#000000"; 
  }
  // Otherwise, use white text for contrast against the colored background.
  return "#ffffff"; 
}

// 💥 Floating Title/Logo Component (Top Left) (No change)
const FloatingTitle = ({ prefersDark, colorKey, triggerEasterEgg }) => {
  const textColor = prefersDark ? "text-white" : "text-gray-800";
  return (
    <div className="fixed top-0 left-0 z-[1010] p-4 flex items-center gap-2">
      <button 
        onClick={triggerEasterEgg} 
        className="p-0 border-none bg-transparent cursor-pointer hover:opacity-80 transition focus:outline-none"
      >
        <img
          src={iconPaths[colorKey]?.[prefersDark ? "dark" : "light"]}
          alt="Church icon"
          className="w-8 h-8 -translate-y-1"
        />
      </button>
      <h1 className={`text-xl font-extrabold tracking-tight ${textColor}`}>
        Catholic Parishes
      </h1>
    </div>
  );
};

// 🆕 REWRITTEN Floating Theme Toggle with smooth animation
const FloatingThemeToggle = ({ isDarkModeOverride, setIsDarkModeOverride }) => {
  
  // The toggle container style. w-28 h-10 is the track size.
  const baseToggleContainerStyle = "relative w-28 h-8 rounded-full font-medium shadow-xl backdrop-blur-sm transition flex items-center justify-between cursor-pointer p-[2px]";

  // The 'Track' style (changes color based on mode)
  const trackColor = isDarkModeOverride ? "bg-white/25" : "bg-white/70"; 

  // The 'Thumb' (moving circle) styles
  // The calc() moves the thumb from the left edge to the right edge (minus padding)
  const thumbPosition = isDarkModeOverride ? "translate-x-[calc(92%)]" : "translate-x-0"; 
  const thumbColor = isDarkModeOverride ? "bg-white" : "bg-gray-900"; 
  const labelTextColor = isDarkModeOverride ? 'text-white' : 'text-gray-900';

  return (
    // Position: bottom-16 (now above the Clustering Toggle)
    <div className="fixed bottom-16 left-3 z-[1010]">  
      <div 
        onClick={() => setIsDarkModeOverride(prev => !prev)}
        className={`${baseToggleContainerStyle} ${trackColor}`}
        title={`Click to switch to ${isDarkModeOverride ? 'Light Mode' : 'Dark Mode'}`}
      >
        
        {/* The Toggle Thumb (the moving element) */}
        <div className={`
            absolute h-6 w-1/2 rounded-full shadow-md transform transition-transform duration-300 ease-in-out z-10
            ${thumbPosition} 
            ${thumbColor}
        `}>
        </div>

        {/* Labels (static, but text opacity changes) */}
        <span className={`w-1/2 text-center text-sm font-bold transition-opacity duration-300 z-20 ${labelTextColor} ${isDarkModeOverride ? 'opacity-50' : 'opacity-100'}`}>
            Light
        </span>
        <span className={`w-1/2 text-center text-sm font-bold transition-opacity duration-300 z-20 ${labelTextColor} ${isDarkModeOverride ? 'opacity-100' : 'opacity-50'}`}>
            Dark
        </span>

      </div>
    </div>
  );
};

// 💥 UPDATED POSITIONING: Floating Cluster Toggle (Now at bottom-3, below theme toggle)
const FloatingClusterToggle = ({ isClusteringEnabled, toggleClustering, prefersDark }) => {
  
  const backgroundStyle = prefersDark 
    ? "bg-white/25 text-white hover:bg-white/40" 
    : "bg-white/70 text-gray-900 hover:bg-white/90";
  
  const baseStyle = "px-4 py-2 rounded-lg font-medium shadow-xl backdrop-blur-sm transition";
  
  const indicatorColor = isClusteringEnabled ? 'bg-green-500' : 'bg-red-500';

  return (
    // 💥 UPDATED POSITION: bottom-3 (now below the Theme Toggle)
    <div className="fixed bottom-3 left-3 z-[1010]">
      <button
        onClick={toggleClustering}
        className={`${baseStyle} ${backgroundStyle}`} 
      >
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${indicatorColor}`}></span>
        {isClusteringEnabled ? "Clustering: ON" : "Clustering: OFF"}
      </button>
    </div>
  );
};

// --- Navbar (Filters and Links) (Top Right) (No change) ---
const TransparentNavbar = ({
  prefersDark,
  filterType,
  setFilterType,
  filterDay,
  setFilterDay,
  showFilter,
  setShowFilter,
  clearFilters,
}) => {
  return (
    <nav className="fixed top-0 right-0 z-[1010] p-3"> 
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex space-x-4">
          <Link
            to="/about"
            className={`px-5 py-2 rounded-md font-medium no-underline ${
              prefersDark ? "bg-white/25 text-white" : "bg-white/70 text-gray-900"
            } `}
          >
            ABOUT
          </Link>
        </div>
        <div className="hidden md:flex space-x-4">
          <Link
            to="/search"
            className={`px-5 py-2 rounded-md font-medium no-underline ${
              prefersDark ? "bg-white/25 text-white" : "bg-white/70 text-gray-900"
            } `}
          >
            SEARCH
          </Link>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter((s) => !s)}
            className={`px-5 py-2 rounded-md font-medium ${
              prefersDark ? "bg-white/25 text-white" : "bg-white/70 text-gray-900"
            } hover:opacity-50 transition`}
          >
            FILTERS
          </button>
          {showFilter && (
            <div
              className={`absolute right-0 mt-2 w-64 p-3 rounded-lg shadow-lg backdrop-blur-sm ${
                prefersDark ? "bg-gray-900/70 text-white" : "bg-white/40 text-gray-900"
              }`}
            >
              <div className="mb-2 text-sm font-semibold">Event type</div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full mb-3 p-2 rounded border border-accent bg-transparent text-gray-900 dark:text-white"
              >
                <option value="any">Any</option>
                <option value="mass">Mass</option>
                <option value="confession">Confession</option>
                <option value="adoration">Adoration</option>
              </select>

              <div className="mb-2 text-sm font-semibold">Day</div>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="w-full mb-3 p-2 rounded border border-accent bg-transparent text-gray-900 dark:text-white"
              >
                <option value="any">Any</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                {filterType === "mass" && <option value="saturday-vigil">Saturday Vigil</option>}
                <option value="sunday">Sunday</option>
              </select>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    clearFilters();
                  }}
                  className="px-3 py-1 rounded-md text-sm border border-accent hover:bg-accent hover:text-white transition"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="px-3 py-1 rounded-md text-sm bg-accent text-white hover:opacity-80 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Map helpers (No changes) ---
const SetView = ({ coords, zoom }) => {
  const map = useMap();
  if (coords) map.setView(coords, zoom);
  return null;
};

const SaveMapView = () => {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      sessionStorage.setItem("mapCenter", JSON.stringify([center.lat, center.lng]));
      sessionStorage.setItem("mapZoom", zoom);
    },
    zoomend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      sessionStorage.setItem("mapCenter", JSON.stringify([center.lat, center.lng]));
      sessionStorage.setItem("mapZoom", zoom);
    }
  });
  return null;
};

// --- Component to render the individual markers (No changes) ---
const ParishMarkers = ({ parishes, churchIcon, popupTextColor }) => (
    <>
      {parishes.map((parish, idx) => (
        <Marker key={idx} position={[parish.lat, parish.long]} icon={churchIcon}>
          <Popup
            className="custom-accent-popup"
            style={{
              "--popup-text": popupTextColor,
              color: popupTextColor 
            }}
          >
            <div style={{ color: popupTextColor }}>
              <Link
                to={`/parish/${encodeURIComponent(parish.parishSlug || parish.parishName)}`}
                style={{ color: popupTextColor }} 
                className="font-bold text-lg hover:underline block" 
              >
                {parish.parishName}
              </Link>
              <div className="text-[10px]" style={{ color: popupTextColor }}>
                ↑↑↑ Click parish name for more details ↑↑↑
              </div>
              <div style={{ color: popupTextColor }}>{parish.parishAddress}</div>
              {parish._sunday?.length > 0 && (
                <div style={{ color: popupTextColor }}>
                  <strong>Sunday Mass:</strong> {parish._sunday.join(", ")}
                </div>
              )}
              {parish._daily?.length > 0 && (
                <div style={{ color: popupTextColor }}>
                  <strong>Daily Mass:</strong> {parish._daily.join(", ")}
                </div>
              )}
              {parish._confession?.length > 0 && (
                <div style={{ color: popupTextColor }}>
                  <strong>Confession:</strong> {parish._confession.join(", ")}
                </div>
              )}
              {parish._adoration?.length > 0 && (
                <div style={{ color: popupTextColor }}>
                  <strong>Adoration:</strong> {parish._adoration.join(", ")}
                </div>
              )}
              {parish.website && (
                <div className="mt-1">
                  <a
                    href={parish.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: popupTextColor }} 
                    className="hover:underline text-sm"
                  >
                    Visit website
                  </a>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
);


// --- Main Map Component ---
const Map = () => {
  const [parishes, setParishes] = useState([]);
  
  // THEME STATE: Simple boolean override (true = dark mode is forced on)
  const [isDarkModeOverride, setIsDarkModeOverride] = useState(getInitialDarkModeOverride);
  
  // 1. Calculate the final 'prefersDark' value (directly from the override state)
  const prefersDark = isDarkModeOverride;
  
  // 💾 1. INITIALIZE FILTER STATE (No change)
  const [filterType, setFilterType] = useState(
    sessionStorage.getItem(FILTER_TYPE_KEY) || "any"
  );
  const [filterDay, setFilterDay] = useState(
    sessionStorage.getItem(FILTER_DAY_KEY) || "any"
  );
  const [showFilter, setShowFilter] = useState(false);
  
  // Clustering state (No change)
  const [isClusteringEnabled, setIsClusteringEnabled] = useState(() => {
    const saved = sessionStorage.getItem(CLUSTERING_TOGGLE_KEY);
    return saved !== null ? saved === 'true' : true; 
  });

  const [userLocation, setUserLocation] = useState(null);
  const [locationAccurate, setLocationAccurate] = useState(false);
  const [activeEggs, setActiveEggs] = useState([]); 

  const colorKey = useLiturgicalAccentKey();

  // Apply liturgical-white class (No change)
  useEffect(() => {
    if (colorKey === "WHITE") {
      document.body.classList.add("liturgical-white");
    } else {
      document.body.classList.remove("liturgical-white");
    }
  }, [colorKey]);

  // Apply dark class to body based on final prefersDark
  useEffect(() => {
      if (prefersDark) {
          document.body.classList.add("dark");
      } else {
          document.body.classList.remove("dark");
      }
  }, [prefersDark]);
  
  // Persist Dark Mode Override state
  useEffect(() => {
    sessionStorage.setItem(DARK_MODE_OVERRIDE_KEY, isDarkModeOverride.toString());
  }, [isDarkModeOverride]);


  // 💾 3. PERSIST FILTER/CLUSTERING STATE (No change)
  useEffect(() => {
    sessionStorage.setItem(FILTER_TYPE_KEY, filterType);
    sessionStorage.setItem(FILTER_DAY_KEY, filterDay);
  }, [filterType, filterDay]);
  
  useEffect(() => {
    sessionStorage.setItem(CLUSTERING_TOGGLE_KEY, isClusteringEnabled.toString());
  }, [isClusteringEnabled]);


  // Load parishes (No change)
  useEffect(() => {
    fetch("/data/parishes.json")
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const normalize = raw => {
          if (!raw) return [];
          if (Array.isArray(raw)) return raw.map(s => s.trim()).filter(Boolean);
          return String(raw).replace(/\\/g, "").split(/;|\r?\n/).map(s => s.trim()).filter(Boolean);
        };
        const normalizeAll = p => ({
          ...p,
          _sunday: normalize(p.sundayMassTimes || p.sunday_mass_times),
          _daily: normalize(p.dailyMassTimes || p.weekdayMassTimes),
          _confession: normalize(p.confessionTimes),
          _adoration: normalize(p.adorationTimes),
        });
        setParishes(list.map(normalizeAll));
      })
      .catch(() => setParishes([]));
  }, []);

  // Geolocation (No change)
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(null);
      setLocationAccurate(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationAccurate(true);
      },
      () => {
        setUserLocation(null);
        setLocationAccurate(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

// Easter Egg Trigger/Cleanup (No change)
const triggerEasterEgg = useCallback(() => {
    const newId = Date.now() + Math.random(); 
    setActiveEggs(prev => [...prev, newId]);
}, []);

const handleAnimationEnd = useCallback((idToRemove) => {
    setActiveEggs(prev => prev.filter(id => id !== idToRemove));
}, []);


  // Map centering (No change)
  const savedCenter = sessionStorage.getItem("mapCenter");
  const savedZoom = sessionStorage.getItem("mapZoom");
  const hasSavedView = savedCenter && savedZoom;

  const initialCenter = hasSavedView
    ? JSON.parse(savedCenter)
    : (userLocation || [42.725812, -81.959127]);

  const initialZoom = hasSavedView
    ? parseInt(savedZoom)
    : (userLocation ? 14 : 8);

  const tileUrl = prefersDark
    ? `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${key}`
    : `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${key}`;    

  const churchIcon = useMemo(() => new L.Icon({
    iconUrl: iconPaths[colorKey]?.[prefersDark ? "dark" : "light"],
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  }), [colorKey, prefersDark]);

  const userIcon = useMemo(() => L.divIcon({
    className: "user-location-dot",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }), []);

// Filtered Parishes (No change)
const filteredParishes = parishes.filter((parish) => {
  const day = filterDay.toLowerCase();
  // ... filtering logic remains the same ...
  let typeMatch = true;
  if (filterType === "mass") typeMatch = (parish._sunday?.length > 0) || (parish._daily?.length > 0);
  else if (filterType === "confession") typeMatch = parish._confession?.length > 0;
  else if (filterType === "adoration") typeMatch = parish._adoration?.length > 0;

  let dayMatch = true;
  if (filterDay !== "any") {
    const hasSunday = parish._sunday?.some(time => time.toLowerCase().includes(day));
    const hasDaily = parish._daily?.some(time => time.toLowerCase().includes(day));

    if (filterType === "mass") {
      if (day === "saturday-vigil") {
        dayMatch = parish._sunday?.some(t => t.toLowerCase().includes("saturday"));
      } else if (day === "sunday") {
        dayMatch = hasSunday;
      } else {
        dayMatch = hasDaily;
      }
    } else if (filterType === "confession") {
      dayMatch = parish._confession?.some(time => time.toLowerCase().includes(day));
    } else if (filterType === "adoration") {
      dayMatch = matchesDay(parish._adoration, day);
    } else {
      dayMatch = hasSunday || hasDaily ||
                 parish._confession?.some(t => t.toLowerCase().includes(day)) ||
                 matchesDay(parish._adoration, day);
    }
  }

  return typeMatch && dayMatch;
});

// for popup text color and the contrast fix
const lightMode = !prefersDark;
const popupTextColor = getPopupText(lightMode, colorKey); // Calculate color once

// Toggle function
const toggleClustering = () => {
    setIsClusteringEnabled(prev => !prev);
};

  return (
    <div className="relative h-screen w-full font-sans antialiased">

    <Helmet>
      <title>Catholic Parishes – Find Catholic Churches Across Ontario</title>
      <meta
        name="description"
        content="Explore Catholic parishs in Canada. Find Mass times, confession times, adoration schedules, addresses, and parish contact information."
      />
      <link rel="canonical" href="https://catholicparishes.org/" />

      {/* Social share cards */}
      <meta property="og:title" content="Catholic Parishes – Canada" />
      <meta
        property="og:description"
        content="Search and explore Catholic parishes across Canada with Mass times and parish details."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://catholicparishes.org/" />
    </Helmet>

    <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Catholic Parishes",
      url: "https://catholicparishes.org",
      logo: "https://catholicparishes.org/icons/church_icon_blue_light.png"
    })}
    </script>


      {/* 🏃 EASTER EGG OVERLAY */}
      {activeEggs.map(id => (
        <RunningJesus 
            key={id} 
            onAnimationEnd={() => handleAnimationEnd(id)} 
        />
      ))}
      
      {/* 1. Floating Title (Top Left) */}
      <FloatingTitle 
        prefersDark={prefersDark} 
        colorKey={colorKey} 
        triggerEasterEgg={triggerEasterEgg} 
      />

      {/* 2. Floating Buttons/Filters (Top Right) */}
      <TransparentNavbar
        prefersDark={prefersDark}
        filterType={filterType}
        setFilterType={setFilterType}
        filterDay={filterDay}
        setFilterDay={setFilterDay}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        clearFilters={() => { 
          setFilterType("any"); 
          setFilterDay("any"); 
          setShowFilter(false); 
          sessionStorage.removeItem(FILTER_TYPE_KEY);
          sessionStorage.removeItem(FILTER_DAY_KEY);
        }}
      />
      
      {/* 3. Floating Theme Toggle (Bottom Left - Position: bottom-16, now above clustering) */}
      <FloatingThemeToggle
          isDarkModeOverride={isDarkModeOverride}
          setIsDarkModeOverride={setIsDarkModeOverride}
          prefersDark={prefersDark} 
      />
      
      {/* 4. Floating Cluster Toggle (Bottom Left - Position: bottom-3, now below theme toggle) */}
      <FloatingClusterToggle
          prefersDark={prefersDark}
          isClusteringEnabled={isClusteringEnabled}
          toggleClustering={toggleClustering}
      />


      <div className="h-screen w-full">
        <MapContainer center={initialCenter} zoom={initialZoom} className="h-full w-full">
          <TileLayer url={tileUrl} 
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          />

          <SaveMapView />
          {!hasSavedView && userLocation && <SetView coords={userLocation} zoom={14} />}

          {locationAccurate && userLocation && (
            <Marker position={userLocation} icon={userIcon}></Marker>
          )}

          {/* Conditional Marker Rendering: Clustered OR Individual */}
          {isClusteringEnabled ? (
            <MarkerClusterGroup 
              chunkedLoading
              disableClusteringAtZoom={12}
              maxClusterRadius={50} 
            >
              <ParishMarkers 
                  parishes={filteredParishes} 
                  churchIcon={churchIcon} 
                  popupTextColor={popupTextColor} 
              />
            </MarkerClusterGroup>
          ) : (
            <ParishMarkers 
                parishes={filteredParishes} 
                churchIcon={churchIcon} 
                popupTextColor={popupTextColor} 
            />
          )}

        </MapContainer>
      </div>
    </div>
  );
};

export default Map;