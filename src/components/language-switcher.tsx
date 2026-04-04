"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center border border-gold/40 overflow-hidden">
      <Link
        href={pathname}
        locale="es"
        className={`text-[11px] font-medium tracking-[0.1em] px-3 py-1.5 uppercase transition-all no-underline ${
          locale === "es"
            ? "bg-gold text-navy-deep"
            : "text-white/50 hover:text-gold-light"
        }`}
      >
        ES
      </Link>
      <Link
        href={pathname}
        locale="en"
        className={`text-[11px] font-medium tracking-[0.1em] px-3 py-1.5 uppercase transition-all no-underline ${
          locale === "en"
            ? "bg-gold text-navy-deep"
            : "text-white/50 hover:text-gold-light"
        }`}
      >
        EN
      </Link>
    </div>
  );
}
