import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Map from "./pages/Map";
import ParishDetail from "./pages/ParishDetail";
import DioceseDetail from "./pages/DioceseDetail";
import DeaneryDetail from "./pages/DeaneryDetail";
import FamilyDetail from "./pages/FamilyDetail";
import About from "./pages/about";
import Contact from "./pages/contact";
import Search from "./pages/search";
import NotFound from "./pages/NotFound";

import { useLiturgicalAccent } from "./hooks/useLiturgicalAccent";
import { LightboxProvider, Lightbox } from "./hooks/lightbox";

// Vercel imports
import { Analytics, pageview } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";

// Component to track route changes in SPA
function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location]);
  return null;
}

function App() {
  // Keep accent hook (needed for theme)
  useLiturgicalAccent();

  return (
    <LightboxProvider>
      <Router>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/parish/:slug" element={<ParishDetail />} />
          <Route path="/diocese/:slug" element={<DioceseDetail />} />
          <Route path="/deanery/:slug" element={<DeaneryDetail />} />
          <Route path="/family/:slug" element={<FamilyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      <Lightbox />

      {/* Vercel Analytics */}
      <Analytics />

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </LightboxProvider>
  );
}

export default App;
