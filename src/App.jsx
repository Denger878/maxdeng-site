import { useState, useEffect, useRef, useCallback, memo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const travelData = [
  { id: "london",      name: "London, UK",              coords: [51.5074,  -0.1278],   caption: "Caught a Man United away game", photos: [] },
  { id: "manchester",  name: "Manchester, UK",           coords: [53.4808,  -2.2426],   caption: "Old Trafford", photos: [] },
  { id: "paris",       name: "Paris, France",            coords: [48.8566,   2.3522],   caption: "City of lights", photos: [] },
  { id: "chamonix",    name: "Chamonix, France",         coords: [45.9237,   6.8696],   caption: "Alps at their finest", photos: [] },
  { id: "barcelona",   name: "Barcelona, Spain",         coords: [41.3851,   2.1734],   caption: "Camp Nou and Gaudi", photos: [] },
  { id: "tokyo",       name: "Tokyo, Japan",             coords: [35.6762, 139.6503],   caption: "Lost in the neon and ramen", photos: [] },
  { id: "beijing",     name: "Beijing, China",           coords: [39.9042, 116.4074],   caption: "The Great Wall", photos: [] },
  { id: "toronto",     name: "Toronto, Ontario",         coords: [43.6532, -79.3832],   caption: "Home base", photos: [] },
  { id: "victoria",    name: "Victoria, BC",             coords: [48.4284,-123.3656],   caption: "West coast", photos: [] },
  { id: "quebec",      name: "Quebec City, QC",          coords: [46.8139, -71.2080],   caption: "Belle province", photos: [] },
  { id: "edmonton",    name: "Edmonton, Alberta",        coords: [53.5461,-113.4909],   caption: "Big skies", photos: [] },
  { id: "albany",      name: "Albany, New York",         coords: [42.6526, -73.7562],   caption: "Empire State", photos: [] },
  { id: "sacramento",  name: "Sacramento, California",   coords: [38.5816,-121.4944],   caption: "Golden State", photos: [] },
  { id: "saltlake",    name: "Salt Lake City, Utah",     coords: [40.7608,-111.8910],   caption: "Red rock country", photos: [] },
  { id: "carsoncity",  name: "Carson City, Nevada",      coords: [39.1638,-119.7674],   caption: "Silver State", photos: [] },
  { id: "lansing",     name: "Lansing, Michigan",        coords: [42.7325, -84.5555],   caption: "Great Lakes", photos: [] },
  { id: "nashville",   name: "Nashville, Tennessee",     coords: [36.1627, -86.7816],   caption: "Music City", photos: [] },
  { id: "jefferson",   name: "Jefferson City, Missouri", coords: [38.5767, -92.1735],   caption: "Show-Me State", photos: [] },
  { id: "tallahassee", name: "Tallahassee, Florida",     coords: [30.4518, -84.2807],   caption: "Sunshine State", photos: [] },
  { id: "montpelier",  name: "Montpelier, Vermont",      coords: [44.2601, -72.5778],   caption: "Green Mountains", photos: [] },
  { id: "columbus",    name: "Columbus, Ohio",           coords: [39.9612, -82.9988],   caption: "Buckeye State", photos: [] },
  { id: "springfield", name: "Springfield, Illinois",    coords: [39.7817, -89.6501],   caption: "Land of Lincoln", photos: [] },
];

const pokeCards = [
  { id: "darkrai", name: "Darkrai #BW73", set: "BW Promo",       img: "https://images.pokemontcg.io/bwp/BW73.png" },
  { id: "drampa",  name: "Drampa #184",   set: "Temporal Forces", img: "https://images.pokemontcg.io/sv5/184.png"  },
  { id: "regice",  name: "Regice * #90",  set: "Legend Maker",    img: "https://images.pokemontcg.io/ex12/90.png"  },
];

/* SVG pin markup — same shape as before */
const PIN_SVG = `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="pin-shadow" x="-40%" y="-20%" width="180%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.38)"/>
    </filter>
  </defs>
  <path d="M14 0C6.27 0 0 6.27 0 14c0 9.8 14 24 14 24S28 23.8 28 14C28 6.27 21.73 0 14 0z"
    fill="#DA291C" filter="url(#pin-shadow)"/>
  <circle cx="14" cy="13" r="5.5" fill="white" opacity="0.93"/>
</svg>`;

function createPinElement() {
  const el = document.createElement("div");
  el.className = "map-pin-marker";
  el.innerHTML = PIN_SVG;
  el.style.width = "28px";
  el.style.height = "38px";
  el.style.cursor = "pointer";
  return el;
}

const MapCanvas = memo(function MapCanvas({ onPinClick }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const cbRef        = useRef(onPinClick);

  useEffect(() => { cbRef.current = onPinClick; });

  useEffect(() => {
    if (mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      /*
       * outdoors-v12 gives colorful terrain-based geography
       * (greens, browns, blues, snow on mountains) without being
       * too busy — we strip labels below.
       */
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [15, 25],
      zoom: 1.8,
      minZoom: 1.5,
      maxZoom: 12,
      renderWorldCopies: true,        // infinite horizontal scroll
      maxPitch: 0,                    // keep it flat
      dragRotate: false,              // no rotation
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    /* lock vertical so user can't scroll past poles */
    map.setMaxBounds(null); // no hard lng bounds — infinite wrap

    /* Add minimal nav (zoom only, no compass) */
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("style.load", () => {
      /* Remove ALL label / text / symbol layers for a clean look */
      const style = map.getStyle();
      if (style && style.layers) {
        style.layers.forEach((layer) => {
          if (
            layer.type === "symbol" ||
            (layer.layout && layer.layout["text-field"]) ||
            layer.id.includes("label") ||
            layer.id.includes("place") ||
            layer.id.includes("poi") ||
            layer.id.includes("road") ||
            layer.id.includes("transit") ||
            layer.id.includes("path") ||
            layer.id.includes("bridge") ||
            layer.id.includes("tunnel") ||
            layer.id.includes("aeroway") ||
            layer.id.includes("admin") ||
            layer.id.includes("building") ||
            layer.id.includes("structure")
          ) {
            map.removeLayer(layer.id);
          }
        });
      }
    });

    /* Add pin markers */
    travelData.forEach((loc) => {
      const el = createPinElement();
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        cbRef.current(loc);
      });

      new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([loc.coords[1], loc.coords[0]]) // mapbox uses [lng, lat]
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
});

export default function App() {
  const [activeLocation, setActiveLocation] = useState(null);
  const [photoIndex,     setPhotoIndex]     = useState(0);

  const handlePinClick = useCallback((loc) => {
    setActiveLocation(loc);
    setPhotoIndex(0);
  }, []);

  const closePopup = () => setActiveLocation(null);
  const photos = activeLocation?.photos ?? [];

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
            <li className="section-header-item"><span className="section-label">other</span></li>
            <li><span className="bullet">↳</span><span>some favorite pokemon cards:</span></li>
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
            <li><span className="bullet">↳</span><span>places i've been (click the pins) <span className="map-arrow">→</span></span></li>
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
          <MapCanvas onPinClick={handlePinClick} />
          {activeLocation && <div className="map-blur-overlay" />}
          {activeLocation && (
            <div className="map-popup-overlay" onClick={closePopup}>
              <div className="popup-card" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={closePopup}>✕</button>
                <div className="popup-header">
                  <div className="popup-location">{activeLocation.name}</div>
                </div>
                <div className="photo-area">
                  {photos.length > 0 ? (
                    <>
                      <img src={photos[photoIndex]} alt={activeLocation.name} className="popup-photo" />
                      {photos.length > 1 && (
                        <div className="carousel-controls">
                          <button onClick={() => setPhotoIndex(i => Math.max(0, i - 1))} disabled={photoIndex === 0}>‹</button>
                          <span>{photoIndex + 1} / {photos.length}</span>
                          <button onClick={() => setPhotoIndex(i => Math.min(photos.length - 1, i + 1))} disabled={photoIndex === photos.length - 1}>›</button>
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
                {photos.length > 1 && (
                  <div className="dot-row">
                    {photos.map((_, i) => (
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