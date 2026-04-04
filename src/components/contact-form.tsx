"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactForm() {
  const t = useTranslations("contact");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t("formSuccess"));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[11px] font-medium tracking-[0.14em] uppercase text-white/50 mb-2">
            {t("formName")}
          </label>
          <Input
            type="text"
            placeholder={t("formNamePlaceholder")}
            className="w-full bg-white/[0.06] border-gold/25 text-white font-light text-sm px-4 py-3.5 rounded-none focus:border-gold placeholder:text-white/30"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium tracking-[0.14em] uppercase text-white/50 mb-2">
            {t("formPhone")}
          </label>
          <Input
            type="tel"
            placeholder={t("formPhonePlaceholder")}
            className="w-full bg-white/[0.06] border-gold/25 text-white font-light text-sm px-4 py-3.5 rounded-none focus:border-gold placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-medium tracking-[0.14em] uppercase text-white/50 mb-2">
          {t("formEmail")}
        </label>
        <Input
          type="email"
          placeholder={t("formEmailPlaceholder")}
          className="w-full bg-white/[0.06] border-gold/25 text-white font-light text-sm px-4 py-3.5 rounded-none focus:border-gold placeholder:text-white/30"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-medium tracking-[0.14em] uppercase text-white/50 mb-2">
          {t("formArea")}
        </label>
        <Select>
          <SelectTrigger className="w-full bg-white/[0.06] border-gold/25 text-white font-light text-sm px-4 py-3.5 rounded-none focus:border-gold h-auto">
            <SelectValue placeholder={t("formAreaDefault")} />
          </SelectTrigger>
          <SelectContent className="bg-navy-deep border-gold/25">
            <SelectItem value="tax">{t("formAreaTax")}</SelectItem>
            <SelectItem value="admin">{t("formAreaAdmin")}</SelectItem>
            <SelectItem value="public">{t("formAreaPublic")}</SelectItem>
            <SelectItem value="comptroller">{t("formAreaComptroller")}</SelectItem>
            <SelectItem value="business">{t("formAreaBusiness")}</SelectItem>
            <SelectItem value="other">{t("formAreaOther")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-medium tracking-[0.14em] uppercase text-white/50 mb-2">
          {t("formDescription")}
        </label>
        <Textarea
          placeholder={t("formDescPlaceholder")}
          className="w-full bg-white/[0.06] border-gold/25 text-white font-light text-sm px-4 py-3.5 rounded-none focus:border-gold min-h-[110px] resize-y placeholder:text-white/30"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gold text-navy-deep border-none py-4 text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer hover:bg-gold-light transition-colors mt-2"
      >
        {t("formSubmit")}
      </button>
    </form>
  );
}
