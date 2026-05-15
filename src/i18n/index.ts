import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { ja } from "./ja";

const STORAGE_KEY = "map3d.lang";

const detectInitial = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch {
    /* no-op */
  }
  const browser = (navigator.language || "en").slice(0, 2);
  return ["en", "fr", "es", "ja"].includes(browser) ? browser : "en";
};

i18n.use(initReactI18next).init({
  resources: { en, fr, es, ja },
  lng: detectInitial(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setLanguage(lng: string) {
  i18n.changeLanguage(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* no-op */
  }
}

export default i18n;
