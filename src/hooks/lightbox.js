// src/hooks/lightbox.js
import React, { createContext, useContext, useState, useEffect } from "react";

const LightboxContext = createContext();

export function LightboxProvider({ children }) {
  const [photos, setPhotos] = useState(null);
  const [index, setIndex] = useState(0);

  // Open lightbox with a specific set of photos
  const openLightbox = (i, list) => {
    if (!list || !Array.isArray(list) || list.length === 0) return;
    setPhotos(list);
    setIndex(i);
    document.body.style.overflow = "hidden"; // Prevent background scroll
  };

  const closeLightbox = () => {
    setPhotos(null);
    document.body.style.overflow = ""; // Restore scroll
  };

  const showPrev = (e) => {
    e?.stopPropagation();
    if (!photos) return;
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  const showNext = (e) => {
    e?.stopPropagation();
    if (!photos) return;
    setIndex((i) => (i + 1) % photos.length);
  };

  // Keyboard navigation (ESC / ← / →)
  useEffect(() => {
    if (!photos) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev(e);
      if (e.key === "ArrowRight") showNext(e);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos]);

  return (
    <LightboxContext.Provider
      value={{
        photos,
        index,
        openLightbox,
        closeLightbox,
        showPrev,
        showNext,
      }}
    >
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  return useContext(LightboxContext);
}

export function Lightbox() {
  const { photos, index, closeLightbox, showPrev, showNext } = useLightbox();

  // Do not render unless there are images
  if (!photos || !Array.isArray(photos) || photos.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="
        fixed inset-0 z-[9999] flex items-center justify-center 
        bg-black/80 backdrop-blur-sm
        opacity-100 animate-fade-in
      "
      onClick={closeLightbox}
    >
      {/* Prev button */}
      <button
        onClick={(e) => showPrev(e)}
        className="
          absolute left-4 top-1/2 -translate-y-1/2 
          text-white p-3 rounded-full bg-black/40 hover:bg-black/60
          transition
        "
      >
        ‹
      </button>

      {/* Main image */}
      <img
        src={photos[index]}
        alt=""
        className="
          max-w-[90vw] max-h-[85vh] w-auto h-auto 
          object-contain rounded-lg shadow-xl
          transition-transform duration-200
        "
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next button */}
      <button
        onClick={(e) => showNext(e)}
        className="
          absolute right-4 top-1/2 -translate-y-1/2 
          text-white p-3 rounded-full bg-black/40 hover:bg-black/60
          transition
        "
      >
        ›
      </button>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeLightbox();
        }}
        className="
          absolute right-4 top-4 
          text-white p-3 rounded-full bg-black/40 hover:bg-black/60
          transition
        "
      >
        ✕
      </button>

      {/* Counter */}
      <div className="absolute bottom-6 text-sm text-white/90">
        {index + 1} / {photos.length}
      </div>

      {/* Fade animation */}
      <style>
        {`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 150ms ease-out;
        }
      `}
      </style>
    </div>
  );
}
