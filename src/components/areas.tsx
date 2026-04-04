import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";

export async function Areas() {
  const t = await getTranslations("areas");

  const areas = [
    { num: "01", title: t("area1Title"), desc: t("area1Desc") },
    { num: "02", title: t("area2Title"), desc: t("area2Desc") },
    { num: "03", title: t("area3Title"), desc: t("area3Desc") },
    { num: "04", title: t("area4Title"), desc: t("area4Desc") },
    { num: "05", title: t("area5Title"), desc: t("area5Desc") },
    { num: "06", title: t("area6Title"), desc: t("area6Desc") },
  ];

  return (
    <section id="areas" className="py-24 px-[5%] bg-navy-deep max-sm:py-[70px] max-sm:px-[6%]">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-8 h-px bg-gold" />
        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-gold">
          {t("eyebrow")}
        </span>
      </div>
      <h2 className="font-serif text-[clamp(34px,4.5vw,54px)] font-light leading-[1.12] text-white">
        {t("titlePart1")}
        <br />
        <em className="italic text-gold-light">{t("titlePart2")}</em>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gold/15 mt-16">
        {areas.map((area) => (
          <ScrollReveal
            key={area.num}
            className="bg-navy-deep p-12 px-9 hover:bg-navy-mid transition-colors duration-300"
          >
            <div className="font-serif text-[13px] font-light text-gold tracking-[0.1em] mb-5">
              {area.num}
            </div>
            <div className="w-7 h-px bg-gold my-5" />
            <h3 className="font-serif text-[26px] font-normal text-white mb-3.5 leading-[1.2]">
              {area.title}
            </h3>
            <p className="text-sm font-light leading-[1.75] text-white/55">
              {area.desc}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
