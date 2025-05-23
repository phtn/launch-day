"use client";

import { useTheme } from "next-themes";
import { Brand } from "./brand";
import { useAccount } from "wagmi";
import { useCallback } from "react";

export const Navbar = () => {
  return (
    <nav className="md:h-20 h-12 w-full justify-between bg-gray-950 dark:bg-background fixed top-0 flex items-center gap-8 ps-2 md:px-8">
      <Brand title="Launch Day" />
      <WalletConnector />
    </nav>
  );
};

const WalletConnector = () => {
  const { isConnected } = useAccount();

  return (
    <div className="items-center flex justify-end text-xs md:justify-center md:space-x-4">
      <w3m-button loadingLabel="Connecting..." size="sm" label="Sign in" />
      {isConnected && (
        <div className="hidden md:flex">
          <w3m-network-button />
        </div>
      )}
    </div>
  );
};

export const ModeSwitch = () => {
  const { setTheme } = useTheme();
  const handleThemeSet = useCallback(
    (theme: string) => async () => {
      setTheme(theme);
    },
    [setTheme],
  );
  return (
    <div className="flex items-center gap-2">
      <button onClick={handleThemeSet("light")} className="text-gray-200">
        Light
      </button>
      <button onClick={handleThemeSet("dark")} className="text-gray-200">
        Dark
      </button>
    </div>
  );
};
