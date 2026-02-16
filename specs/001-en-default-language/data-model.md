# Data Model: English as Default Language

**Feature**: 001-en-default-language  
**Phase**: 1 - Design Artifacts  
**Date**: 2026-02-16

## Overview

This feature does not introduce new data entities or modify existing database schemas. All changes are configuration and UI-layer only.

## Entities

### Language Preference (Existing)

**Storage Location**: Browser localStorage (managed by i18next-browser-languagedetector)

**Key**: `i18nextLng`

**Type**: String (language code: 'en', 'pl', 'nl', 'de', 'cs')

**Lifecycle**:
- **Created**: When user explicitly selects a language via LanguageSelector
- **Read**: On application initialization by i18next language detector
- **Updated**: When user changes language selection
- **Deleted**: When user clears browser data (not application-controlled)

**Validation Rules**: None (i18next handles invalid values by falling back to detected or default language)

**Relationships**: None (independent of tournament, player, match data)

---

### Translation Resource (Configuration)

**Storage Location**: Static JSON files in `src/i18n/`

**Files**:  
- `en.json` - English translations (~220 keys) - NEW ROLE: fallback language
- `pl.json` - Polish translations (~220 keys)
- `nl.json` - Dutch translations (~220 keys)
- `de.json` - German translations (~220 keys) - CHANGE: complete all keys
- `cs.json` - Czech translations (~220 keys) - CHANGE: complete all keys

**Structure**:
```json
{
  "navigation": {
    "live": "Live Stream",
    "matches": "Matches",
    "brackets": "Brackets",
    "standings": "Standings",
    "players": "Players"
  },
  "matches": {
    "title": "Match Management",
    "score": "Score",
    "winner": "Winner"
  },
  ...
}
```

**Key Characteristics**:
- Nested object structure
- Dot-notation access (e.g., `t('navigation.live')`)
- String values only (no pluralization or interpolation in current implementation)
- All 5 files must have identical key structure after completion

**Validation**:
- Structural validation: Automated tests verify all language files have matching keys
- Translation validation: Manual review for semantic accuracy
- No runtime validation (missing keys handled by fallback)

---

### i18n Configuration State (Runtime)

**Storage Location**: Memory (i18next instance state)

**Key Attributes**:
- `language`: Currently selected language (string)
- `fallbackLng`: Fallback language for missing keys (string) - CHANGE: 'pl' → 'en'
- `resources`: Loaded translation objects (object)
- `detection.order`: Language detection priority (['localStorage', 'navigator'])

**State Transitions**:
```
Initial Load:
  ├─ localStorage has language? → Use stored language
  ├─ Navigator suggests supported language? → Use browser language  
  └─ Else → Use fallbackLng ('en')

User Changes Language:
  └─ Update current language + save to localStorage

Missing Translation Key:
  └─ Fall back to fallbackLng language ('en')
```

**Immutability**: Configuration is set once at application initialization, language changes don't reload config

---

## Data Flow

### Language Selection Flow

```
[User clicks Language Selector]
          ↓
[LanguageSelector.jsx calls i18n.changeLanguage(code)]
          ↓
[i18next updates internal state]
          ↓
[i18next-browser-languagedetector saves to localStorage]
          ↓
[React components re-render with new translations]
```

### Translation Resolution Flow

```
[Component calls t('key.path')]
          ↓
[i18next looks up key in current language resource]
          ↓
[Key found?]
  ├─ YES → Return translated string
  └─ NO → Look up key in fallbackLng ('en')  
             ├─ Found → Return English string
             └─ Missing → Return key path as string
```

---

## No Database Changes

**Supabase Schema**: No changes required  
**localStorage Schema**: No changes required (i18next manages its own keys)  
**Application Data Models**: No changes required

---

## Migration Notes

**User Data Migration**: None required

**Configuration Migration**:  
- Old: `fallbackLng: 'pl'`
- New: `fallbackLng: 'en'`
- Impact: Zero - existing users have explicit language preference stored, not affected by fallback change

**Translation File Migration**:  
- German (de.json): Add ~162 missing keys
- Czech (cs.json): Add ~162 missing keys  
- Other files: No changes

**Rollback Strategy**: If issues arise, revert `fallbackLng` to 'pl' - zero data loss, instant rollback
