import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ScrollNav } from "./scroll-nav";
import { MobileNav } from "./mobile-nav";
import { LanguageSwitcher } from "./language-switcher";

export async function Nav() {
  const t = await getTranslations("nav");

  return (
    <ScrollNav>
      <a href="#inicio">
        <Image
          src="/images/nav-logo.png"
          alt="Torres & Rodas Abogados"
          width={172}
          height={104}
          style={{ width: "auto", height: "50px" }}
          className="object-contain"
          priority
        />
      </a>

      <ul className="hidden md:flex gap-10 list-none">
        {(["firma", "areas", "equipo", "proceso", "contacto"] as const).map(
          (key) => (
            <li key={key}>
              <a
                href={`#${key}`}
                className="text-white/80 text-[13px] font-medium tracking-[0.12em] uppercase hover:text-gold-light transition-colors no-underline"
              >
                {t(key)}
              </a>
            </li>
          )
        )}
      </ul>

      <div className="flex items-center gap-6">
        <LanguageSwitcher />
        <a
          href={process.env.NEXT_PUBLIC_BOOKING_URL ?? "/booking"}
          className="hidden sm:inline-block border border-gold text-gold-light px-6 py-2.5 text-xs font-medium tracking-[0.12em] uppercase hover:bg-gold hover:text-navy-deep transition-all no-underline whitespace-nowrap"
        >
          {t("cta")}
        </a>
        <MobileNav />
      </div>
    </ScrollNav>
  );
}
