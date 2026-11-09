import { PageTransition } from "@/components/portfolio/page-transition";
import { ThemeProvider } from "@/components/theme-provider";
import { DATA } from "@/data/resume";
import { feedAlternate, SITE_TITLE } from "@/lib/structured-data";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";

// Allows the hero's CSS intro only when motion is allowed; it runs from first
// paint without scripts, and `intro-done` on <html> retires it.
const motionGate = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion-ok")`;

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: SITE_TITLE,
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  applicationName: DATA.name,
  authors: [{ name: DATA.name, url: DATA.url }],
  creator: DATA.name,
  alternates: { types: feedAlternate },
  openGraph: {
    title: SITE_TITLE,
    description: DATA.description,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: "en_GB",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: SITE_TITLE,
    description: DATA.description,
    card: "summary_large_image",
    creator: "@AgrawalHridaya",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
        >
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
