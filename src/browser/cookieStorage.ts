import type { SaveStorage } from "../engine/platform";

const SAVE_COOKIE_NAME = "nuts_game_save";

export const cookieStorage: SaveStorage = {
  read() {
    const cookies = document.cookie.split(";");
    const saveCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${SAVE_COOKIE_NAME}=`),
    );
    if (!saveCookie) return null;
    return saveCookie.split("=")[1] ?? null;
  },
  write(data: string) {
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    document.cookie = `${SAVE_COOKIE_NAME}=${data}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
  },
  clear() {
    document.cookie = `${SAVE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};
