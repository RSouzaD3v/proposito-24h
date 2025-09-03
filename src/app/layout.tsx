import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
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
    <html lang="en">
      <body
        className={`${font.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
