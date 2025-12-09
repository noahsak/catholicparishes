// src/hooks/useLiturgicalSeason.js
import { useEffect, useState } from "react";

export function useLiturgicalSeason() {
  const [season, setSeason] = useState(null);

  useEffect(() => {
    const fetchSeason = async () => {
      try {
        const res = await fetch("/data/romcal2025-2050.json");
        const data = await res.json();

        // Today's date (YYYY-MM-DD)
        const today = new Date().toLocaleDateString("en-CA");

        // Find today's entry
        const todayEntry = data.find((e) => e.date === today);

        if (todayEntry) {
          // ⬇️ CHANGE THIS LINE
          setSeason(todayEntry.seasons?.value || todayEntry.seasons?.key);
        } else {
          setSeason("Unknown Season");
        }
      } catch (error) {
        console.error("Failed to load liturgical season:", error);
        setSeason("Error");
      }
    };

    fetchSeason();
  }, []);

  return season;
}
