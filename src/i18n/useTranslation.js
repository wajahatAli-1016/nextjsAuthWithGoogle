"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getTranslation, getTranslations, isLocaleSupported } from './translations';

/**
 * Custom hook for internationalization
 * @returns {Object} Translation utilities and current locale
 */
export function useTranslation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    const pathSegments = pathname.split('/');
    const localeFromPath = pathSegments[1];
    
    if (localeFromPath && isLocaleSupported(localeFromPath)) {
      setCurrentLocale(localeFromPath);
    } else {
      setCurrentLocale('en');
    }
  }, [pathname]);

  /**
   * Translate a key with optional variables
   * @param {string} key 
   * @param {Object} variables 
   * @returns {string} 
   */
  const t = useCallback((key, variables = {}) => {
    return getTranslation(key, currentLocale, variables);
  }, [currentLocale]);

  /**
   * Change the current locale
   * @param {string} locale - New locale ('en' or 'fr')
   */
  const changeLocale = useCallback((locale) => {
    if (isLocaleSupported(locale)) {
      const newPath = `/${locale}/game`;
      
      // Safely get search params string
      let searchString = '';
      try {
        searchString = searchParams.toString();
      } catch (error) {
        // Handle case where searchParams is not available during SSR
        console.warn('Search params not available during SSR');
      }
      
      const fullPath = searchString ? `${newPath}?${searchString}` : newPath;
      
      router.push(fullPath);
    }
  }, [router, searchParams]);

  /**
   * Get all translations for current locale
   * @returns {Object} All translations
   */
  const translations = useCallback(() => {
    return getTranslations(currentLocale);
  }, [currentLocale]);

  return {
    t,
    changeLocale,
    currentLocale,
    translations,
    isLocaleSupported,
  };
}

export default useTranslation; 