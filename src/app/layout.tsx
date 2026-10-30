import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoxCraft AI — Neural Audio & Speech Studio",
  description:
    "Generate hyper-realistic speech, clone authentic voices, and explore curated neural voices with sub-second Kokoro-82M synthesis.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex-1 overflow-x-hidden">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
