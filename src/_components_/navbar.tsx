"use client";

import { useTheme } from "next-themes";
import { Brand } from "./brand";
import { useCallback } from "react";

export const Navbar = () => {
  return (
    <nav className="md:h-16 h-12 border-b border-gray-400/0 w-full justify-between bg-gray-950 dark:bg-background fixed top-0 flex items-center gap-8 ps-2 md:px-8">
      <Brand title="Launch Day" />
      <WalletConnector />
    </nav>
  );
};

const WalletConnector = () => {
  return (
    <div className="items-center flex justify-end text-xs md:justify-center md:space-x-4">
      <w3m-button
        balance="hide"
        loadingLabel="Connecting..."
        size="sm"
        label="→"
      />
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
