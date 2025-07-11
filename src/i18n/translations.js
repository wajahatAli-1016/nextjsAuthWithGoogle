import enTranslations from './en.json';
import frTranslations from './fr.json';

const translations = {
  en: enTranslations,
  fr: frTranslations,
};

/**
 * Get translation for a given key and locale
 * @param {string} key - Translation key (e.g., 'game.title')
 * @param {string} locale - Language locale ('en' or 'fr')
 * @param {Object} variables - Variables to interpolate in the translation
 * @returns {string} Translated text
 */
export function getTranslation(key, locale = 'en', variables = {}) {
  const localeTranslations = translations[locale] || translations.en;
  
  // Split the key by dots to navigate nested objects
  const keys = key.split('.');
  let translation = localeTranslations;
  
  // Navigate through the nested object structure
  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      // Fallback to English if translation not found
      const fallbackTranslation = translations.en;
      let fallback = fallbackTranslation;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return key; // Return the key if translation not found
        }
      }
      translation = fallback;
      break;
    }
  }
  
  // If translation is not a string, return the key
  if (typeof translation !== 'string') {
    return key;
  }
  
  // Replace variables in the translation
  let result = translation;
  for (const [variable, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${variable}}}`, 'g'), value);
  }
  
  return result;
}

/**
 * Get all translations for a given locale
 * @param {string} locale - Language locale ('en' or 'fr')
 * @returns {Object} All translations for the locale
 */
export function getTranslations(locale = 'en') {
  return translations[locale] || translations.en;
}

/**
 * Check if a locale is supported
 * @param {string} locale - Language locale to check
 * @returns {boolean} True if locale is supported
 */
export function isLocaleSupported(locale) {
  return Object.keys(translations).includes(locale);
}

/**
 * Get supported locales
 * @returns {string[]} Array of supported locale codes
 */
export function getSupportedLocales() {
  return Object.keys(translations);
}

export default {
  getTranslation,
  getTranslations,
  isLocaleSupported,
  getSupportedLocales,
}; 