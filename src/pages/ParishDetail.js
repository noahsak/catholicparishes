import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// ADDED: Import Helmet for SEO
import { Helmet } from "react-helmet-async";
import externalLinkIcon from "../assets/external_link_white.png";
import { useLightbox, Lightbox } from "../hooks/lightbox";

export default function ParishDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [parish, setParish] = useState(undefined);

  // NEW — use Lightbox.js handler
  const { openLightbox } = useLightbox();

  const [isDark, setIsDark] = useState(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Sync theme with system
  useEffect(() => {
    const mq =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    if (!mq) return;

    const onChange = (ev) => setIsDark(ev.matches);

    mq.addEventListener
      ? mq.addEventListener("change", onChange)
      : mq.addListener(onChange);

    return () => {
      mq.removeEventListener
        ? mq.removeEventListener("change", onChange)
        : mq.removeListener(onChange);
    };
  }, []);

  // Fetch parish data
  useEffect(() => {
    let alive = true;

    fetch("/data/parishes.json")
      .then((r) => r.json())
      .then((list) => {
        if (!alive) return;
        if (!Array.isArray(list)) {
          setParish(null);
          return;
        }

        const found = list.find((p) => {
          const raw = String(p.parishSlug || "").trim().toLowerCase();
          const cleaned = raw.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          return cleaned === slug.toLowerCase();
        });

        if (!found) {
          setParish(null);
          return;
        }

        const normalizePhotos = (raw) => {
          if (!raw) return [];
          if (Array.isArray(raw))
            return raw.map(String).map((s) => s.trim()).filter(Boolean);
          return String(raw)
            .replace(/\\/g, "")
            .split(/;|,|\||\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean);
        };

        const normalizeTimes = (raw) => {
          if (!raw) return [];
          if (Array.isArray(raw))
            return raw
              .map((r) => (typeof r === "string" ? r.trim() : r))
              .filter(Boolean)
              .map((r) =>
                typeof r === "string"
                  ? (() => {
                      const match = r.match(/^(.*)\s*\(([^)]+)\)\s*$/);
                      if (match)
                        return { text: match[1].trim(), language: match[2].trim() };
                      return { text: r.trim() };
                    })()
                  : r
              );

          return String(raw)
            .replace(/\\/g, "")
            .trim()
            .split(/;|\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((t) => {
              const match = t.match(/^(.*)\s*\(([^)]+)\)\s*$/);
              if (match)
                return { text: match[1].trim(), language: match[2].trim() };
              return { text: t };
            });
        };

        const normalizeList = (raw) => {
          if (!raw) return [];
          if (Array.isArray(raw))
            return raw.map(String).map((s) => s.trim()).filter(Boolean);

          return String(raw)
            .replace(/\\/g, "")
            .split(/;|\r?\n|\|/)
            .map((s) => s.trim())
            .filter(Boolean);
        };

        const normalized = {
          ...found,
          photos: normalizePhotos(
            found.parishPhotos ||
              found.parishPhoto ||
              found.parish_photos_url ||
              ""
          ),
          sundayMassTimes: normalizeTimes(
            found.sundayMassTimes ||
              found.sunday_mass_times ||
              found.massTimes ||
              found.mass_times ||
              ""
          ),
          dailyMassTimes: normalizeTimes(
            found.dailyMassTimes ||
              found.daily_mass_times ||
              found.weekday_mass_times ||
              ""
          ),
          confessionTimes: normalizeTimes(
            found.confessionTimes || found.confession_times || ""
          ),
          adorationTimes: normalizeTimes(
            found.adorationTimes || found.adoration_times || ""
          ),
          benedictionTimes: normalizeTimes(
            found.benedictionTimes || found.benediction_times || ""
          ),
          devotions: normalizeList(found.devotions || found.devotion || ""),
          notesList: normalizeList(
            found.parishesNotes || found.parishNotes || ""
          ),
          notes: found.parishesNotes || found.parishNotes || "",
        };

        setParish(normalized);
      })
      .catch((err) => {
        console.error("Failed to load parishes JSON:", err);
        if (alive) setParish(null);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  // Loading / not found UI
  if (parish === undefined)
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  if (parish === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          Parish not found. <br />
          <button
            onClick={() =>
              window.history.length > 1 ? navigate(-1) : navigate("/")
            }
            className="text-sm underline mt-2 inline-block"
          >
            ← Back
          </button>
        </div>
      </div>
    );

  const banner =
    parish.photos && parish.photos.length > 0 ? parish.photos[0] : null;

  // --- SEO Data Structure ---
  const addressComponents = {
    "@type": "PostalAddress",
    streetAddress: parish.parishAddress,
    addressLocality: parish.parishCityCounty.split(',')[0].trim(),
    addressRegion: parish.parishCityCounty.split(',')[1]?.trim(),
    addressCountry: parish.parishCountry || "CA",
  };

  // Construct JSON-LD schema with updated type and geolocation (if available)
  const churchSchema = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: parish.parishName,
    url: `https://catholicparishes.org/parish/${slug}`,
    address: addressComponents,
    ...(parish.lat && parish.long && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: parish.lat,
        longitude: parish.long,
      },
    }),
    telephone: parish.parishPhone || undefined,
    email: parish.parishEmail || undefined,
    sameAs: [parish.website].filter(Boolean)
  };


  return (
    <div className="min-h-screen relative flex flex-col text-white">
      {/* 🇻🇦 SEO HEAD TAGS 🇻🇦 */}
      {/* Inserted for search ranking (title, description, canonical, Open Graph, JSON-LD) */}
      <Helmet>
        <title>{parish.parishName}, {parish.parishCityCounty}</title>
        <meta
          name="description"
          content={`Mass times, confession times, adoration times, address, and contact info for ${parish.parishName}, ${parish.parishCityCounty}.`}
        />
        <link
          rel="canonical"
          href={`https://catholicparishes.org/parish/${slug}`}
        />

        {/* Optional but recommended SEO */}
        <meta property="og:title" content={`${parish.parishName} – Catholic Parishes`} />
        <meta
          property="og:description"
          content={`Find Mass, confession, and adoration times for ${parish.parishName}.`}
        />
        <meta
          property="og:url"
          content={`https://catholicparishes.org/parish/${slug}`}
        />
        <meta property="og:type" content="website" />

        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify(churchSchema)}
        </script>
      </Helmet>
      {/* 🇻🇦 END SEO HEAD TAGS 🇻🇦 */}

      {/* Background Banner */}
      <div className="absolute inset-0">
        {banner ? (
          <div
            className="w-full h-full bg-center bg-cover transition-all duration-500"
            style={{ backgroundImage: `url('${banner}')` }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg,
                 var(--accent) 0%,
                 rgba(0,0,0,0.25) 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Title */}
      <div className="h-64 md:h-80 flex items-end">
        <div className="w-full bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="max-w-5xl mx-auto flex flex-col">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
              {parish.parishName}
            </h1>

            {parish.parishAddress && (
              <p className="text-sm text-white mt-1 drop-shadow flex items-center gap-2">
                <span>{parish.parishAddress}</span>
                <a
                  // FIX: Corrected Google Maps URL for standard search query
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    parish.parishAddress
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-80"
                >
                  <img
                    src={externalLinkIcon}
                    alt="Open in Maps"
                    className="w-3 h-3"
                  />
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main
        className="
          max-w-4xl mx-auto p-6 space-y-6
          bg-[color-mix(in_srgb,var(--accent)_50%,transparent)]
          backdrop-blur-md rounded-2xl mt-6
        "
      >
        {/* Back button */}
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/")
          }
          className="text-sm"
        >
          ← Back
        </button>

        {/* Information */}
        <section>
          <h2 className="text-xl font-semibold">Information</h2>

          <div className="mt-2 space-y-1">
            {/* Shared Building */}
            {parish.shareBuildingName && (
              <div>
                <strong>Shares Building with:</strong>{" "}
                {(() => {
                  const names = parish.shareBuildingName
                    .split(";")
                    .map((s) => s.trim());
                  const slugs = parish.shareBuildingSlug
                    .split(";")
                    .map((s) => s.trim());

                  return names.map((name, i) => {
                    const slug = slugs[i];
                    if (slug)
                      return (
                        <React.Fragment key={i}>
                          <Link
                            to={`/parish/${slug}`}
                            className="underline text-blue-300"
                          >
                            {name}
                          </Link>
                          {i < names.length - 1 ? ", " : ""}
                        </React.Fragment>
                      );
                    return (
                      <React.Fragment key={i}>
                        {name}
                        {i < names.length - 1 ? ", " : ""}
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            )}

            {/* Diocese */}
            {parish.parishDiocese && (
              <div>
                <strong>Diocese:</strong>{" "}
                {parish.parishDioceseSlug ? (
                  <Link
                    to={`/diocese/${parish.parishDioceseSlug}`}
                    className="underline text-blue-300"
                  >
                    {parish.parishDiocese}
                  </Link>
                ) : (
                  parish.parishDiocese
                )}
              </div>
            )}

            {/* Deanery */}
            {parish.parishDeanery && (
              <div>
                <strong>Deanery:</strong>{" "}
                {parish.parishDeanerySlug ? (
                  <Link
                    to={`/deanery/${parish.parishDeanerySlug}`}
                    className="underline text-blue-300"
                  >
                    {parish.parishDeanery}
                  </Link>
                ) : (
                  parish.parishDeanery
                )}
              </div>
            )}

            {/* Family */}
            {parish.parishFamily && (
              <div>
                <strong>Family of Parishes:</strong>{" "}
                {parish.parishFamilySlug ? (
                  <Link
                    to={`/family/${parish.parishFamilySlug}`}
                    className="underline text-blue-300"
                  >
                    {parish.parishFamily}
                  </Link>
                ) : (
                  parish.parishFamily
                )}
              </div>
            )}

            {parish.website && (
              <div>
                <strong>Website:</strong>{" "}
                <a
                  href={parish.website}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-300"
                >
                  Visit
                </a>
              </div>
            )}

            {parish.parishPhone && (
              <div>
                <strong>Phone:</strong> {parish.parishPhone}
              </div>
            )}

            {parish.parishEmail && (
              <div>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${parish.parishEmail}`} className="underline text-blue-300">
                  {parish.parishEmail}
                </a>
              </div>
            )}

            {parish.parishNationality && (
              <div>
                <strong>Nationality:</strong> {parish.parishNationality}
              </div>
            )}
          </div>
        </section>

        {/* MASS & SERVICES */}
        <section>
          <h2 className="text-xl font-semibold">Mass & Services</h2>

          <div className="mt-2 space-y-2">
            {parish.sundayMassTimes?.length > 0 && (
              <div>
                <strong>Sunday Masses:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {parish.sundayMassTimes.map((m, i) => (
                    <li key={i}>
                      {m.text}
                      {m.language ? ` (${m.language})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {parish.dailyMassTimes?.length > 0 && (
              <div>
                <strong>Daily Masses:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {parish.dailyMassTimes.map((m, i) => (
                    <li key={i}>
                      {m.text}
                      {m.language ? ` (${m.language})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {parish.confessionTimes?.length > 0 && (
              <div>
                <strong>Confession:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {parish.confessionTimes.map((m, i) => (
                    <li key={i}>{m.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {parish.adorationTimes?.length > 0 && (
              <div>
                <strong>Adoration:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {parish.adorationTimes.map((m, i) => (
                    <li key={i}>{m.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {parish.benedictionTimes?.length > 0 && (
              <div>
                <strong>Benediction:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {parish.benedictionTimes.map((m, i) => (
                    <li key={i}>{m.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {parish.devotions?.length > 0 && (
              <div>
                <strong>Devotions:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {parish.devotions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Notes */}
        {parish.notesList?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold">Notes</h2>
            <div className="mt-2">
              {parish.notesList.length === 1 ? (
                <div>{parish.notesList[0]}</div>
              ) : (
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  {parish.notesList.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* PHOTOS — UPDATED TO USE LIGHTBOX.JS */}
        {parish.photos?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold">Photos</h2>

            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              {parish.photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(i, parish.photos)}
                  className="block w-full h-40 overflow-hidden rounded-lg focus:outline-none"
                >
                  <img
                    src={url}
                    alt={`${parish.parishName} photo ${i + 1}`}
                    className="w-full h-40 object-cover rounded-lg transform hover:scale-105 transition"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <div className="flex justify-between items-end mt-6">
          <Link
            to="/"
            className="
              backdrop-blur-md
              px-4 py-2 rounded-lg shadow text-white font-medium hover:bg-white/20 transition
              bg-[color-mix(in_srgb,var(--accent)_40%,transparent)]
            "
          >
            ← Back to Map
          </Link>

          <div className="flex flex-col items-end space-y-2">
            <div className="text-white text-sm">
              Data last updated:{" "}
              {parish.parishesLastUpdate
                ? new Date(parish.parishesLastUpdate).toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "N/A"}
            </div>

            <Link
              to="/contact"
              className="
                bg-[color-mix(in_srgb,var(--accent)_40%,transparent)]
                backdrop-blur-md
                px-4 py-2 rounded-lg shadow text-white font-medium
                hover:bg-white/20 transition
              "
            >
              Report an Error or Upload a Photo
            </Link>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/about"
            className="
              bg-[color-mix(in_srgb,var(--accent)_40%,transparent)]
              backdrop-blur-md
              px-4 py-2 rounded-lg shadow text-white font-medium
              hover:bg-white/20 transition
            "
          >
            About Catholic Parishes
          </Link>
        </div>
      </main>

      {/* GLOBAL LIGHTBOX RENDERER */}
      <Lightbox />
    </div>
  );
}