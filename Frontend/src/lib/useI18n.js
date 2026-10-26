import { useLanguage } from './LanguageContext';
import { useT } from './translations';

export function useI18n() {
  const { lang, dir, toggleLang, setLanguage, isRTL } = useLanguage();
  const t = useT(lang);
  return { t, lang, dir, toggleLang, setLanguage, isRTL };
}