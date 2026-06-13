import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Caveat } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { RewardPopup } from "@/components/reward-popup";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  
  const supabase = await createSupabaseServerClient();
  let hasClaimedDaily = false;
  let userId = null;
  
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      const { data } = await supabase
        .from("coin_transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("reason", "Daily Check-in")
        .gte("created_at", today.toISOString())
        .limit(1);
        
      if (data && data.length > 0) {
        hasClaimedDaily = true;
      }
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${caveat.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="overflow-hidden w-full relative min-h-screen">
            {/* Animated Background Motion Element */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[100px] animate-blob" />
              <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[100px] animate-blob animation-delay-2000" />
              <div className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-accent/10 blur-[120px] animate-blob animation-delay-4000" />
            </div>

            <div className="flex min-h-screen max-w-full">
              <SiteHeader />
              <div className="flex-1 flex flex-col min-h-screen min-w-0 pt-20 md:pt-0 md:pl-[100px] xl:pl-[280px] transition-all duration-300">
                <main className="flex-1 min-w-0">{children}</main>
                <SiteFooter settings={settings} />
              </div>
            </div>
            <RewardPopup initialHasClaimed={hasClaimedDaily} userId={userId} />
          </div>
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
