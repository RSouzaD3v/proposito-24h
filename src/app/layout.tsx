import type { Metadata } from "next";
import { Fraunces, Manrope, Merriweather } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });
const font = Merriweather({
  weight: '400',
  subsets: ['latin']
})

const readerSerif = Fraunces({ subsets: ["latin"], variable: "--font-reader-serif" });
const readerSans = Manrope({ subsets: ["latin"], variable: "--font-reader-sans" });

export const metadata: Metadata = {
  title: "DevotionalApp",
  description: "Uma plataforma para escritores publicarem devocionais. E leitores encontrarem devocionais inspiradores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${readerSerif.variable} ${readerSans.variable}`}>
      <body
        className={`${font.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
