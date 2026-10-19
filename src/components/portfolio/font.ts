import { Caveat, IBM_Plex_Mono, Manrope } from "next/font/google";
export const portfolioFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-portfolio",
});

export const questionFont = Caveat({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-hand",
});

export const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});
