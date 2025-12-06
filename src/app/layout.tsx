import { Navbar } from "@/_components_/navbar";
import { Providers } from "@/ctx/providers";
import { DynamicWagmiContext } from "@/ctx/wagmi/dynamic";
import { Metadata } from "next";
import { Abril_Fatface, Exo_2, Geist } from "next/font/google";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import "./globals.css";

const exo = Exo_2({
  variable: "--font-exo",
  weight: ["400", "900"],
  subsets: ["latin"],
});

const abril = Abril_Fatface({
  variable: "--font-abril",
  weight: ["400"],
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
// Set up metadata Geist
export const metadata: Metadata = {
  title: "Launch Day",
  description: "Dev Launcher",
  // url: "https://launch-day-pied.vercel.app", // origin must match your domain & subdomain
  icons: ["/svg/logomark.svg"],
};
// export const metadata: Metadata = {
//   title: "Launch Day",
//   description: "Modern Prod Launcher",
//   icons: [
//     {
//       rel: "icon",
//       url: "/svg/logomark.svg",
//     },
//   ],
// };
export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookies = (await headers()).get("cookie");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${geist.variable} ${abril.variable} ${exo.variable} antialiased`}
      >
        <DynamicWagmiContext cookies={cookies}>
          <Providers>
            <div className="bg-gray-900">
              <Navbar />
              <main className="bg-gray-950 h-screen overflow-hidden">
                {children}
              </main>
              {/* <Footer /> */}
            </div>
          </Providers>
        </DynamicWagmiContext>
      </body>
    </html>
  );
}
