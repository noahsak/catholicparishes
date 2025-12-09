// src/hooks/CollapsibleSection.js
import React from "react";
import { usePersistentToggle } from "./usePersistentToggle";

export default function CollapsibleSection({ title, count, id, children }) {
  // Persistent open/closed state
  const [open, setOpen] = usePersistentToggle(`collapse-${id}`, false);

  return (
    <section
      className="
        border border-gray-300/50 rounded-xl overflow-hidden
        bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]
        dark:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]
      "
      style={{
        border: "2px solid var(--accent)",
        boxShadow: "0 0 12px var(--accent)",
        backgroundColor: "rgba(255,255,255,0.05)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 text-left"
      >
        <h2 className="text-xl font-semibold">
          {title} {count !== undefined && `— ${count}`}
        </h2>
        <span className={`transform transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
      </button>

      <div
        className={`transition-all duration-300 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded ${
          open ? "max-h-[70vh] opacity-100 px-6 pb-4" : "max-h-0 opacity-0 px-6 pb-0"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
