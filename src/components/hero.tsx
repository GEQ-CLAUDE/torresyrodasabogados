import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      id="inicio"
      className="min-h-screen relative flex items-center justify-center overflow-hidden bg-navy-deep"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-[center_25%]"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,25,38,0.55)] via-[rgba(15,25,38,0.4)] to-[rgba(15,25,38,0.78)]" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(15,25,38,0.65)_0%,rgba(15,25,38,0.2)_60%,rgba(15,25,38,0.55)_100%)]" />

      {/* Corner brackets */}
      <div className="absolute w-[70px] h-[70px] border-gold/40 border-solid z-[3] top-[100px] left-[5%] border-t border-l" />
      <div className="absolute w-[70px] h-[70px] border-gold/40 border-solid z-[3] top-[100px] right-[5%] border-t border-r" />
      <div className="absolute w-[70px] h-[70px] border-gold/40 border-solid z-[3] bottom-20 left-[5%] border-b border-l" />
      <div className="absolute w-[70px] h-[70px] border-gold/40 border-solid z-[3] bottom-20 right-[5%] border-b border-r" />

      {/* Content */}
      <div className="relative z-[4] text-center px-[5%] pt-36 pb-40 max-w-[820px] max-sm:pt-28 max-sm:pb-20">
        <div className="mb-9 flex justify-center">
          <Image
            src="/images/hero-logo.png"
            alt="Torres & Rodas Abogados"
            width={260}
            height={130}
            style={{ width: "auto", height: "auto" }}
            className="h-[130px] max-sm:h-[90px] object-contain"
            priority
          />
        </div>

        <div className="flex items-center gap-5 justify-center mb-8">
          <div className="flex-1 max-w-[70px] h-px bg-gold" />
          <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-gold">
            {t("location")}
          </span>
          <div className="flex-1 max-w-[70px] h-px bg-gold" />
        </div>

        <h1 className="font-serif text-[clamp(38px,5.5vw,68px)] font-light leading-[1.1] text-white mb-6 [text-shadow:0_2px_20px_rgba(0,0,0,0.4)]">
          {t("titlePart1")} <em className="italic text-gold-light">{t("titleEmphasis")}</em>
          <br />
          {t("titlePart2")}
        </h1>

        <p className="text-base font-light leading-[1.8] text-white/75 max-w-[580px] mx-auto mb-10 [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">
          {t("description")}
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="#contacto"
            className="bg-gold text-navy-deep px-9 py-4 text-xs font-semibold tracking-[0.14em] uppercase no-underline hover:bg-gold-light transition-all inline-block"
          >
            {t("ctaPrimary")}
          </a>
          <a
            href="#areas"
            className="bg-white/[0.07] backdrop-blur-sm text-white/90 px-9 py-4 text-xs font-medium tracking-[0.14em] uppercase no-underline border border-white/35 hover:border-gold hover:text-gold-light transition-all inline-block"
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 flex border-t border-gold/25 z-[4] bg-[rgba(15,25,38,0.7)] backdrop-blur-lg max-md:hidden">
        {[
          { value: t("stat1Value"), label: t("stat1Label") },
          { value: t("stat2Value"), label: t("stat2Label") },
          { value: t("stat3Value"), label: t("stat3Label") },
          { value: t("stat4Value"), label: t("stat4Label") },
        ].map((stat, i) => (
          <div
            key={i}
            className={`flex-1 py-6 px-[5%] ${i < 3 ? "border-r border-gold/20" : ""}`}
          >
            <div className="font-serif text-4xl font-light text-gold-light leading-none mb-1">
              {stat.value}
            </div>
            <div className="text-[11px] font-normal tracking-[0.1em] text-white/45 uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
