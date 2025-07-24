"use client"

import { useState } from 'react';
import useTranslation from '../i18n/useTranslation';
import styles from '../../game.module.css';

const LanguageSwitcher = () => {
  const { t, changeLocale, currentLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('language.en') },
    { code: 'fr', name: t('language.fr') }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  const handleLanguageChange = (locale) => {
    changeLocale(locale);
    setIsOpen(false);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={styles.languageButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('common.language')}
      >
        <span className={styles.languageIcon}>🌐</span>
        <span className={styles.languageText}>{currentLanguage?.name}</span>
        <span className={`${styles.languageArrow} ${isOpen ? styles.rotated : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className={styles.languageDropdown}>
          {languages.map((language) => (
            <button
              key={language.code}
              className={`${styles.languageOption} ${
                language.code === currentLocale ? styles.active : ''
              }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 