# i18n Interface Contract

**Feature**: 001-en-default-language  
**Contract Type**: Configuration Interface  
**Last Updated**: 2026-02-16

## Overview

This document defines the interface contract for the internationalization (i18n) system. All components and pages depend on this contract for displaying translated text.

## Configuration Contract

### `src/i18n/config.js`

**Exports**: Default export of configured i18next instance

**Configuration Guarantees**:

```javascript
{
  // GUARANTEED BEHAVIOR
  fallbackLng: 'en',  // ⚠️ CHANGED FROM 'pl'
  
  resources: {
    en: { translation: Object },  // Always loaded
    pl: { translation: Object },  // Always loaded
    nl: { translation: Object },  // Always loaded
    de: { translation: Object },  // ⚠️ NOW LOADED (previously missing)
    cs: { translation: Object }   // ⚠️ NOW LOADED (previously missing)
  },
  
  detection: {
    order: ['localStorage', 'navigator'],  // Unchanged
    caches: ['localStorage']               // Unchanged
  }
}
```

**Breaking Change Impact**:
- Components expecting Polish fallback text will now see English fallback
- Test assertions expecting Polish defaults must be updated to expect English
- Users with no stored preference will see English instead of Polish

**Non-Breaking Guarantees**:
- Users with stored language preference are unaffected
- `t()` function signature unchanged
- Language switching behavior unchanged
- All existing translation keys remain valid

---

## Translation Keys Contract

### Supported Languages

**Required**: All 5 languages must have identical key structure

```
Languages: ['en', 'pl', 'nl', 'de', 'cs']
Keys per language: ~220
Total keys: ~1100
```

### Key Structure Contract

**Guaranteed Keys** (partial list - full list in JSON files):

```typescript
interface Translations {
  navigation: {
    live: string;
    matches: string;
    brackets: string;
    standings: string;
    players: string;
    organizer: string;
    settings: string;
  };
  matches: {
    title: string;
    score: string;
    winner: string;
    status: string;
    // ... more keys
  };
  players: {
    addPlayer: string;
    editPlayer: string;
    deletePlayer: string;
    // ... more keys
  };
  // ... more namespaces
}
```

**Key Naming Convention**:
- Lowercase with camelCase for multi-word keys
- Namespace organization by feature area
- Dot-notation access: `t('namespace.key')`

**Immutability Contract**:
- Existing keys MUST NOT be deleted (breaks existing components)
- New keys MAY be added (requires update to all 5 files)
- Key paths MUST NOT change (breaks existing t() calls)

---

## Component Usage Contract

### `useTranslation()` Hook

**Import**: `import { useTranslation } from 'react-i18next';`

**Usage Pattern**:
```javascript
const { t, i18n } = useTranslation();

// Access translation
const text = t('namespace.key');

// Change language
i18n.changeLanguage('en');

// Get current language
const currentLang = i18n.language;
```

**Guarantees**:
- `t()` always returns a string (never undefined/null)
- Missing keys return the key path as string
- Language changes trigger component re-render
- All 5 languages ('en', 'pl', 'nl', 'de', 'cs') are valid arguments to `changeLanguage()`

---

## LanguageSelector Contract

### Component API

**Location**: `src/components/LanguageSelector.jsx`

**Props**: None (standalone component)

**Behavior**:
- Displays dropdown with all 5 supported languages
- Languages ordered: English, Czech, German, Dutch, Polish
- Current language is visually indicated (checkmark icon)
- Clicking language immediately applies change
- Dropdown closes on selection or click outside

**Language Display**:
```javascript
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'cs', label: 'Čeština' },
  { code: 'de', label: 'Deutsch' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' }
];
```

**⚠️ ORDER CHANGED**: English now appears first (previously Polish was first)

**Integration Contract**:
- Must be rendered within React tree where i18next provider is available
- No props required
- No external state dependencies
- Can be placed in any layout component

---

## localStorage Contract

### Language Preference Storage

**Key**: `i18nextLng` (managed by i18next-browser-languagedetector)

**Value**: Language code string ('en' | 'pl' | 'nl' | 'de' | 'cs')

**Lifecycle**:
- Written: Automatically by i18next when language changes
- Read: Automatically by i18next on app initialization
- Cleared: Only by user clearing browser data

**Application Responsibility**: None (fully managed by i18next)

---

## Fallback Behavior Contract

### Translation Resolution Algorithm

```
Given: t('namespace.key')

Step 1: Look up key in current language resource
  └─ Found? Return translation → END

Step 2: Look up key in fallbackLng ('en')  ⚠️ CHANGED FROM 'pl'
  └─ Found? Return English translation → END
  
Step 3: Return key path as string ('namespace.key')
  └─ Indicates missing translation in both current and fallback language
```

**Impact of Fallback Change**:
- Users selecting German/Czech for first time will see English for missing keys (previously Polish)
- No impact on users with complete translations (English, Polish, Dutch)
- Test assertions expecting Polish fallback must be updated to expect English

---

## Testing Contract

### Test Configuration

**Test Setup Files**:
- `src/setupTests.js`
- `src/test-utils.jsx`

**Required Test Configuration**:
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Test i18n configuration must match production
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',           // ⚠️ CHANGED: Default language for tests
    fallbackLng: 'en',   // ⚠️ CHANGED: Fallback for tests
    resources: {
      en: { translation: {} }
    }
  });
```

**Test Guarantees**:
- All tests run with English as default language
- Test assertions expect English text
- Language switching behavior is testable
- Fallback behavior is testable

---

##Backward Compatibility

### Compatible Changes
- ✅ Language detection order unchanged
- ✅ localStorage key unchanged
- ✅ Hook API unchanged (`useTranslation()`)
- ✅ Translation key structure unchanged
- ✅ Existing user preferences preserved

### Breaking Changes
- ⚠️ Fallback language changed: 'pl' → 'en'
- ⚠️ Test defaults changed: Polish → English
- ⚠️ Language selector order changed: Polish first → English first
- ⚠️ Two new languages loaded: German and Czech now available

### Migration Impact
- **Users**: Zero impact for users with stored preference
- **New Users**: See English instead of Polish (intended behavior)
- **Developers**: Must update test expectations from Polish to English
- **Documentation**: Must update all references to fallback language

---

## Validation & Verification

### Pre-Deployment Checks

1. **Configuration Validation**:
   - [ ] `fallbackLng` is 'en' in src/i18n/config.js
   - [ ] All 5 languages (en, pl, nl, de, cs) are imported and registered
   - [ ] Language detection order is ['localStorage', 'navigator']

2. **Translation File Validation**:
   - [ ] All 5 JSON files have identical key structure
   - [ ] German (de.json) has ~220 keys
   - [ ] Czech (cs.json) has ~220 keys
   - [ ] No duplicate keys within any file
   - [ ] All values are strings (no nested objects beyond structure)

3. **Component Validation**:
   - [ ] LanguageSelector displays all 5 languages in order: [en, cs, de, nl, pl]
   - [ ] Language switching updates UI immediately
   - [ ] Current language is visually indicated

4. **Test Validation**:
   - [ ] All existing tests pass with updated expectations
   - [ ] New language defaults (English) are asserted in tests
   - [ ] Test configuration mirrors production configuration

5. **Documentation Validation**:
   - [ ] All docs reference English as fallback (not Polish)
   - [ ] Language support documentation lists all 5 languages
   - [ ] Language order in docs matches implementation

### Post-Deployment Verification

1. **User Experience**:
   - New user with no preference sees English interface
   - Existing user with Polish preference sees Polish interface
   - Language selector shows all 5 languages
   - Language switching works smoothly

2. **Fallback Behavior**:
   - Missing keys in German show English text (not Polish)
   - Missing keys in Czech show English text (not Polish)

3. **Performance**:
   - Language switching completes in <100ms
   - No console errors or warnings
   - No broken translations (key paths displayed)
