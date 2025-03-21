"use client";

// import { setTheme } from "@/app/actions";
// import { useTheme } from "next-themes";
// import { useCallback } from "react";
import { Brand } from "./brand";
import { useAccount } from "wagmi";

export const Navbar = () => {
  const { isConnected } = useAccount();
  // const mode = useTheme();
  // const handleThemeSet = useCallback(
  //   (theme: string) => async () => {
  //     mode.setTheme(theme);
  //     await setTheme(theme);
  //   },
  //   [mode],
  // );
  return (
    <nav className="md:h-20  h-12 w-full justify-between dark:bg-background bg-black fixed top-0 flex items-center gap-8 px-2 md:px-8">
      <Brand title="Launch Day" />
      <div className="items-center flex justify-center space-x-4">
        <w3m-button loadingLabel="Connecting..." />
        {isConnected && (
          <div>
            <w3m-network-button />
          </div>
        )}
        {/* <button onClick={handleThemeSet("light")} className="text-gray-200">
          Light
        </button>
        <button onClick={handleThemeSet("dark")} className="text-gray-200">
          Dark
        </button> */}
      </div>
    </nav>
  );
};
