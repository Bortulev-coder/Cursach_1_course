import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ТиксоЛаб — от структуры к эксперименту",
  description: "Три методики получения тиксотропных систем, интерактивная модель и план исследования для курсовой работы.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
