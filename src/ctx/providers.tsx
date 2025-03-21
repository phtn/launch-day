"use client";

import { useState, type ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { type State, WagmiProvider } from "wagmi";
import { config } from "./wagmi/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = {
  children: ReactNode;
  initialState: State | undefined;
};

export const Providers = ({ children, initialState }: Props) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ThemeProvider
      enableSystem
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config} initialState={initialState}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
