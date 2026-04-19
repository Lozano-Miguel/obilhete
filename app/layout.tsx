import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "O Bilhete — Conhece o Teu Gosto",
  description:
    "Descobre a tua personalidade cinéfila e recebe recomendações com base no teu perfil Letterboxd.",
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
