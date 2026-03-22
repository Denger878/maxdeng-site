import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const travelData = [
  { id: "london",      name: "London, UK",              coords: [-0.1278,   51.5074], caption: "Caught a Man United away game" },
  { id: "manchester",  name: "Manchester, UK",           coords: [-2.2426,   53.4808], caption: "Old Trafford" },
  { id: "paris",       name: "Paris, France",            coords: [2.3522,    48.8566], caption: "City of lights" },
  { id: "chamonix",    name: "Chamonix, France",         coords: [6.8696,    45.9237], caption: "Alps at their finest" },
  { id: "barcelona",   name: "Barcelona, Spain",         coords: [2.1734,    41.3851], caption: "Camp Nou and Gaudi" },
  { id: "tokyo",       name: "Tokyo, Japan",             coords: [139.6503,  35.6762], caption: "Lost in the neon and ramen" },
  { id: "beijing",     name: "Beijing, China",           coords: [116.4074,  39.9042], caption: "The Great Wall" },
  { id: "toronto",     name: "Toronto, Ontario",         coords: [-79.3832,  43.6532], caption: "Home base" },
  { id: "victoria",    name: "Victoria, BC",             coords: [-123.3656, 48.4284], caption: "West coast" },
  { id: "quebec",      name: "Quebec City, QC",          coords: [-71.2080,  46.8139], caption: "Belle province" },
  { id: "edmonton",    name: "Edmonton, Alberta",        coords: [-113.4909, 53.5461], caption: "Big skies" },
  { id: "albany",      name: "Albany, New York",         coords: [-73.7562,  42.6526], caption: "Empire State" },
  { id: "sacramento",  name: "Sacramento, California",   coords: [-121.4944, 38.5816], caption: "Golden State" },
  { id: "saltlake",    name: "Salt Lake City, Utah",     coords: [-111.8910, 40.7608], caption: "Red rock country" },
  { id: "carsoncity",  name: "Carson City, Nevada",      coords: [-119.7674, 39.1638], caption: "Silver State" },
  { id: "lansing",     name: "Lansing, Michigan",        coords: [-84.5555,  42.7325], caption: "Great Lakes" },
  { id: "nashville",   name: "Nashville, Tennessee",     coords: [-86.7816,  36.1627], caption: "Music City" },
  { id: "jefferson",   name: "Jefferson City, Missouri", coords: [-92.1735,  38.5767], caption: "Show-Me State" },
  { id: "tallahassee", name: "Tallahassee, Florida",     coords: [-84.2807,  30.4518], caption: "Sunshine State" },
  { id: "montpelier",  name: "Montpelier, Vermont",      coords: [-72.5778,  44.2601], caption: "Green Mountains" },
  { id: "columbus",    name: "Columbus, Ohio",           coords: [-82.9988,  39.9612], caption: "Buckeye State" },
  { id: "springfield", name: "Springfield, Illinois",    coords: [-89.6501,  39.7817], caption: "Land of Lincoln" },
];

const pokeCards = [
  { id: "darkrai", name: "Darkrai #BW73", set: "BW Promo",       img: "https://images.pokemontcg.io/bwp/BW73.png" },
  { id: "drampa",  name: "Drampa #184",   set: "Temporal Forces", img: "https://images.pokemontcg.io/sv5/184.png"  },
  { id: "regice",  name: "Regice * #90",  set: "Legend Maker",    img: "https://images.pokemontcg.io/ex12/90.png"  },
];

function createPinImage(size = 52) {
  const canvas = document.createElement("canvas");
  canvas.width  = size;
  canvas.height = Math.round(size * 1.4);
  const ctx = canvas.getContext("2d");
  const cx  = size / 2;
  const r   = size * 0.42;
  const tipY = canvas.height - 2;

  ctx.shadowColor   = "rgba(0,0,0,0.32)";
  ctx.shadowBlur    = 7;
  ctx.shadowOffsetY = 3;

  ctx.beginPath();
  ctx.arc(cx, r + 2, r, Math.PI, 0);
  ctx.bezierCurveTo(cx + r, r * 1.6, cx + 4, tipY - 6, cx, tipY);
  ctx.bezierCurveTo(cx - 4, tipY - 6, cx - r, r * 1.6, cx - r, r + 2);
  ctx.closePath();
  ctx.fillStyle = "#DA291C";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.beginPath();
  ctx.arc(cx, r + 2, r * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.93)";
  ctx.fill();

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function addPinsAndStyle(m, travelData, setActiveLoc, setPhotoIdx) {
  // ── Google Maps-inspired color palette ──
  // Land: soft sage green
  const landLayers = [
    "land", "land-structure", "landcover", "national-park",
    "landuse", "landuse-residential",
  ];
  landLayers.forEach(id => {
    if (m.getLayer(id)) {
      try { m.setPaintProperty(id, "fill-color", "#e8f0e0"); } catch {}
      try { m.setPaintProperty(id, "background-color", "#e8f0e0"); } catch {}
    }
  });

  // Background (ocean base)
  if (m.getLayer("background")) {
    m.setPaintProperty("background", "background-color", "#aacbdf");
  }

  // Water — Google's characteristic blue
  ["water", "water-shadow"].forEach(id => {
    if (m.getLayer(id)) m.setPaintProperty(id, "fill-color", "#9fc4d8");
  });

  // Waterways
  if (m.getLayer("waterway")) {
    m.setPaintProperty("waterway", "line-color", "#9fc4d8");
  }

  // Country fills — slightly lighter green so borders read clearly
  ["admin-0-boundary-bg"].forEach(id => {
    if (m.getLayer(id)) m.setPaintProperty(id, "line-color", "#b8d4b0");
  });
  if (m.getLayer("admin-0-boundary")) {
    m.setPaintProperty("admin-0-boundary", "line-color", "#8aab82");
    m.setPaintProperty("admin-0-boundary", "line-width", [
      "interpolate", ["linear"], ["zoom"], 1, 0.6, 6, 1.4,
    ]);
  }

  // State/province borders — dashed, subtle
  if (m.getLayer("admin-1-boundary")) {
    m.setPaintProperty("admin-1-boundary", "line-color", "#a8c4a0");
    m.setPaintProperty("admin-1-boundary", "line-dasharray", [2, 2]);
  }

  // Roads — hide almost everything, keep only major highways faintly
  const hideRoads = [
    "road-street", "road-minor", "road-path", "road-pedestrian",
    "road-secondary-tertiary", "road-label", "road-number-shield",
    "tunnel-motorway-trunk", "tunnel-primary", "tunnel-secondary-tertiary",
    "bridge-motorway-trunk", "bridge-primary", "bridge-secondary-tertiary",
    "ferry", "aeroway-polygon", "aeroway-line",
    "building", "building-outline",
    "poi-label", "transit-label",
    "pitch-outline", "golf-hole-line",
  ];
  hideRoads.forEach(id => {
    if (m.getLayer(id)) m.setLayoutProperty(id, "visibility", "none");
  });

  // Keep motorways/primary roads but make them very faint — adds geography context
  ["road-motorway-trunk", "road-primary"].forEach(id => {
    if (m.getLayer(id)) {
      m.setPaintProperty(id, "line-color", "#d4c8b8");
      m.setPaintProperty(id, "line-opacity", 0.4);
    }
  });

  // Country labels — always visible, Google-style dark grey
  if (m.getLayer("country-label")) {
    m.setLayoutProperty("country-label", "visibility", "visible");
    m.setPaintProperty("country-label", "text-color", "#3d4a3a");
    m.setPaintProperty("country-label", "text-halo-color", "#e8f0e0");
    m.setPaintProperty("country-label", "text-halo-width", 1.5);
  }

  // City labels — fade in at zoom 3.5
  ["settlement-major-label", "settlement-minor-label"].forEach(id => {
    if (m.getLayer(id)) {
      m.setLayoutProperty(id, "visibility", "visible");
      m.setPaintProperty(id, "text-opacity", [
        "interpolate", ["linear"], ["zoom"], 3.2, 0, 4.0, 1,
      ]);
      m.setPaintProperty(id, "text-color", "#3a4a38");
      m.setPaintProperty(id, "text-halo-color", "#e8f0e0");
      m.setPaintProperty(id, "text-halo-width", 1.2);
    }
  });

  // ── Drop pins as a symbol layer ──
  if (!m.getImage("travel-pin")) {
    m.addImage("travel-pin", createPinImage(52), { pixelRatio: 2 });
  }

  if (!m.getSource("pins")) {
    m.addSource("pins", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: travelData.map(loc => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: loc.coords },
          properties: { id: loc.id },
        })),
      },
    });
  }

  if (!m.getLayer("pins-layer")) {
    m.addLayer({
      id: "pins-layer",
      type: "symbol",
      source: "pins",
      layout: {
        "icon-image": "travel-pin",
        "icon-size": ["interpolate", ["linear"], ["zoom"], 1, 0.40, 5, 0.55, 10, 0.72],
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });
  }

  m.on("click", "pins-layer", (e) => {
    const loc = travelData.find(l => l.id === e.features[0].properties.id);
    if (loc) { setActiveLoc.current(loc); setPhotoIdx.current(0); }
  });
  m.on("mouseenter", "pins-layer", () => { m.getCanvas().style.cursor = "pointer"; });
  m.on("mouseleave", "pins-layer", () => { m.getCanvas().style.cursor = ""; });
}

export default function App() {
  const mapContainer = useRef(null);
  const map          = useRef(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [photoIndex,     setPhotoIndex]     = useState(0);
  const setActiveLoc = useRef(setActiveLocation);
  const setPhotoIdx  = useRef(setPhotoIndex);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [15, 25],
      zoom: 1.6,
      minZoom: 1,
      maxZoom: 14,
      projection: "mercator",
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    // Use 'load' (not 'style.load') — fires once everything is ready
    map.current.on("load", () => {
      addPinsAndStyle(map.current, travelData, setActiveLoc, setPhotoIdx);
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  const closePopup = () => setActiveLocation(null);

  return (
    <div className="site-wrapper">
      <aside className="about-panel">
        <div className="about-inner">
          <h1 className="name">Max Deng | 邓东垚</h1>
          <div className="divider" />

          <ul className="info-list">
            <li>
              <span className="bullet">—</span>
              <span>
                mathematics/cpa @{" "}
                <a href="https://uwaterloo.ca/future-students/programs/mathematics-accounting" target="_blank" rel="noreferrer" className="link link-uwaterloo">
                  <img src="https://uwaterloo.ca/favicon.ico" alt="" className="site-favicon" onError={e => e.target.style.display = "none"} />
                  UWaterloo
                </a>
              </span>
            </li>
            <li>
              <span className="bullet">—</span>
              <span>
                incoming financial analyst @{" "}
                <a href="https://www.rbcx.com/" target="_blank" rel="noreferrer" className="link link-rbc">
                  <img src="https://www.rbc.com/favicon.ico" alt="" className="site-favicon" onError={e => e.target.style.display = "none"} />
                  RBCx
                </a>
              </span>
            </li>

            <li className="section-header-item">
              <span className="section-label">other</span>
            </li>

            <li>
              <span className="bullet">↳</span>
              <span>pokemon card collector — some favorites:</span>
            </li>

            <li className="card-row-item">
              <div className="card-row">
                {pokeCards.map(card => (
                  <div className="poke-card" key={card.id}>
                    <img src={card.img} alt={card.name} className="poke-card-img"
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                    <div className="poke-card-fallback" style={{ display: "none" }}>
                      <span>card</span><p>{card.name}</p>
                    </div>
                    <div className="poke-card-info">
                      <p className="poke-card-label">{card.name}</p>
                      <p className="poke-card-set">{card.set}</p>
                    </div>
                  </div>
                ))}
              </div>
            </li>

            <li>
              <span className="bullet">↳</span>
              <span>places i've been (click the pins) <span className="map-arrow">→</span></span>
            </li>
          </ul>

          <div className="socials">
            <a href="https://www.linkedin.com/in/max-deng-9683b7309/" target="_blank" rel="noreferrer" className="social-link" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://github.com/Denger878" target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://www.instagram.com/maxdeng07/" target="_blank" rel="noreferrer" className="social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="mailto:m36deng@uwaterloo.ca" className="social-link" aria-label="Email">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
            </a>
          </div>
        </div>
      </aside>

      <main className="map-panel">
        <div className="map-box">
          <div ref={mapContainer} className={`mapbox-container ${activeLocation ? "map-blurred" : ""}`} />

          {activeLocation && (
            <div className="map-popup-overlay" onClick={closePopup}>
              <div className="popup-card" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={closePopup}>✕</button>
                <div className="popup-header">
                  <div className="popup-location">— {activeLocation.name}</div>
                </div>
                <div className="photo-area">
                  {activeLocation.photos.length > 0 ? (
                    <>
                      <img src={activeLocation.photos[photoIndex]} alt={activeLocation.name} className="popup-photo" />
                      {activeLocation.photos.length > 1 && (
                        <div className="carousel-controls">
                          <button onClick={() => setPhotoIndex(i => Math.max(0, i - 1))} disabled={photoIndex === 0}>‹</button>
                          <span>{photoIndex + 1} / {activeLocation.photos.length}</span>
                          <button onClick={() => setPhotoIndex(i => Math.min(activeLocation.photos.length - 1, i + 1))} disabled={photoIndex === activeLocation.photos.length - 1}>›</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="photo-placeholder">
                      <span>📷</span>
                      <p>photos coming soon</p>
                    </div>
                  )}
                </div>
                <div className="popup-caption">{activeLocation.caption}</div>
                {activeLocation.photos.length > 1 && (
                  <div className="dot-row">
                    {activeLocation.photos.map((_, i) => (
                      <button key={i} className={`dot ${i === photoIndex ? "active" : ""}`} onClick={() => setPhotoIndex(i)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}