import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLightbox, Lightbox } from "../hooks/lightbox";

export default function FamilyDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [family, setFamily] = useState(undefined);
  const [isDark, setIsDark] = useState(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  // Lightbox
  const { openLightbox } = useLightbox();

  // Detect dark mode changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (ev) => setIsDark(ev.matches);
    mq.addEventListener?.("change", onChange);
    mq.addListener?.(onChange);
    return () => {
      mq.removeEventListener?.("change", onChange);
      mq.removeListener?.(onChange);
    };
  }, []);

  // Load families JSON
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/data/families.json");
        if (!res.ok) throw new Error("Failed to load families.json");
        const list = await res.json();
        if (!mounted) return;

        const found = list.find((f) => {
          const generatedSlug = String(f.familySlug || f.familyName || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return generatedSlug === slug;
        });

        setFamily(found ?? null);
      } catch (err) {
        console.error("Error loading families:", err);
        if (mounted) setFamily(null);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (family === undefined)
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (family === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          Family not found. <br />
          <Link to="/">Back</Link>
        </div>
      </div>
    );

  // Normalize photos
  const photos = String(family.familyPhotos || "")
    .split(/;|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const banner = photos.length > 0 ? photos[0] : null;

  // Normalize parishes
  const parishNames = String(family.parishesListByFamilyAlpha || "")
    .split(/;|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const parishSlugs = String(family.parishesListByFamilyAlphaSlug || "")
    .split(/;|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const parishList = parishNames.map((name, idx) => ({
    name,
    slug: parishSlugs[idx] || null,
  }));

  return (
    <div className="min-h-screen relative flex flex-col text-white">
      {/* Full-page background */}
      <div className="absolute inset-0 z-0">
        {banner ? (
          <div
            className="w-full h-full bg-center bg-cover transition-all duration-500"
            style={{ backgroundImage: `url('${banner}')` }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, var(--accent) 0%, rgba(0,0,0,0.25) 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Banner title */}
      <div className="relative z-10 h-64 md:h-80 flex items-end">
        <div className="w-full">
          <div className="max-w-5xl mx-auto flex flex-col">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
              {family.familyName}
            </h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-4xl mx-auto p-6 space-y-6 mt-6 bg-[color-mix(in_srgb,var(--accent)_50%,transparent)] dark:bg-[color-mix(in_srgb,var(--accent)_50%,transparent)] backdrop-blur-md rounded-2xl">

        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          className="text-sm"
        >
          ← Back
        </button>

        {/* Family Info */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Information</h2>
          <div className="space-y-1">
            <div>
              <strong>Diocese:</strong>{" "}
              <Link to={`/diocese/${family.familyDioceseSlug}`} className="underline text-blue-500 dark:text-blue-300">
                {family.familyDiocese}
              </Link>
            </div>
            <div>
              <strong>Deanery:</strong>{" "}
              <Link to={`/deanery/${family.familyDeanerySlug}`} className="underline text-blue-500 dark:text-blue-300">
                {family.familyDeanery}
              </Link>
            </div>
            <div>
              <strong>Province:</strong> {family.familyProvince}
            </div>
            <div>
              <strong>Country:</strong> {family.familyCountry}
            </div>
            {family.familyWebsite && (
              <div>
                <strong>Website:</strong>{" "}
                <a href={family.familyWebsite} target="_blank" rel="noreferrer" className="underline text-blue-500 dark:text-blue-300">
                  Visit
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Parishes */}
        <section>
          <h2 className="text-xl font-semibold">
            Parishes and Catholic Communities — {family.numParishesInFamily ?? parishList.length}
          </h2>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {parishList.map((p, i) => (
              <li key={i}>
                {p.slug ? (
                  <Link to={`/parish/${p.slug}`} className="underline text-blue-500 dark:text-blue-300">
                    {p.name}
                  </Link>
                ) : (
                  p.name
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Mass Statistics */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Mass Statistics</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {[
              ["Sunday Masses", family.numSundayMassInFamily ?? 0],
              ["Saturday Vigil Masses", family.numSaturdayVigilMassInFamily ?? 0],
              ["Daily Masses", family.numDailyMassesPerWeekInFamily ?? 0],
              ["Total Masses", family.numMassesPerWeekInFamily ?? 0],
            ].map(([label, value], idx) => (
              <div
                key={idx}
                className="p-4 bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] dark:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] shadow-md rounded-xl text-center"
                style={{ border: "2px solid var(--accent)", boxShadow: "0 0 12px var(--accent)", backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-2xl font-bold mt-1">{value}</div>
              </div>
            ))}
          </div>
          <div className="text-xs mt-4">*All stats are based on a per week basis</div>
        </section>

        {/* Nationalities */}
        {family.familyNationalities && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Nationalities Represented</h2>
            <ul className="list-disc ml-6 space-y-1 text-white">
              {String(family.familyNationalities)
                .split(/[,;|\n]/)
                .map((n) => n.trim())
                .filter(Boolean)
                .map((n, i) => (
                  <li key={i} className="capitalize">{n}</li>
                ))}
            </ul>
          </section>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold">Photos</h2>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((u, i) => (
                <button key={i} onClick={() => openLightbox(i, photos)} className="focus:outline-none">
                  <img src={u} alt={family.familyName} className="w-full h-40 object-cover rounded-lg hover:opacity-80 transition" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Footer buttons */}
        <div className="flex justify-between items-end mt-6">
          <Link to="/" className="bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] dark:bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] backdrop-blur-md px-4 py-2 rounded-lg shadow text-white font-medium hover:bg-white/20 transition">
            ← Back to Map
          </Link>
          <Link to="/contact" className="bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] dark:bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] backdrop-blur-md px-4 py-2 rounded-lg shadow text-white font-medium hover:bg-white/20 transition">
            Report an Error
          </Link>
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/about" className="bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] dark:bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] backdrop-blur-md px-4 py-2 rounded-lg shadow text-white font-medium hover:bg-[color-mix(in_srgb,var(--accent)_90%,black)] transition">
            About Catholic Parishes
          </Link>
        </div>

      </main>

      {/* Lightbox */}
      <Lightbox />
    </div>
  );
}
