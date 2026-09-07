import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Work_Sans } from "next/font/google";
import "./globals.css";
import "@liveblocks/react-ui/styles.css";
import { cn } from "@/lib/utils";
import { Room } from "./room";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kalpa",
  description:
    "A minimalist collaborative design tool using fabric.js and liveblocks for collaborative features.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        workSans.variable,
        geistSans.variable,
        geistMono.variable,
        "font-mono",
        jetbrainsMono.variable,
      )}
    >
      <body className={`${workSans.className} bg-primary-grey-200 `}>
        <Room>{children}</Room>
      </body>
    </html>
  );
}
