import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineSense | AI Movie Recommendations",
  description: "Discover your next favorite movie with CineSense. Powered by Machine Learning and TMDB for instant, personalized recommendations.",
  keywords: ["movies", "recommendations", "AI", "machine learning", "CineSense", "film"],
  authors: [{ name: "CineSense Team" }],
  openGraph: {
    title: "CineSense | AI Movie Recommendations",
    description: "Discover your next favorite movie with CineSense.",
    type: "website",
  },
};

import SmoothScroller from "@/components/SmoothScroller";
import AmbientCanvas from "@/components/AmbientCanvas";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <div className="relative w-full max-w-[100vw] overflow-hidden min-h-screen">
          <div className="noise-bg" />
          <AmbientCanvas />
          <SmoothScroller>
            {children}
          </SmoothScroller>
        </div>
      </body>
    </html>
  );
}