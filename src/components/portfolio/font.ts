import { Caveat, Manrope } from "next/font/google";
export const portfolioFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-portfolio",
});

export const questionFont = Caveat({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
