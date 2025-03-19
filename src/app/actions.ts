"use server";

import { cookies } from "next/headers";

const defaultOpts = {
  secure: false,
  httpOnly: true,
  sameSite: "lax" as const,
};

export const setTheme = async (theme: string) => {
  const cookieStore = await cookies();
  cookieStore.set("launch-day---mode", theme, { ...defaultOpts, path: "/" });
  return theme;
};

export const getTheme = async () => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("launch-day---mode")?.value;
  return theme ?? "light";
};

export const deleteThemes = async () => {
  const cookieStore = await cookies();
  return cookieStore.delete("launch-day---mode");
};
