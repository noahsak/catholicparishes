import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

function App() {
  // Keep accent hook (needed for theme)
  useLiturgicalAccent();

  return (
    <LightboxProvider>
      <Router>
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
    </LightboxProvider>
  );
}

export default App;
