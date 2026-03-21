import { useState } from "react";
import "./App.css";
 
const travelData = [
  {
    id: 1,
    name: "Tokyo, Japan",
    coords: [35.6762, 139.6503],
    caption: "Lost in the neon and ramen 🍜",
    photos: [],
  },
  {
    id: 2,
    name: "London, UK",
    coords: [51.5074, -0.1278],
    caption: "Caught a Man United away game 🔴",
    photos: [],
  },
  {
    id: 3,
    name: "Toronto, Canada",
    coords: [43.6511, -79.3470],
    caption: "Home base 🍁",
    photos: [],
  },
];
 
function worldToSVG(lat, lng, width, height) {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}
 
const SVG_W = 900;
const SVG_H = 500;
 
export default function App() {
  const [activeLocation, setActiveLocation] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
 
  const handleMarkerClick = (loc) => {
    setActiveLocation(loc);
    setPhotoIndex(0);
  };
 
  const closePopup = () => setActiveLocation(null);
 
  return (
    <div className="site-wrapper">
      {/* LEFT PANEL — About */}
      <aside className="about-panel">
        <div className="about-inner">
          <h1 className="name">Max Deng | 邓东垚</h1>
          <div className="divider" />
 
          <ul className="info-list">
            <li>
              <span className="bullet">—</span>
              <span>
                mathematics/cpa @{" "}
                <a
                  href="https://uwaterloo.ca/future-students/programs/mathematics-accounting"
                  target="_blank"
                  rel="noreferrer"
                  className="link"
                >
                  <img
                    src="https://uwaterloo.ca/favicon.ico"
                    alt=""
                    className="site-favicon"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  UWaterloo
                </a>
              </span>
            </li>
            <li>
              <span className="bullet">—</span>
              <span>
                incoming financial analyst @{" "}
                <a
                  href="https://www.rbcx.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="link"
                >
                  <img
                    src="https://www.rbc.com/favicon.ico"
                    alt=""
                    className="site-favicon"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  RBCx
                </a>
              </span>
            </li>
 
            <li className="section-header-item">
              <span className="section-label">other</span>
            </li>
 
            <li>
              <span className="bullet">↳</span>
              <span>pokémon enthusiast — ask me about my team 🎮</span>
            </li>
            <li>
              <span className="bullet">↳</span>
              <span>
                football lover, proud{" "}
                <span className="united">Manchester United</span> supporter ⚽
              </span>
            </li>
            <li>
              <span className="bullet">↳</span>
              <span>this map tracks everywhere I've been — click the pins!</span>
            </li>
          </ul>
 
          <div className="socials">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-link" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="mailto:max@example.com" className="social-link" aria-label="Email">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 7L2 7" />
              </svg>
            </a>
          </div>
        </div>
      </aside>
 
      {/* RIGHT PANEL — Map */}
      <main className="map-panel">
        <div className="map-box">
          {/* Blurred map background when popup is open */}
          <div className={`map-svg-wrapper ${activeLocation ? "map-blurred" : ""}`}>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="world-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <WorldMap />
              {travelData.map((loc) => {
                const { x, y } = worldToSVG(loc.coords[0], loc.coords[1], SVG_W, SVG_H);
                const isActive = activeLocation?.id === loc.id;
                return (
                  <g key={loc.id} onClick={() => handleMarkerClick(loc)} style={{ cursor: "pointer" }}>
                    <circle cx={x} cy={y} r={isActive ? 10 : 7} fill="#DA291C" opacity={isActive ? 1 : 0.85} className="marker-pulse" />
                    <circle cx={x} cy={y} r={isActive ? 14 : 11} fill="none" stroke="#DA291C" strokeWidth="1.5" opacity={isActive ? 0.5 : 0.3} />
                    <text x={x} y={y - 15} textAnchor="middle" fontSize="11" fill="#1a1a1a" fontFamily="'Crimson Text', serif" fontWeight="600" className="marker-label">
                      {loc.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
 
          {/* Popup — lives inside map-box, not full screen */}
          {activeLocation && (
            <div className="map-popup-overlay" onClick={closePopup}>
              <div className="popup-card" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={closePopup}>✕</button>
 
                <div className="popup-header">
                  <div className="popup-location">📍 {activeLocation.name}</div>
                </div>
 
                <div className="photo-area">
                  {activeLocation.photos.length > 0 ? (
                    <>
                      <img
                        src={activeLocation.photos[photoIndex]}
                        alt={activeLocation.name}
                        className="popup-photo"
                      />
                      {activeLocation.photos.length > 1 && (
                        <div className="carousel-controls">
                          <button onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))} disabled={photoIndex === 0}>‹</button>
                          <span>{photoIndex + 1} / {activeLocation.photos.length}</span>
                          <button onClick={() => setPhotoIndex((i) => Math.min(activeLocation.photos.length - 1, i + 1))} disabled={photoIndex === activeLocation.photos.length - 1}>›</button>
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
 
function WorldMap() {
  return (
    <g>
      <rect width={SVG_W} height={SVG_H} fill="#e8f0f7" rx="8" />
      <path d="M 90 60 L 160 55 L 195 70 L 210 90 L 220 130 L 215 160 L 230 175 L 225 200 L 200 215 L 185 240 L 175 260 L 160 265 L 150 250 L 140 230 L 125 220 L 110 225 L 95 210 L 85 185 L 75 160 L 70 130 L 75 100 L 90 60 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 175 20 L 210 15 L 225 30 L 215 50 L 195 55 L 175 45 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 175 265 L 200 260 L 220 280 L 225 310 L 220 350 L 210 390 L 195 420 L 180 430 L 165 420 L 155 390 L 155 355 L 160 320 L 165 290 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 400 55 L 430 50 L 460 55 L 470 75 L 460 95 L 445 100 L 430 95 L 415 105 L 405 95 L 395 80 L 400 55 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 415 120 L 450 115 L 475 125 L 490 155 L 495 200 L 490 250 L 480 300 L 465 340 L 450 360 L 435 355 L 420 335 L 410 295 L 405 250 L 405 200 L 408 155 L 415 120 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 465 55 L 550 45 L 640 50 L 710 60 L 760 75 L 790 100 L 800 130 L 790 160 L 760 175 L 730 185 L 700 180 L 670 190 L 640 185 L 610 190 L 580 185 L 555 195 L 530 190 L 510 175 L 490 160 L 475 140 L 465 115 L 460 90 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 580 185 L 605 190 L 620 215 L 615 245 L 600 265 L 585 265 L 570 245 L 568 215 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 680 190 L 720 195 L 740 215 L 735 240 L 715 250 L 695 240 L 675 225 L 670 205 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 760 115 L 775 110 L 785 125 L 780 145 L 765 150 L 755 140 L 755 125 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 710 310 L 770 300 L 820 315 L 840 345 L 835 380 L 815 405 L 780 415 L 745 410 L 715 390 L 700 360 L 700 330 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      <path d="M 393 65 L 402 62 L 408 72 L 403 82 L 394 80 Z" fill="#d4dde8" stroke="#b8c8d8" strokeWidth="0.8" />
      {[60,120,180,240,300,360,420,480,540,600,660,720,780,840].map(x => (
        <line key={x} x1={x} y1={0} x2={x} y2={SVG_H} stroke="#c5d5e8" strokeWidth="0.3" opacity="0.5" />
      ))}
      {[100,200,300,400].map(y => (
        <line key={y} x1={0} y1={y} x2={SVG_W} y2={y} stroke="#c5d5e8" strokeWidth="0.3" opacity="0.5" />
      ))}
      <line x1={0} y1={SVG_H/2} x2={SVG_W} y2={SVG_H/2} stroke="#b0c4d8" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.6" />
    </g>
  );
}