import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";
import { ContactForm } from "./contact-form";

export async function Contact() {
  const t = await getTranslations("contact");

  return (
    <section id="contacto" className="py-24 px-[5%] bg-navy-deep max-sm:py-[70px] max-sm:px-[6%]">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
        <ScrollReveal>
          {/* Address */}
          <div className="mb-7">
            <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-gold mb-2">
              {t("addressLabel")}
            </div>
            <div className="text-[15px] font-light text-white/80 leading-[1.6] whitespace-pre-line">
              {t("address")}
            </div>
          </div>

          {/* Map */}
          <div className="border border-gold/25 overflow-hidden mt-2">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.296!2d-78.9971!3d-2.9062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91cd18065c2d7265%3Aa1b2c3d4e5f60000!2sAv.%20Paucarbamba%203-142%20y%20Francisco%20Sojos%2C%20Cuenca!5e0!3m2!1ses!2sec!4v1680000000000!5m2!1ses!2sec"
              className="w-full h-[220px] border-none block grayscale-[30%] contrast-[1.05]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Torres & Rodas Abogados"
            />
          </div>
          <a
            href="https://maps.google.com/?q=Av.+Paucarbamba+3-142+y+Francisco+Sojos,+Cuenca,+Ecuador"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.1em] uppercase text-gold-light no-underline border border-gold/30 py-2.5 px-4 hover:border-gold hover:text-gold transition-all mt-2.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t("openMaps")}
          </a>

          {/* Phone, Email, Hours */}
          <div className="mt-7">
            <div className="mb-7">
              <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-gold mb-2">
                {t("phoneLabel")}
              </div>
              <div className="text-[15px] font-light text-white/80">
                <a href="https://wa.me/593995985515" className="text-gold-light no-underline hover:underline">
                  {t("phone")}
                </a>
              </div>
              <div className="text-[15px] font-light text-white/80 mt-1">
                <a href="https://wa.me/593984365799" className="text-gold-light no-underline hover:underline">
                  {t("phone2")}
                </a>
              </div>
            </div>
            <div className="mb-7">
              <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-gold mb-2">
                {t("emailLabel")}
              </div>
              <div className="text-[15px] font-light text-white/80">
                <a href={`mailto:${t("email")}`} className="text-gold-light no-underline hover:underline">
                  {t("email")}
                </a>
              </div>
            </div>
            <div className="mb-7">
              <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-gold mb-2">
                {t("hoursLabel")}
              </div>
              <div className="text-[15px] font-light text-white/80 leading-[1.6] whitespace-pre-line">
                {t("hours")}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <ContactForm />
        </ScrollReveal>
      </div>
    </section>
  );
}
