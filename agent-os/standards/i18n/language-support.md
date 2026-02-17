# Language Support

App supports 5 languages with **English fallback**.

## Supported Languages

```javascript
resources: {
    en: { translation: en },  // English (fallback)
    cs: { translation: cs },  // Czech
    de: { translation: de },  // German
    nl: { translation: nl },  // Dutch
    pl: { translation: pl }   // Polish
}
```

## Configuration

- **Fallback:** `fallbackLng: 'en'` — English is default for missing keys
- **Detection:** Checks localStorage first, then browser language
- **Persistence:** Language choice saved to localStorage

## Why English?

- Ensures international users see English (not Polish) as default
- All languages fall back to English when a key is not found

## Workflow for New Features

**Always add English translations first** when adding new features:

1. Add new keys to `en.json` first
2. Other language translations can be added later
3. Users will see English text until other translations are complete

## Language Files

All translation files located in `src/i18n/`:
- `en.json`, `cs.json`, `de.json`, `nl.json`, `pl.json`

**Import in config.js:**
```javascript
import en from './en.json';
import cs from './cs.json';
// ... etc
```
