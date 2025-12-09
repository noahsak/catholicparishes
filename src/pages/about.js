import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiturgicalAccentKey } from "../hooks/useLiturgicalAccentKey";
import { useLiturgicalName } from "../hooks/useLiturgicalName";
import { useLiturgicalSeason } from "../hooks/useLiturgicalSeason";

export default function About() {
  const navigate = useNavigate();

  // Get the current liturgical colour key
  const accentKey = useLiturgicalAccentKey(); // returns "GREEN", "RED", etc.

  const todayName = useLiturgicalName();

  const todaySeason = useLiturgicalSeason();

  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" &&
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

  const email = "contact@catholicparishes.org"; // replace with your email

  // Capitalize the first letter of the color for display
  const displayColor = accentKey
    ? accentKey.charAt(0) + accentKey.slice(1).toLowerCase()
    : "Loading...";

  return (
    <div className="min-h-screen relative flex flex-col text-white">
      <div
        className="absolute inset-0 bg-center bg-cover transition-all duration-500"
        style={{ backgroundImage: `url('${banner}')` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="h-64 md:h-80 flex items-end">
        <div className="w-full bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-lg">
              About Catholic Parishes
            </h1>
          </div>
        </div>
      </div>

      <main
        className="
          max-w-4xl mx-auto p-6 space-y-8
          bg-[color-mix(in_srgb,var(--accent)_40%,transparent)]
          dark:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]
          backdrop-blur-md rounded-2xl mt-6
        "
      >
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/")
          }
          className="text-sm"
        >
          ← Back
        </button>

        {/* Mission */}
        <section>
          <p className="mt-2 text-white">
            Catholic Parishes is a project created by me, Noah, a University student in Ontario, Canada. My goal for this website is to make it easier for people to participate in the sacraments and find the churches where they take place, whether at home or traveling.
            <br /><br />
            Currently, only the parishes in the Diocese of London have been inputted into the website's database, but I am slowly working on adding more. Eventually, I hope to include parishes from across the world.
            <br /><br />
            If you would like to contribute in any way (providing photos, data, website development, etc.), please reach out to me at {" "}
            <a
              href={`mailto:${email}`}
              className="underline text-blue-300 hover:text-blue-400"
            >
              {email}
            </a>.
            Thank you and God bless!
          </p>
        </section>

        {/* Why Liturgical Colour? */}
        <section>
          <h2 className="text-xl font-semibold">Why <strong>{displayColor}</strong>?</h2>
          {/* Today’s Liturgical Celebration Box (accent themed) */}
          <div
            className="mt-3 p-4 rounded-xl shadow text-white"
            style={{
              border: "2px solid var(--accent)",
              boxShadow: "0 0 12px var(--accent)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <h3 className="text-lg font-semibold text-white">
              Today’s Celebration
            </h3>
            <p className="text-m mt-1 text-white">
              {todayName || "Loading..."}
            </p>
            <p className="mt-3 border-t border-white/0" />
            <h3 className="text-lg font-semibold text-white">
              Liturgical Season
            </h3>
            <p className="text-m mt-1 text-white">
              {todaySeason || "Loading..."}
            </p>
          </div>
          <p className="mt-2 text-white">
            As you can see, the site's accent colour is currently{" "}
            <span
              className="font-bold capitalize"
            >
              {displayColor}
            </span>.
            <br /><br />
            This will not be true forever. The accent colour of this site changes according to the liturgical calendar of the Catholic Church and whether or not it is a solemnity or feast day. My goal is to, for the most part, have the colour be the same as the vestments worn by the priest on any given day. The database I used for that was {" "}
            <a 
              href="https://romcal.js.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline text-blue-400 hover:text-blue-300"
            >
              romcal
            </a>
            , which is an awesome JavaScript library of the liturgical calendar for the Catholic Church.
          </p>
        </section>


        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2 text-white">
            Corrections, suggestions, or parish updates are always welcome. I am definitely not perfect (in many ways), and I truly appreciate any help in making this project more accurate and more useful.
          </p>

          <div className="flex justify-center mt-4">
          <Link
            to="/contact"
            className="
              px-5 py-2 rounded-lg text-white font-medium
              hover:bg-white/20 transition
              no-underline
            "
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
            }}


          >
            Suggestions / Corrections
          </Link>
          </div>
        </section>

        {/*Which Dioceses are Next?*/}
        <section>
          <h2 className="text-xl font-semibold">Which Dioceses are Next?</h2>
          <p className="mt-2 text-white">
            I am always working on adding more parishes to the map. The parishes from these dioceses are next on my list:
            <ul className="list-disc list-inside mt-2">
              <li>Diocese of Hamilton</li>
              <li>Diocese of St. Catharines</li>
              <li>Archdiocese of Toronto</li>
            Like I said, I am always looking for help, so if you would like to see your diocese added sooner and want to help make that happen, please reach out to me at {" "}
            <a
              href={`mailto:${email}`}
              className="underline text-blue-300 hover:text-blue-400"
            >
              {email}
            </a>.
            </ul>
          </p>
        </section>

        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 text-white rounded hover:bg-blue-700 transition"
        >
          ← Back to Map
        </Link>
      </main>
    </div>
  );
}
