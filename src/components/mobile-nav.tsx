"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslations } from "next-intl";

export function MobileNav() {
  const t = useTranslations("nav");

  return (
    <Sheet>
      <SheetTrigger className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer" aria-label="Menu">
        <span className="w-5 h-0.5 bg-white/80 block" />
        <span className="w-5 h-0.5 bg-white/80 block" />
        <span className="w-5 h-0.5 bg-white/80 block" />
      </SheetTrigger>
      <SheetContent side="right" className="bg-navy-deep border-gold/20 w-72">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <nav className="flex flex-col gap-6 mt-8">
          {(["firma", "areas", "equipo", "proceso", "contacto"] as const).map(
            (key) => (
              <a
                key={key}
                href={`#${key}`}
                className="text-white/80 text-sm font-medium tracking-[0.12em] uppercase hover:text-gold-light transition-colors"
              >
                {t(key)}
              </a>
            )
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
