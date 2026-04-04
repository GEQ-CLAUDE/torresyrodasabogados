import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";

export async function Proceso() {
  const t = await getTranslations("proceso");

  const steps = [
    { num: "01", title: t("step1Title"), desc: t("step1Desc") },
    { num: "02", title: t("step2Title"), desc: t("step2Desc") },
    { num: "03", title: t("step3Title"), desc: t("step3Desc") },
    { num: "04", title: t("step4Title"), desc: t("step4Desc") },
  ];

  return (
    <section id="proceso" className="py-24 px-[5%] bg-white max-sm:py-[70px] max-sm:px-[6%]">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mt-16 max-sm:gap-10">
        {steps.map((step, i) => (
          <ScrollReveal
            key={step.num}
            className={`pr-8 relative ${
              i < 3
                ? "after:content-[''] after:absolute after:top-0 after:right-3 after:w-px after:h-full after:bg-gold-border max-sm:after:hidden"
                : ""
            }`}
          >
            <div className="font-serif text-[52px] font-light text-gold opacity-40 leading-none mb-3.5">
              {step.num}
            </div>
            <div className="w-full h-0.5 bg-navy-deep mb-5 relative before:content-[''] before:absolute before:left-0 before:-top-[3px] before:w-2 before:h-2 before:bg-gold before:rounded-full" />
            <h4 className="font-serif text-[22px] font-semibold text-navy-deep mb-3 leading-[1.2]">
              {step.title}
            </h4>
            <p className="text-sm font-normal leading-[1.75] text-text-mid">
              {step.desc}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
