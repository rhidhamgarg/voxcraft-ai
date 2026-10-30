import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "VoxCraft AI — Neural Voice Generation & Conversational Voice Platform",
  description:
    "Generate hyper-realistic speech, clone authentic voices from seconds of audio, and explore 17,500+ curated voices across 90+ languages with sub-250ms latency.",
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
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-brand-500/30 selection:text-brand-200">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
