import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Firma } from "@/components/firma";
import { Areas } from "@/components/areas";
import { Equipo } from "@/components/equipo";
import { Proceso } from "@/components/proceso";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { AiChat } from "@/components/ai-chat";

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <Firma />
      <Areas />
      <Equipo />
      <Proceso />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <AiChat />
    </>
  );
}
