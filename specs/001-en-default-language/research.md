# Research: English as Default Language

**Feature**: 001-en-default-language  
**Phase**: 0 - Research & Technical Discovery  
**Date**: 2026-02-16

## Research Findings

### 1. i18next Configuration Architecture

**Research Question**: How does i18next handle fallback language configuration and what are the implications of changing it?

**Findings**:
- i18next uses `fallbackLng` option to specify fallback language when a translation key is missing
- Current configuration: `fallbackLng: 'pl'` (Polish)
- Target configuration: `fallbackLng: 'en'` (English)
- Fallback chain: Selected language → fallbackLng → hardcoded string (if key missing)
- Language detection order: `['localStorage', 'navigator']` - stored preference takes precedence over browser language
- i18n state is stored in localStorage under key `i18nextLng` (managed by i18next-browser-languagedetector)

**Decision**: Change `fallbackLng` from 'pl' to 'en' in src/i18n/config.js

**Rationale**: English is more universally understood than Polish for international tournament participants. Making English the fallback ensures better accessibility for global users while preserving explicit language choice for users who select Polish.

**Alternatives Considered**:
- Keep Polish as fallback: Rejected because Polish is less internationally accessible
- Use browser navigator as primary fallback: Rejected because it's already in detection order, fallbackLng is for missing translations

---

### 2. Language File Loading Strategy

**Research Question**: What's the current state of language file imports and how should all 5 languages be loaded?

**Findings**:
- Current imports in `src/i18n/config.js`: Only pl, en, nl (3 languages)
- Available translation files: pl.json, en.json, nl.json, de.json, cs.json (5 files)
- German (de.json) and Czech (cs.json) exist but are NOT imported or registered in i18next
- Each file is a JSON object with nested translation keys
- Import pattern: `import en from './en.json';`
- Registration pattern: `resources: { en: { translation: en } }`

**Decision**: Import and register all 5 language files (en, pl, nl, de, cs)

**Rationale**: The documentation claims 5-language support, but only 3 are currently loaded. This creates inconsistency between documentation and implementation. Loading all 5 ensures users can actually select and use all documented languages.

**Alternatives Considered**:
- Keep only 3 languages: Rejected because de.json and cs.json files exist, indicating intent for 5-language support
- Lazy load languages: Rejected because current architecture uses synchronous imports and performance is not a concern with small JSON files

---

### 3. Translation File Completeness

**Research Question**: What is the current state of translation completeness across all 5 language files?

**Findings**:
- Complete files (~220 keys each): en.json, pl.json, nl.json
- Partial files (~58 keys each): de.json, cs.json
- Missing keys in de.json and cs.json: ~162 keys each (~73% incomplete)
- Key structure is consistent across files (nested objects with dot-notation access)
- Example keys: `navigation.live`, `matches.score`, `players.addPlayer`, etc.
- Current behavior: When German or Czech user encounters missing key, falls back to Polish (current fallbackLng)
- Target behavior: Missing keys should fall back to English (new fallbackLng)

**Decision**: Complete de.json and cs.json with all ~162 missing translation keys

**Rationale**: 
1. Provides consistent user experience across all 5 languages
2. Eliminates unexpected fallback scenarios where users see mixed languages
3. Aligns with specification requirement (FR-013, SC-004)
4. Professional appearance - complete translations signal quality

**Implementation Approach**:
1. Extract all keys from en.json as reference (source of truth)
2. Compare with de.json and cs.json to identify missing keys
3. Translate missing keys (machine translation with human review acceptable)
4. Maintain identical key structure across all files

**Alternatives Considered**:
- Keep partial translations and rely on fallback: Rejected per user requirement and FR-013
- Only translate high-priority keys: Rejected because all UX text is equally visible to users
- Auto-generate at runtime: Rejected because static files are simpler and perform better

---

### 4. Language Selector UI Order

**Research Question**: In what order should languages appear in the dropdown selector?

**Findings**:
- Current `LANGUAGES` array in LanguageSelector.jsx: `[pl, en, nl]`
- Current order: Polish first (matches current fallback)
- Target order per specification: English first, then alphabetical by native name
- Alphabetical by native name: Čeština (Czech), Deutsch (German), Nederlands (Dutch), Polski (Polish)
- UI consideration: 5 languages is manageable in dropdown without scrolling on most devices

**Decision**: Order languages as `[en, cs, de, nl, pl]` (English, Čeština, Deutsch, Nederlands, Polski)

**Rationale**: 
1. Default language appears first (conventional UI pattern)
2. Alphabetical ordering by native name is intuitive for multilingual users
3. Eliminates arbitrary ordering that might suggest preference

**Alternatives Considered**:
- Alphabetical by language code: Rejected because users see native names, not codes
- Usage frequency order: Rejected because we don't have usage analytics and it would change over time
- Keep current order with additions: Rejected because it doesn't establish clear organizing principle

---

### 5. Testing Strategy for Default Language Change

**Research Question**: How should existing tests be updated to reflect the new default language?

**Findings**:
- Tests likely assert expected language defaults (e.g., checking for Polish text in initial render)
- Test files affected: `src/i18n/config.test.js`, component tests for LanguageSelector
- Test setup files: `src/setupTests.js`, `src/test-utils.jsx` may configure i18n for tests
- Current test pattern: Mock i18next or use real configuration
- Expected assertion changes: Replace Polish strings with English strings in default state tests

**Decision**: Update only test setup/fixtures and expected values, preserve test logic structure

**Rationale**:
1. Test logic (what behavior is being validated) remains unchanged
2. Only expected values change (from Polish to English)  
3. Minimizes risk of introducing test bugs
4. Maintains test coverage for same behaviors

**Implementation Approach**:
1. Search for hardcoded 'pl' in test files → replace with 'en'
2. Search for Polish translations in assertions → replace with English equivalents
3. Update test i18n configuration in setupTests.js to use 'en' fallback
4. Run full test suite to verify no regressions

**Alternatives Considered**:
- Rewrite tests from scratch: Rejected as unnecessarily risky and time-consuming
- Keep Polish in tests: Rejected because tests should match production behavior
- Test all 5 languages equally: Rejected as out of scope for this feature

---

### 6. Documentation Update Scope

**Research Question**: Which documentation files reference the fallback language and need updates?

**Findings**:
- `.github/copilot-instructions.md`: Line ~431 states "Fallback language is Polish (`pl`)"
- `agent-os/standards/i18n/`: Multiple files may reference language support details
- README.md: May mention supported languages
- Repository memories: Current memories state Polish as fallback (will be outdated)

**Decision**: Update all documentation to state English as fallback language

**Files to Update**:
1. `.github/copilot-instructions.md` - Update fallback language reference
2. `agent-os/standards/i18n/language-support.md` - Update language list and order
3. Any other docs discovered during grep search for "fallback" or "Polish" or "pl"

**Rationale**: Documentation drift leads to confusion and errors. All references must be consistent with implementation.

**Implementation Approach**:
1. `grep -r "fallback.*polish\|fallback.*pl\|default.*polish\|default.*pl" .` (case-insensitive)
2. Update each match to reference English instead
3. Verify consistency across all updated files

---

## Technology Stack Best Practices

### i18next + React Best Practices

**Research**: Standard patterns for i18next in React applications

**Key Patterns**:
1. **Configuration**: Centralize i18n config in single file (src/i18n/config.js)
2. **Language Detection**: Use i18next-browser-languagedetector for automatic language detection
3. **Hook Usage**: Use `useTranslation()` hook for accessing translations in components
4. **Key Access**: Use dot-notation for nested keys: `t('section.subsection.key')`
5. **Fallback**: Always define fallbackLng to handle missing translations gracefully

**Applied to This Feature**:
- ✓ Using centralized config file
- ✓ Using browser language detector with localStorage caching
- ✓ Using useTranslation() hook in LanguageSelector
- ✓ Changing fallbackLng to 'en'
- ✓ All translation files use consistent nested structure

**References**:
- i18next documentation: https://www.i18next.com/
- react-i18next best practices: https://react.i18next.com/guides/quick-start

---

## Risk Assessment

### High Risk

None identified

### Medium Risk

**Risk**: Translation quality for German and Czech completions
- **Mitigation**: Use machine translation + human review; flag for native speaker verification
- **Impact**: Low - incorrect translations are UI-only, don't affect functionality
- **Likelihood**: Medium - machine translation quality varies

### Low Risk

**Risk**: Existing users with Polish preference unaffected
- **Mitigation**: localStorage preference takes precedence over fallback, extensively tested
- **Impact**: Medium if broken - would frustrate existing Polish users
- **Likelihood**: Very Low - language detection order puts localStorage first

**Risk**: Test updates incomplete
- **Mitigation**: Run full test suite, verify all tests pass
- **Impact**: Low - CI will catch failures before merge
- **Likelihood**: Low - test updates are straightforward string replacements

---

## Open Questions

**Q**: Should we notify users when German/Czech translations are machine-generated?  
**A**: No - per specification, silent fallback is preferred. Translation quality is our internal concern.

**Q**: What translation tool should be used for completing de.json and cs.json?  
**A**: Recommended: DeepL or Google Translate for machine translation, with manual review for context. Consider hiring native speakers for final verification if budget allows.

**Q**: Should language order be configurable?  
**A**: No - fixed order provides consistency. Configuration would add unnecessary complexity.

---

## Summary

All technical unknowns resolved. Ready to proceed to Phase 1 (Design Artifacts). Key decisions:
1. Change fallbackLng to 'en'
2. Import all 5 language files
3. Complete de.json and cs.json translations (~162 keys each)
4. Order languages: [en, cs, de, nl, pl]
5. Update tests: fixtures/expected values only
6. Update documentation: all references to fallback language

No architectural changes required. No new dependencies needed. Low risk implementation.
