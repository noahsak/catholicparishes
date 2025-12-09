import { useEffect, useState } from "react";

export function usePersistentToggle(key, defaultValue = false) {
  const [open, setOpen] = useState(() => {
    const saved = sessionStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(open));
  }, [key, open]);

  return [open, setOpen];
}
