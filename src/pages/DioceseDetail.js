import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import externalLinkIcon from "../assets/external_link_white.png";
import { useLightbox, Lightbox } from "../hooks/lightbox";
import CollapsibleSection from "../hooks/CollapsibleSection"; 

export default function DioceseDetail() {

  const navigate = useNavigate();
  const { slug } = useParams();
  const { openLightbox } = useLightbox();

  const [diocese, setDiocese] = useState(undefined);
  const [parishes, setParishes] = useState([]); // Full list of all parishes
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Dark Mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Load Data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const dioRes = await fetch("/data/dioceses.json");
        const parRes = await fetch("/data/parishes.json");
        if (!dioRes.ok || !parRes.ok) throw new Error("File load error");

        const dioList = await dioRes.json();
        const parishList = await parRes.json();
        if (!mounted) return;

        setParishes(parishList);

        const found = dioList.find((d) => {
          const generatedSlug = String(d.dioceseSlug || d.dioceseName || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return generatedSlug === slug;
        });

        setDiocese(found ?? null);
      } catch (err) {
        console.error(err);
        if (mounted) setDiocese(null);
      }
    };

    load();
    return () => (mounted = false);
  }, [slug]);

  // Memoized photos & banner
  const photos = useMemo(() => {
    if (!diocese) return [];
    return String(diocese.diocesePhotos || "")
      .split(/;|\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [diocese]);

  const banner = useMemo(() => {
    if (!diocese) return null;
    let b = null;
    if (diocese.dioceseCathedral) {
      const cathedralParish = parishes.find(
        (p) => p.parishName?.trim() === diocese.dioceseCathedral?.trim()
      );
      if (cathedralParish?.parishPhotos) b = cathedralParish.parishPhotos.split(";")[0].trim();
    }
    if (!b && photos.length > 0) b = photos[0];
    return b;
  }, [diocese, parishes, photos]);

  // 💥 CORRECTED: List processing function uses 'parishCityCounty'
  const listFromRow = (namesStr, slugsStr) => {
    const names = String(namesStr || "").split(";").map((s) => s.trim()).filter(Boolean);
    const slugs = String(slugsStr || "").split(";").map((s) => s.trim());
    
    return names.map((name, i) => {
      const slugValue = slugs[i] || null;
      let city = null;
      
      if (slugValue) {
        // Find the full parish object using the slug for reliable correlation
        const fullParish = parishes.find(
          (p) => p.parishSlug === slugValue
        );
        
        // 🚨 Use the correct key: parishCityCounty
        if (fullParish?.parishCityCounty) {
          city = fullParish.parishCityCounty;
        }
      }

      return { name, slug: slugValue, city };
    });
  };

  const parishListFromRow = listFromRow(diocese?.parishesListInDioceseByAlpha, diocese?.parishesSlugListInDioceseByAlpha);
  const familiesListFromRow = listFromRow(diocese?.familiesListByDioceseAlpha, diocese?.familiesListByDioceseAlphaSlug);
  const deaneriesListFromRow = listFromRow(diocese?.deaneriesListInDioceseByAlpha, diocese?.deaneriesListInDioceseByAlphaSlug);
  const citiesListFromRow = listFromRow(diocese?.citiesListAlphaInDiocese, diocese?.citiesListAlphaInDioceseSlug);

  if (diocese === undefined)
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (diocese === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          Diocese not found.<br />
          <Link to="/">Back</Link>
        </div>
      </div>
    );

  // Info sections
  const infoLeft = [
    [
      "Cathedral",
      diocese.dioceseCathedral ? (
        <Link to={`/parish/${diocese.dioceseCathedralSlug}`} className="underline text-blue-300 dark:text-blue-300">
          {diocese.dioceseCathedral}
        </Link>
      ) : null,
    ],
    ["Province", diocese.dioceseProvinceState],
    ["Country", diocese.dioceseCountry],
    ["Established", diocese.DioceseEstablishedDate],
    ["Website", diocese.dioceseUrl],
  ];

  const infoRight = [
    ["Bishop", diocese.bishop],
    ["Bishop Phone", diocese.bishopPhone],
    ["Bishop Email", diocese.bishopEmail],
    ["Vicar General", diocese.vicarGeneral],
    ["Vicar General Phone", diocese.vicarGeneralPhone],
    ["Vicar General Email", diocese.vicarGeneralEmail],
  ];

  const stats = [
    ["Total Masses", diocese.numMassesPerWeekInDiocese],
    ["Daily Masses", diocese.numDailyMassesPerWeekInDiocese],
    ["Sunday Masses", diocese.numSundayMassInDiocese],
    ["Saturday Vigil Masses", diocese.numSaturdayVigilMassInDiocese],
    ["Monday Masses", diocese.numMondayMassInDiocese],
    ["Tuesday Masses", diocese.numTuesdayMassInDiocese],
    ["Wednesday Masses", diocese.numWednesdayMassInDiosese],
    ["Thursday Masses", diocese.numThursdayMassInDiocese],
    ["Friday Masses", diocese.numFridayMassInDiocese],
    ["Saturday Masses", diocese.numSaturdayMassInDiocese],
  ];

  return (
    <div className="min-h-screen relative flex flex-col text-white">
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: banner ? `url('${banner}')` : "none", backgroundColor: banner ? undefined : "#00000040" }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Banner */}
      <div className="h-64 md:h-80 flex items-end">
        <div className="w-full bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="max-w-5xl mx-auto flex flex-col">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">{diocese.dioceseName}</h1>
            {diocese.dioceseAddress && (
              <p className="text-sm text-white mt-1 drop-shadow flex items-center gap-2">
                <span>{diocese.dioceseAddress}</span>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(diocese.dioceseAddress)}`} target="_blank" rel="noreferrer">
                  <img src={externalLinkIcon} className="w-3 h-3" alt="" />
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <main className="max-w-5xl mx-auto p-6 space-y-10 bg-[color-mix(in_srgb,var(--accent)_50%,transparent)] backdrop-blur-md rounded-2xl mt-6">
        <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))} className="text-sm">← Back</button>

        {/* Information Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Information</h2>
          {/* 👇 CHANGE: grid-cols-1 on mobile, md:grid-cols-3 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              {infoLeft.map(([label, value], i) => value && (
                <div key={i}>
                  <strong>{label}:</strong>{" "}
                  {label === "Website" ? (
                    <a href={value} target="_blank" rel="noreferrer" className="underline text-blue-300">Visit</a>
                  ) : value}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {infoRight.map(([label, value], i) => value && (
                <div key={i}><strong>{label}:</strong> {value}</div>
              ))}
            </div>
              {/* 👇 CHANGE: On mobile, remove flex-col and items-center to let content stretch. Add a large top margin (mt-8) for separation. */}
              {/* On desktop (md:), restore the original centering (flex-col items-center) and the negative margin (-mt-10) for the design aesthetic. */}
              <div className="mt-8 md:mt-0 md:flex md:flex-col md:items-center order-last md:order-none">
                {diocese.bishopPhoto && (
                  <div className="flex flex-col items-center"> {/* Nested div for consistent centering */}
                    <img 
                      src={diocese.bishopPhoto} 
                      alt={diocese.bishop || "Bishop"} 
                      // 👇 CHANGE: w-32 for slightly smaller mobile size, w-40 for desktop. Remove -mt-10 on mobile.
                      // On mobile, image will be centered, smaller, and properly spaced.
                      className="w-32 md:w-40 shadow-md block md:-mt-10" 
                      style={{ border: "2px solid var(--accent)", boxShadow: "0 0 24px var(--accent)" }} 
                    />
                    {diocese.bishop && <p className="text-xs mt-1">{diocese.bishop}</p>}
                  </div>
                )}
              </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Mass Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(([label, value], i) => value && (
              <div key={i} className="p-4 rounded-xl shadow-md bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] backdrop-blur">
                <div className="text-s">{label}</div>
                <div className="text-2xl font-bold mt-1">{value}</div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2">*Stats are based on a weekly schedule.</p>
        </section>

        {/* Collapsible Lists */}
        <CollapsibleSection title="Parishes and Catholic Communities" count={parishListFromRow.length} id={`diocese-${slug}-parishes`}>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            {parishListFromRow.map((p, i) => (
              <li key={i}>
                {/* 💥 CORRECTED RENDERING: [Parish Name], [City] */}
                {p.slug ? (
                    <Link to={`/parish/${p.slug}`} className="underline text-blue-300">
                        {p.name}
                        {p.city && `, ${p.city}`}
                    </Link>
                ) : (
                    <>
                        {p.name}
                        {p.city && `, ${p.city}`}
                    </>
                )}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {familiesListFromRow.length > 0 && (
          <CollapsibleSection title="Family of Parishes" count={familiesListFromRow.length} id={`diocese-${slug}-families`}>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              {familiesListFromRow.map((f, i) => (
                <li key={i}><Link to={`/family/${f.slug}`} className="underline text-blue-300">{f.name}</Link></li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {deaneriesListFromRow.length > 0 && (
          <CollapsibleSection title="Deaneries" count={deaneriesListFromRow.length} id={`diocese-${slug}-deaneries`}>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              {deaneriesListFromRow.map((d, i) => (
                <li key={i}>{d.slug ? <Link to={`/deanery/${d.slug}`} className="underline text-blue-300">{d.name}</Link> : d.name}</li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {citiesListFromRow.length > 0 && (
          <CollapsibleSection title="Cities" count={citiesListFromRow.length} id={`diocese-${slug}-cities`}>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              {citiesListFromRow.map((c, i) => <li key={i}>{c.name}</li>)}
            </ul>
          </CollapsibleSection>
        )}

        {photos.length > 0 && (
          <CollapsibleSection title="Photos" count={photos.length} id={`diocese-${slug}-photos`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {photos.map((u, i) => (
                <button key={i} onClick={() => openLightbox(i, photos)}>
                  <img src={u} alt="" className="w-full h-40 object-cover rounded-lg shadow hover:opacity-80 transition" />
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Footer */}
        <div className="flex justify-between items-end mt-6">
          <Link to="/" className="bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] backdrop-blur-md px-4 py-2 rounded-lg shadow text-white">← Back to Map</Link>
          <Link to="/contact" className="bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] backdrop-blur-md px-4 py-2 rounded-lg shadow text-white">Report an Error</Link>
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/about" className="bg-[color-mix(in_srgb,var(--accent)_40%,transparent)] backdrop-blur-md px-4 py-2 rounded-lg shadow text-white">About Catholic Parishes</Link>
        </div>
      </main>

      {/* Centralized Lightbox */}
      <Lightbox />
    </div>
  );
}