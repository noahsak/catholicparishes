import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Contact() {
  const email = "photos@catholicparishes.org";
  const contactEmail = "contact@catholicparishes.org";
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const banner =
    "https://ik.imagekit.io/catholicparishes/parishes/canada/diocese_of_london/windsor/ourladyofperpetualhelp.jpg";

  // Correct: just the embed URL, not a JSX iframe
  const googleFormURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfutTTbPnDW-GP0wMhvJw4Lyst98XJm_gGZ6V3uTnw_5yAr1g/viewform?embedded=true";

  return (
    <div className="min-h-screen relative flex flex-col text-white">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover transition-all duration-500"
        style={{ backgroundImage: `url('${banner}')` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Header Banner */}
      <div className="h-48 md:h-64 flex items-end">
        <div className="w-full bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-lg">
              Contact / Suggestions / Errors
            </h1>
            <p className="text-sm text-white mt-1 drop-shadow">
              Have feedback, corrections, or photos? Let me know!
            </p>
          </div>
        </div>
      </div>

      {/* Frosted-glass content */}
      <main
        className="
          max-w-4xl mx-auto p-6 mt-6 rounded-2xl
          bg-[color-mix(in_srgb,var(--accent)_40%,transparent)]
          dark:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]
          backdrop-blur-md
        "
      >
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/")
          }
          className="text-sm mb-4"
        >
          ← Back
        </button>

        <section>
          <h2 className="text-xl font-semibold">Report an Error or Suggest an Improvement</h2>
          <p className="text-white mb-4">
            To report an error or suggest a feature you would like to see,
            please fill out the form below. If for whatever reason the form
            does not load below, you can also use this {" "}
            <a
              href={googleFormURL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-300 hover:text-blue-400"
            >
              link
            </a>
            . If you just want to send me an email, you can reach me at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="underline text-blue-300 hover:text-blue-400"
            >
              {contactEmail}
            </a>
            .
          </p>
        </section>

        {/* Google Form Embed */}
        <div className="w-full flex justify-center">
        <iframe
            src={googleFormURL}
            style={{
            border: "2px solid var(--accent)",
            boxShadow: "0 0 12px var(--accent)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            width: "100%",
            maxWidth: "750px",     // Google Forms default width
            minHeight: "750px",   // reduces the giant vertical space
            }}
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            className="rounded-xl shadow-xl bg-[rgba(128,128,128,0.8)]"
            title="Contact Form"
        >
            Loading…
        </iframe>
        </div>




        <section>
          <h2 className="text-xl font-semibold mt-6">Uploading a Photo</h2>
          <p className="text-white mb-4">
            If a parish does not have a photo or has an outdated photo and you
            would like to contribute one, please email it to{" "}
            <a
              href={`mailto:${email}`}
              className="underline text-blue-300 hover:text-blue-400"
            >
              {email}
            </a>
            . Please include the parish name, city, and diocese. Thank you! {":)"}
          </p>
        </section>

        <Link
          to="/"
          className="inline-block mt-6 px-4 py-2 text-white rounded hover:bg-blue-700 transition"
        >
          ← Back to Map
        </Link>
      </main>
    </div>
  );
}