import { useEffect } from "react";
import { accentColors, darkAccentColors } from "../liturgicalColors";
import { iconPaths } from "../data/iconPaths";

export function useLiturgicalAccent() {
  useEffect(() => {
    const setAccentForToday = async () => {
      try {
        const res = await fetch("/data/romcal2025-2050.json");
        const data = await res.json();

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const todayEntry = Array.isArray(data) ? data.find((entry) => entry.date === todayStr) : null;
        const colorKey = (todayEntry?.liturgicalColors?.key || "PURPLE").toUpperCase();

        const isDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

        const colorHex = isDark
          ? darkAccentColors[colorKey] || "#BB86FC"
          : accentColors[colorKey] || "#FFFFFF";

        document.documentElement.style.setProperty("--accent", colorHex);

        // update favicon + apple-touch-icon based on colorKey + theme
        const iconEntry = iconPaths[colorKey] || iconPaths["PURPLE"] || null;
        const iconHref = iconEntry ? iconEntry[isDark ? "dark" : "light"] : null;

        if (iconHref && typeof document !== "undefined") {
          const setOrCreate = (relName, relValue) => {
            let el = document.querySelector(`link[rel="${relName}"]`);
            if (!el) {
              el = document.createElement("link");
              el.setAttribute("rel", relValue);
              document.head.appendChild(el);
            }
            el.href = iconHref;
          };

          setOrCreate("icon", "icon");
          setOrCreate("apple-touch-icon", "apple-touch-icon");
        }
      } catch (err) {
        console.error("Failed to load Romcal data", err);
      }
    };

    setAccentForToday();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setAccentForToday();
    if (mediaQuery.addEventListener) mediaQuery.addEventListener("change", listener);
    else mediaQuery.addListener && mediaQuery.addListener(listener);

    return () => {
      if (mediaQuery.removeEventListener) mediaQuery.removeEventListener("change", listener);
      else mediaQuery.removeListener && mediaQuery.removeListener(listener);
    };
  }, []);
}