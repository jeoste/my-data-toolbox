import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ko from './locales/ko.json'

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ko: { translation: ko },
} as const

i18n
  .use(LanguageDetector) // détecte la langue du navigateur / système
  .use(initReactI18next) // connecte i18next à React
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React gère déjà l'échappement
    },
  })

export default i18n 