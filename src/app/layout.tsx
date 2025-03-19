import { type ReactNode } from "react";
import { type Metadata } from "next";
import { Exo_2 } from "next/font/google";
import { Navbar } from "@/_components_/navbar";
import { Providers } from "@/ctx/providers";
import "./globals.css";
import { Footer } from "@/_components_/footer";

const exo = Exo_2({
  variable: "--font-exo",
  weight: ["400", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Launch Day",
  description: "Modern Prod Launcher",
  icons: [
    {
      rel: "icon",
      url: "/svg/logomark.svg",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-exo ${exo.variable} antialiased`}>
        <Providers>
          <div>
            <Navbar />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
