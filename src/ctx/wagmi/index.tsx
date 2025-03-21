"use client";

import { wagmiAdapter, projectId } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { baseSepolia, mainnet, sepolia, base } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "Launch Day",
  description: "Dev Launcher",
  url: "https://launch-day-pied.vercel.app", // origin must match your domain & subdomain
  icons: ["/svg/logomark.svg"],
};

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia, baseSepolia, mainnet, base],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true,
    socials: ["x", "github"],
    emailShowWallets: true,
  },
  themeMode: "dark",
});

function WagmiContext({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default WagmiContext;
