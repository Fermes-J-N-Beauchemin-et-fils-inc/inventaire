"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface DbHealthContextType {
  isDbDown: boolean;
  checkHealth: () => Promise<void>;
}

const DbHealthContext = createContext<DbHealthContextType>({
  isDbDown: false,
  checkHealth: async () => {},
});

export const useDbHealth = () => useContext(DbHealthContext);

export function DbHealthProvider({ children }: { children: React.ReactNode }) {
  const [isDbDown, setIsDbDown] = useState(false);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) {
        setIsDbDown(true);
      } else {
        setIsDbDown(false);
      }
    } catch (error) {
      console.error("Failed to fetch health status", error);
      setIsDbDown(true);
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    // Re-check when window regains focus
    const handleFocus = () => checkHealth();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <DbHealthContext.Provider value={{ isDbDown, checkHealth }}>
      {children}
    </DbHealthContext.Provider>
  );
}
