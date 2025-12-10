import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function SearchPage() {
  const [dioceses, setDioceses] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    parishes: [],
    families: [],
    deaneries: [],
    dioceses: [],
  });

  // refs & measured height for smooth expand/collapse
  const resultsInnerRef = useRef(null);
  const [resultsHeight, setResultsHeight] = useState(0); // Renamed for clarity, logic stays same
  const [resultsVisible, setResultsVisible] = useState(false);
  const navigate = useNavigate();
  

  // ---------------------------
  // LOAD JSON DATA
  // ---------------------------
  useEffect(() => {
    fetch("/data/dioceses.json")
      .then((res) => res.json())
      .then((data) => setDioceses(data))
      .catch((e) => console.error("Diocese load failed", e));
    fetch("/data/parishes.json")
      .then((res) => res.json())
      .then((data) => setParishes(data))
      .catch((e) => console.error("Parish load failed", e));
  }, []);

  // ---------------------------
  // BUILD SEARCH INDEX
  // ---------------------------
  const searchIndex = useMemo(() => {
    if (!parishes.length && !dioceses.length) return [];
    const familyMap = new Map();
    const deaneryMap = new Map();
    const dioceseMap = new Map();

    // Include parishCity in the object so it can be used to display results
    const parishIndex = parishes.map((p) => ({
      type: "parish",
      name: p.parishName,
      slug: p.parishSlug,
      city: p.parishCityCounty, // <-- ADDED CITY
    }));

    // Families & deaneries
    parishes.forEach((p) => {
      if (p.parishFamily && !familyMap.has(p.parishFamilySlug)) {
        familyMap.set(p.parishFamilySlug, {
          type: "family",
          name: p.parishFamily,
          slug: p.parishFamilySlug,
        });
      }
      if (p.parishDeanery && !deaneryMap.has(p.parishDeanerySlug)) {
        deaneryMap.set(p.parishDeanerySlug, {
          type: "deanery",
          name: p.parishDeanery,
          slug: p.parishDeanerySlug,
        });
      }
    });

    // Dioceses
    dioceses.forEach((d) => {
      if (!dioceseMap.has(d.dioceseSlug)) {
        dioceseMap.set(d.dioceseSlug, {
          type: "diocese",
          name: d.dioceseName,
          slug: d.dioceseSlug,
        });
      }
    });

    return [
      ...parishIndex,
      ...familyMap.values(),
      ...deaneryMap.values(),
      ...dioceseMap.values(),
    ];
  }, [parishes, dioceses]);

  // ---------------------------
  // SETUP FUSE
  // ---------------------------
  const fuse = useMemo(() => {
    if (searchIndex.length === 0) return null;
    return new Fuse(searchIndex, {
      // 💡 NEW KEYS CONFIGURATION
      keys: [
        { name: "name", weight: 0.9 }, // Higher weight for matching Parish/Family/Diocese name
        { name: "city", weight: 0.5 }, // Lower weight for matching the City (parishes only)
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [searchIndex]);

  // ---------------------------
  // PERFORM SEARCH (debounced)
  // ---------------------------
  const performSearch = useMemo(
    () =>
      debounce((text) => {
        if (!fuse || !text) {
          setResults({ parishes: [], families: [], deaneries: [], dioceses: [] });
          return;
        }
        const raw = fuse.search(text).map((res) => res.item);

        setResults({
          parishes: raw.filter((r) => r.type === "parish"),
          families: raw.filter((r) => r.type === "family"),
          deaneries: raw.filter((r) => r.type === "deanery"),
          dioceses: raw.filter((r) => r.type === "diocese"),
        });
      }, 200),
    [fuse]
  );

  useEffect(() => {
    performSearch(query);
    return () => performSearch.cancel();
  }, [query, performSearch]);

  // ---------------------------
  // Measure results inner height and animate height
  // ---------------------------
  useLayoutEffect(() => {
    const hasAny =
      (results.parishes && results.parishes.length) ||
      (results.families && results.families.length) ||
      (results.deaneries && results.deaneries.length) ||
      (results.dioceses && results.dioceses.length);

    if (!query || !hasAny) {
      setResultsHeight(0);
      setTimeout(() => setResultsVisible(false), 200);
      return;
    }

    setResultsVisible(true);
    const el = resultsInnerRef.current;
    if (el) {
      const measured = el.scrollHeight;
      // Using height instead of max-height allows us to animate smoothly
      // both up and down because 'height' forces the container size
      setResultsHeight(measured + 8); 
    } else {
      setResultsHeight(400);
    }
  }, [results, query]);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="min-h-screen relative text-white">

      <Helmet>
      <title>Search Catholic Parishes – CatholicParishes.org</title>
      <meta
        name="description"
        content="Search for Catholic parishes across Ontario by name, diocese, or location."
      />
      <link rel="canonical" href="https://catholicparishes.org/search" />

      <meta property="og:title" content="Search Catholic Parishes – CatholicParishes.org" />
      <meta
        property="og:description"
        content="Search for Catholic parishes across Ontario by name, diocese, or location."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://catholicparishes.org/search" />
    </Helmet>


      {/* Component-scoped animation CSS */}
      {/* FIX 1: Changed transition property from max-height to height */}
      <style>{`
        .results-wrapper {
          transition: height 360ms ease, opacity 300ms ease;
          overflow: hidden;
        }
        .results-inner .result-type {
          transition: opacity 280ms ease, transform 280ms ease;
        }
      `}</style>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://ik.imagekit.io/catholicparishes/parishes/canada/diocese_of_london/windsor/ourladyofperpetualhelp.jpg')",
        }}
      />
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto p-40">
        <h2 className="text-4xl font-bold mb-4 drop-shadow-lg text-center">
           Search Catholic Parishes
        </h2>
        
        {/* Back button */}
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          className="text-sm mb-4"
        >
          ← Back
        </button>

        {/* SEARCH CARD */}
        <div className="backdrop-blur-lg bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] dark:bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] p-6 rounded-2xl shadow-lg mb-8">

          <input
            type="text"
            placeholder="Search parish, family, deanery, diocese, city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 rounded-lg text-black shadow"
          />

          {/* RESULTS WRAPPER: animate height */}
          <div
            className="results-wrapper mt-3 bg-white text-black rounded-lg shadow"
            // FIX 2: Changed maxHeight to height in inline styles
            style={{
              height: resultsVisible ? `${resultsHeight}px` : 0,
              opacity: resultsVisible ? 1 : 0,
            }}
            aria-hidden={!resultsVisible}
          >
            <div ref={resultsInnerRef} className="results-inner p-2">
              {Object.entries(results).map(([type, items]) =>
                items.length > 0 ? (
                  <div key={type} className="result-type p-2 border-b last:border-b-0">
                    <div className="font-semibold capitalize mb-1">{type}</div>
                    {items.map((item) => {
                      // 💡 SYNTAX FIX: Corrected ternary operator chain here
                      const singular =
                        type === "parishes"
                          ? "parish"
                          : type === "families"
                          ? "family"
                          : type === "deaneries"
                          ? "deanery"
                          : type === "dioceses" // <-- CORRECTED THIS LINE
                          ? "diocese"
                          : type;
                      return (
                        <Link
                          key={`${singular}-${item.slug}`}
                          to={`/${singular}/${item.slug}`}
                          className="block px-2 py-1 hover:bg-gray-100"
                        >
                          {/* Display Name, City for Parishes */}
                          {item.type === 'parish' 
                            ? `${item.name}, ${item.city}` 
                            : item.name
                          }
                        </Link>
                      );
                    })}
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* DIOCESES HEADER */}
        <h2 className="text-2xl font-bold mb-4 drop-shadow-lg">
          List of Dioceses Included in Catholic Parishes
        </h2>

        {/* DIOCESES CARD */}
        <div className="backdrop-blur-lg bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] dark:bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] p-6 rounded-2xl shadow-lg">
        {dioceses.length === 0 ? (
            <p>Loading dioceses...</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dioceses
                .slice()
                .sort((a, b) => a.dioceseName.localeCompare(b.dioceseName))
                .map((d) => (
                <Link
                    key={d.dioceseSlug}
                    to={`/diocese/${d.dioceseSlug}`}
                    className="block px-2 py-1 hover:underline text-white transition"
                >
                    {d.dioceseName} ({d.numParishesInDiocese})
                </Link>
                ))}
            </div>
        )}
        </div>


      </div>
    </div>
  );
}