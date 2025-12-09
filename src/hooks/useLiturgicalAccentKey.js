// src/hooks/useLiturgicalAccentKey.js
import { useEffect, useState } from "react";
import { accentColors, darkAccentColors } from "../liturgicalColors";

export function useLiturgicalAccentKey() {
  const [colorKey, setColorKey] = useState("GREEN");

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await fetch("/data/romcal2025-2050.json");
        const data = await res.json();
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const todayEntry = data.find((entry) => entry.date === todayStr);
        setColorKey(todayEntry?.liturgicalColors?.key || "GREEN");

        // Also update --accent globally
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const colorHex = isDark
          ? darkAccentColors[todayEntry?.liturgicalColors?.key] || "#074b07ff"
          : accentColors[todayEntry?.liturgicalColors?.key] || "#0d5c0dff";
        document.documentElement.style.setProperty("--accent", colorHex);
      } catch (err) {
        console.error("Failed to load Romcal data", err);
      }
    };

    fetchToday();
  }, []);

  return colorKey;
}
