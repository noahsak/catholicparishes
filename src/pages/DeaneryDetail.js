import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// ADDED: Import Helmet for SEO
import { Helmet } from "react-helmet-async"; 
import { useLightbox, Lightbox } from "../hooks/lightbox";
import CollapsibleSection from "../hooks/CollapsibleSection"; // <--- import centralized

export default function DeaneryDetail() {
  const { slug } = useParams();

  const navigate = useNavigate();
  const [deanery, setDeanery] = useState(undefined);
  const [isDark, setIsDark] = useState(() => {
    return typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const { openLightbox } = useLightbox();


  // Dark mode detection
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (ev) => setIsDark(ev.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Load deaneries JSON
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/data/deaneries.json");
        if (!res.ok) throw new Error("Failed to load deaneries.json");
        const list = await res.json();
        if (!mounted) return;
        const found = list.find((d) => {
          const generatedSlug = String(d.deanerySlug || d.deaneryName || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return generatedSlug === slug;
        });
        setDeanery(found ?? null);
      } catch (err) {
        console.error("Error loading deaneries:", err);
        if (mounted) setDeanery(null);
      }
    };
    load();
    return () => { mounted = false; };
  }, [slug]);

  if (deanery === undefined)
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (deanery === null)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        Deanery not found. <br />
        <Link to="/">Back</Link>
      </div>
    );
  
  const photos = String(deanery.deaneryPhotos || "").split(/;|\n/).map(p => p.trim()).filter(Boolean);
  const banner = photos.length > 0 ? photos[0] : null;

  const parishList = String(deanery.parishesListByDeaneryAlpha || "").split(/;|\n/).map((p, i) => ({
    name: p.trim(),
    slug: String(deanery.parishesListByDeaneryAlphaSlug || "").split(/;|\n/)[i]?.trim() || null
  }));

  const familyList = String(deanery.familyListByDeaneryAlpha || "").split(/;|\n/).map((f, i) => ({
    name: f.trim(),
    slug: String(deanery.familyListByDeaneryAlphaSlug || "").split(/;|\n/)[i]?.trim() || null
  }));

  const nationalitiesList = deanery.deaneryNationalities ? deanery.deaneryNationalities.split(/;|\n/).map(n => n.trim()).filter(Boolean) : [];


  return (
    <div className={`min-h-screen relative flex flex-col ${isDark ? "text-white" : "text-black"}`}>
      
      {/* 🇻🇦 SEO HEAD TAGS 🇻🇦 */}
      <Helmet>
        <title>{deanery.deaneryName} Deanery, {deanery.deaneryProvince}, {deanery.deaneryCountry} – Catholic Deanery</title>
        <meta
          name="description"
          content={`Catholic parishes information, and stats for the ${deanery.deaneryName} Deanery (Diocese of ${deanery.deaneryDiocese}) in ${deanery.deaneryProvince}, ${deanery.deaneryCountry}. Find ${deanery.numParishesInDeanery} parishes in this Deanery.`}
        />
        <link
          rel="canonical"
          href={`https://catholicparishes.org/deanery/${slug}`}
        />

        {/* Open Graph Tags for Social Media */}
        <meta property="og:title" content={`${deanery.deaneryName} Deanery – Catholic Parishes`} />
        <meta
          property="og:description"
          content={`Parishes and stats for the ${deanery.deaneryName} Deanery.`}
        />
        <meta
          property="og:url"
          content={`https://catholicparishes.org/deanery/${slug}`}
        />
        <meta property="og:type" content="website" />

        {/* JSON-LD Schema: Minimal Organization, since Deaneries typically don't have a specific public address. */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: `${deanery.deaneryName} Deanery`,
            url: `https://catholicparishes.org/deanery/${slug}`,
            areaServed: {
                "@type": "AdministrativeArea",
                addressRegion: deanery.deaneryProvince,
                addressCountry: deanery.deaneryCountry,
            }
          })}
        </script>
      </Helmet>
      {/* 🇻🇦 END SEO HEAD TAGS 🇻🇦 */}

      <div className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: banner ? `url('${banner}')` : "none", backgroundColor: banner ? undefined : isDark ? "#80008048" : "#f9fafb" }} />
      <div className="absolute inset-0 bg-black/50" />

      <div className="h-64 md:h-80 flex items-end">
        <div className="w-full bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
              {deanery.deaneryName} Deanery
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 space-y-6
        bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]
        dark:bg-[color-mix(in_srgb,var(--accent)_25%,transparent)]
        backdrop-blur-md rounded-2xl mt-6"
      >
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} className="text-sm">← Back</button>

        {/* Information + Parish Count */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Information</h2>
          <div className="md:flex md:justify-center md:items-start gap-6">
            <div className="space-y-1 md:text-left">
              <div><strong>Diocese:</strong> <Link to={`/diocese/${deanery.deaneryDioceseSlug}`} className="underline text-blue-500 dark:text-blue-300">{deanery.deaneryDiocese}</Link></div>
              <div><strong>Province:</strong> {deanery.deaneryProvince}</div>
              <div><strong>Country:</strong> {deanery.deaneryCountry}</div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="p-4 shadow-md rounded-xl text-center
                bg-[color-mix(in_srgb,var(--accent)_40%,transparent)]
                dark:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
                style={{ border: "2px solid var(--accent)", boxShadow: "0 0 12px var(--accent)", backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              >
                <div className="text-sm font-semibold text-white dark:text-white">Parishes in Deanery</div>
                <div className="text-3xl font-bold mt-1">{deanery.numParishesInDeanery ?? 0}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Parishes Dropdown */}
        <CollapsibleSection title="Parishes and Catholic Communities" count={parishList.length} id={`deanery-${slug}-parishesdropdown`}>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            {parishList.map((p, i) => (
              <li key={i}>
                {p.slug ? <Link to={`/parish/${p.slug}`} className="underline text-blue-500 dark:text-blue-300">{p.name}</Link> : p.name}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* Families Dropdown */}
        {familyList.length > 0 && (
          <CollapsibleSection title="Family of Parishes" count={familyList.length} id={`deanery-${slug}-familiesdropdown`}>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              {familyList.map((f, i) => (
                <li key={i}>
                  {f.slug ? <Link to={`/family/${f.slug}`} className="underline text-blue-500 dark:text-blue-300">{f.name}</Link> : f.name}
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {/* Nationalities Dropdown */}
        {nationalitiesList.length > 0 && (
          <CollapsibleSection title="Nationalities Represented" count={nationalitiesList.length} id={`deanery-${slug}-nationalitiesList`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {nationalitiesList.map((n, i) => <div key={i} className="list-disc ml-4">{n}</div>)}
            </div>
          </CollapsibleSection>
        )}

        {/* Photos Dropdown */}
        {photos.length > 0 && (
          <CollapsibleSection title="Photos" count={photos.length} id={`deanery-${slug}-photos`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {photos.map((u, i) => (
                <button key={i} onClick={() => openLightbox(i, photos)}>
                  <img src={u} alt={deanery.deaneryName} className="w-full h-40 object-cover rounded-lg hover:opacity-80 transition" />
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Footer */}
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

      <Lightbox />
    </div>
  );
}