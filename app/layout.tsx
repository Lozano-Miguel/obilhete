import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
  title: "O Bilhete — Descobre o que ver a seguir",
  description:
    "Descobre a tua personalidade cinéfila e recebe recomendações com base no teu perfil Letterboxd.",
  openGraph: {
    title: "O Bilhete — Descobre o que ver a seguir",
    description:
      "Introduz o teu perfil do Letterboxd e descobre o teu retrato cinéfilo, com recomendações à tua medida.",
    type: "website",
    locale: "pt_PT",
  },
  twitter: {
    card: "summary_large_image",
    title: "O Bilhete — Descobre o que ver a seguir",
    description:
      "Introduz o teu perfil do Letterboxd e descobre o teu retrato cinéfilo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={geistSans.variable}>
      <body className="min-h-screen bg-bilhete-bg font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
