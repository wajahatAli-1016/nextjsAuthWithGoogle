# Internationalization (i18n) System

This project supports English and French languages with a complete internationalization system using Next.js App Router.

## Features

- ✅ **English and French support**
- ✅ **Automatic locale detection**
- ✅ **URL-based language switching** (`/en/game`, `/fr/game`)
- ✅ **Language switcher component**
- ✅ **Variable interpolation** in translations
- ✅ **Fallback to English** for missing translations
- ✅ **Responsive design** for language switcher
- ✅ **App Router compatible**

## How to Use

### 1. Using the Translation Hook

```javascript
import useTranslation from '../i18n/useTranslation';

function MyComponent() {
  const { t, changeLocale, currentLocale } = useTranslation();
  
  return (
    <div>
      <h1>{t('game.title')}</h1>
      <p>{t('game.year')} {currentYear} {t('game.of')} 3</p>
      <button onClick={() => changeLocale('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

### 2. Adding the Language Switcher

```javascript
import LanguageSwitcher from '../components/LanguageSwitcher';

function MyComponent() {
  return (
    <div>
      <LanguageSwitcher />
      {/* Your content */}
    </div>
  );
}
```

### 3. Using Variables in Translations

```javascript
// In translation files
{
  "yearResults": {
    "title": "Year {{year}} Results",
    "startNextYear": "Start Year {{year}}"
  }
}

// In component
const { t } = useTranslation();
t('yearResults.title', { year: 1 }) // "Year 1 Results"
t('yearResults.startNextYear', { year: 2 }) // "Start Year 2"
```

## Translation Files

### Structure
- `src/i18n/en.json` - English translations
- `src/i18n/fr.json` - French translations
- `src/i18n/translations.js` - Translation utility functions
- `src/i18n/useTranslation.js` - React hook for translations

### Adding New Translations

1. **Add to English file** (`src/i18n/en.json`):
```json
{
  "newSection": {
    "title": "New Title",
    "description": "New description with {{variable}}"
  }
}
```

2. **Add to French file** (`src/i18n/fr.json`):
```json
{
  "newSection": {
    "title": "Nouveau Titre",
    "description": "Nouvelle description avec {{variable}}"
  }
}
```

3. **Use in component**:
```javascript
const { t } = useTranslation();
t('newSection.title') // "New Title" or "Nouveau Titre"
t('newSection.description', { variable: 'value' })
```

## URL Structure

- English: `/en/game`
- French: `/fr/game`
- Default: `/game` (redirects to English)

## Configuration

### Middleware (`middleware.js`)
The internationalization is handled through middleware:

```javascript
import { NextResponse } from 'next/server';

const locales = ['en', 'fr'];
const defaultLocale = 'en';

export function middleware(request) {
  // Handle locale routing
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}
```

### App Directory Structure
```
src/app/
├── [locale]/
│   ├── layout.js
│   ├── game/
│   │   └── page.js
│   ├── result/
│   │   └── page.js
│   └── home/
│       └── page.js
├── game/
│   └── page.js (main game component)
└── layout.js
```

## Available Translation Keys

### Common
- `common.loading`, `common.error`, `common.back`, `common.close`

### Game
- `game.title`, `game.year`, `game.of`, `game.annualBudget`
- `game.citizenHappiness`, `game.completeYear`, `game.viewGameHistory`
- `game.startGame`, `game.allocate`, `game.allocated`, `game.remaining`

### Categories
- `categories.health`, `categories.education`, `categories.safety`

### Weight Setup
- `weightSetup.title`, `weightSetup.description`
- `weightSetup.healthWeight`, `weightSetup.educationWeight`, `weightSetup.safetyWeight`
- `weightSetup.validation.totalMustBe100`, `weightSetup.validation.invalidNumber`

### Year Results
- `yearResults.title`, `yearResults.baseScore`, `yearResults.finalScore`
- `yearResults.specialEvent`, `yearResults.normalYear`, `yearResults.noEvents`
- `yearResults.event`, `yearResults.impact`, `yearResults.points`
- `yearResults.feedback`, `yearResults.yourAllocations`
- `yearResults.startNextYear`, `yearResults.viewFinalResults`

### Game History
- `gameHistory.title`, `gameHistory.noGames`, `gameHistory.gameNumber`
- `gameHistory.status.started`, `gameHistory.status.reelected`
- `gameHistory.currentYear`, `gameHistory.totalScore`, `gameHistory.averageScore`

### Errors
- `errors.allocateAllPoints`, `errors.invalidInput`
- `errors.exceedsBudget`, `errors.negativeValue`

### Language
- `language.en`, `language.fr`

## Adding a New Language

1. Create a new translation file: `src/i18n/[locale].json`
2. Add the locale to `middleware.js`:
```javascript
const locales = ['en', 'fr', 'es']; // Add new locale
```
3. Import and add to `src/i18n/translations.js`:
```javascript
import esTranslations from './es.json';

const translations = {
  en: enTranslations,
  fr: frTranslations,
  es: esTranslations, // Add new translations
};
```
4. Add to `src/app/[locale]/layout.js`:
```javascript
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'es' }, // Add new locale
  ];
}
```

## Best Practices

1. **Use descriptive keys**: `game.completeYear` instead of `complete`
2. **Group related translations**: All game-related text under `game.*`
3. **Use variables for dynamic content**: `{{year}}`, `{{score}}`
4. **Provide fallbacks**: Always include English translations
5. **Test both languages**: Ensure UI works with longer/shorter text

## Troubleshooting

- **Translation not showing**: Check if the key exists in both language files
- **Variables not working**: Ensure the variable name matches exactly (case-sensitive)
- **Language not switching**: Check if the locale is added to `middleware.js`
- **Component not updating**: Make sure you're using the `t()` function, not hardcoded text
- **Router error**: Ensure you're using the App Router (`next/navigation`) not Pages Router (`next/router`)

## App Router vs Pages Router

This implementation uses Next.js App Router (`next/navigation`). If you're using Pages Router, you'll need to:

1. Use `next/router` instead of `next/navigation`
2. Use the `i18n` config in `next.config.mjs`
3. Remove the middleware file
4. Use different routing patterns 