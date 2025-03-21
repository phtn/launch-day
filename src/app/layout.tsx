import { type ReactNode } from "react";
import { Exo_2 } from "next/font/google";
import { Navbar } from "@/_components_/navbar";
import { Providers } from "@/ctx/providers";
import "./globals.css";
import { Footer } from "@/_components_/footer";
import WagmiContext from "@/ctx/wagmi";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/ctx/wagmi/config";
import { Metadata } from "next";

const exo = Exo_2({
  variable: "--font-exo",
  weight: ["400", "900"],
  subsets: ["latin"],
});
// Set up metadata
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
  // const createCtx = cache(async () => {
  //   const heads = new Headers(await headers());
  //   return heads.get("cookie");
  // });
  // let cookies: string | null = "";
  // createCtx().then((c) => (cookies = c));
  const initialState = cookieToInitialState(
    config,
    (await headers()).get("cookie"),
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-exo ${exo.variable} antialiased`}>
        <WagmiContext cookies={""}>
          <Providers initialState={initialState}>
            <div>
              <Navbar />
              {children}
              <Footer />
            </div>
          </Providers>
        </WagmiContext>
      </body>
    </html>
  );
}
