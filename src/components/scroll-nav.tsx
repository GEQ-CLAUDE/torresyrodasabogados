"use client";

import { useEffect, useState } from "react";

export function ScrollNav({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-[5%] bg-navy-deep/97 backdrop-blur-[12px] border-b border-gold/20 transition-all duration-300 ${
        scrolled ? "h-16" : "h-20"
      }`}
    >
      {children}
    </nav>
  );
}
