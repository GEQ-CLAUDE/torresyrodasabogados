import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asistente Jurídico IA | Torres & Rodas Abogados",
  description:
    "Asistente jurídico interno especializado en derecho ecuatoriano — Torres & Rodas Abogados.",
  robots: "noindex, nofollow",
};

export default function AsistenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
