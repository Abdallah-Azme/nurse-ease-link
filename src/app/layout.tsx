import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { FcmRegistration } from "@/components/notifications/fcm-registration";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CareConnect — Modern patient monitoring platform",
  description: "A connected care platform for patients, nurses, doctors, and admins.",
  manifest: "/manifest.webmanifest",
  applicationName: "CareConnect",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CareConnect",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#172127" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`}>
        <Providers>
          <FcmRegistration />
          {children}
        </Providers>
      </body>
    </html>
  );
}
