import type { Metadata } from "next";
import { Karla, Playfair_Display_SC } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

const karla = Karla({ 
  subsets: ["latin"],
  variable: "--font-body",
});

const playfair = Playfair_Display_SC({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "WeBoosta | AI Decision Visualizer",
  description: "Optimize your hospitality presence for AI agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${karla.variable} ${playfair.variable} font-body bg-background text-text antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
