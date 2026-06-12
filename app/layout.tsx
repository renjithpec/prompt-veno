import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Caveat } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-hand", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050505"
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(absoluteUrl()),
    title: {
      default: settings.site_title,
      template: `%s | ${settings.site_title}`
    },
    description: settings.site_description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/logo-icon.svg"
    },
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.site_title,
      description: settings.site_description,
      url: absoluteUrl(),
      siteName: settings.site_title,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_title,
      description: settings.site_description
    }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${caveat.variable} font-sans`} suppressHydrationWarning>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
