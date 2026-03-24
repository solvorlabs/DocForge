import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import NavBar from "@/components/NavBar";
import { BackdropFX } from "@/components/effects/BackdropFX";
import { CursorAura } from "@/components/effects/CursorAura";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DocForge — AI-ready context files for any library",
  description: "Generate prompt-ready .context.md files pinned to your exact library version.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/docforge.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/docforge.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <BackdropFX />
          <CursorAura />
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
