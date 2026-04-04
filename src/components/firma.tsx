import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";

export async function Firma() {
  const t = await getTranslations("firma");

  const values = [
    { title: t("value1Title"), desc: t("value1Desc") },
    { title: t("value2Title"), desc: t("value2Desc") },
    { title: t("value3Title"), desc: t("value3Desc") },
    { title: t("value4Title"), desc: t("value4Desc") },
  ];

  return (
    <section id="firma" className="py-24 px-[5%] bg-white max-sm:py-[70px] max-sm:px-[6%]">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-8 h-px bg-gold" />
        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold">
          {t("eyebrow")}
        </span>
      </div>
      <h2 className="font-serif text-[clamp(34px,4.5vw,54px)] font-light leading-[1.12] text-navy-deep">
        {t("titlePart1")}
        <br />
        <em className="italic text-navy-mid">{t("titlePart2")}</em>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-12 mt-16 items-start">
        <ScrollReveal>
          <p className="text-base font-light leading-[1.85] text-text-mid mb-5">
            {t("p1")}
          </p>
          <p className="text-base font-light leading-[1.85] text-text-mid mb-5">
            {t("p2")}
          </p>
          <p className="text-base font-light leading-[1.85] text-text-mid">
            {t("p3")}
          </p>
        </ScrollReveal>

        <ScrollReveal className="relative">
          <div className="relative overflow-hidden bg-navy-deep">
            <Image
              src="/images/firma-photo.jpg"
              alt={t("photoAlt")}
              width={600}
              height={400}
              className="block w-full object-contain object-top"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 w-1/2 h-[40%] border border-gold -z-10 pointer-events-none" />
        </ScrollReveal>
      </div>

      {/* Values grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gold-border mt-16 border border-gold-border">
        {values.map((v, i) => (
          <ScrollReveal key={i} className="bg-white p-8 px-7">
            <div className="text-xl mb-3 text-gold">&#x25C8;</div>
            <h4 className="font-serif text-xl font-normal text-navy-deep mb-2">
              {v.title}
            </h4>
            <p className="text-sm font-light leading-[1.7] text-text-muted">
              {v.desc}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
