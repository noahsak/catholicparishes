// src/hooks/useLiturgicalName.js
import { useEffect, useState } from "react";

export function useLiturgicalName() {
  const [todayName, setTodayName] = useState(null);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await fetch("/data/romcal2025-2050.json");
        const data = await res.json();

        // Get today's date as YYYY-MM-DD
        const today = new Date().toLocaleDateString("en-CA"); // User-local YYYY-MM-DD

        // Find today's entry
        const todayEntry = data.find((e) => e.date === today);

        if (todayEntry) {
          setTodayName(todayEntry.name);
        } else {
          setTodayName("Unknown Celebration");
        }
      } catch (error) {
        console.error("Failed to load liturgical name:", error);
        setTodayName("Error");
      }
    };

    fetchToday();
  }, []);

  return todayName;
}
