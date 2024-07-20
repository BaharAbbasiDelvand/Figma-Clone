import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";

const inter = Inter({ subsets: ["latin"], weight:['400', '600','700']});

export const metadata: Metadata = {
  title: "Figna Clone",
  description: "Figma 2.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-primary-grey-200`}>
        <Room>{children}</Room>
        
        </body>
    </html>
  );
}
