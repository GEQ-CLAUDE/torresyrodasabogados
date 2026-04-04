import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";

export async function Equipo() {
  const t = await getTranslations("equipo");

  const members = [
    {
      key: "david" as const,
      image: "/images/team-david.jpg",
      nameLine1: "Dr. David Fernando",
      nameLine2: "Torres Rodas",
    },
    {
      key: "tiberio" as const,
      image: "/images/team-tiberio.jpg",
      nameLine1: "Dr. Tiberio",
      nameLine2: "Torres Rodas",
    },
  ];

  return (
    <section id="equipo" className="py-24 px-[5%] bg-off-white max-sm:py-[70px] max-sm:px-[6%]">
      <div className="max-w-[560px] mb-16">
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
        <p className="text-base font-light leading-[1.8] text-text-mid mt-5">
          {t("intro")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {members.map((member) => (
          <ScrollReveal key={member.key} className="bg-white overflow-hidden">
            <div className="relative overflow-hidden group">
              <Image
                src={member.image}
                alt={t(`${member.key}.name`)}
                width={600}
                height={800}
                className="w-full aspect-[3/4] object-cover object-top block group-hover:scale-[1.04] transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[rgba(26,37,53,0.8)] to-transparent" />
            </div>
            <div className="py-7 px-8 pb-9 border-l-[3px] border-gold">
              <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-gold mb-2">
                {t("role")}
              </div>
              <div className="font-serif text-[28px] font-normal text-navy-deep mb-5 leading-[1.1]">
                {member.nameLine1}
                <br />
                {member.nameLine2}
              </div>
              <ul className="list-none p-0">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <li
                    key={n}
                    className="flex items-start gap-2.5 text-[13.5px] font-light leading-[1.55] text-text-mid py-[7px] border-b border-black/5 last:border-b-0"
                  >
                    <span className="w-[5px] h-[5px] min-w-[5px] rounded-full bg-gold mt-[7px]" />
                    <span>{t(`${member.key}.cred${n}`)}</span>
                  </li>
                ))}
              </ul>
              <div className="inline-flex items-center bg-navy-deep text-gold-light text-[11px] font-medium tracking-[0.1em] uppercase py-[7px] px-4 mt-5">
                {t(`${member.key}.exp`)}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
