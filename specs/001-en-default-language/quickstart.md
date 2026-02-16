# Quickstart: English as Default Language

**Feature**: 001-en-default-language  
**Branch**: `001-en-default-language`  
**Estimated Time**: 10-15 minutes for verification

## Prerequisites

- Node.js and npm installed
- Repository cloned locally
- On feature branch `001-en-default-language`

```bash
# Verify you're on the correct branch
git branch --show-current
# Should show: 001-en-default-language

# Install dependencies if needed
npm install
```

---

## Quick Verification (5 minutes)

### 1. Verify Configuration Changes

```bash
# Check fallback language is 'en'
grep "fallbackLng" src/i18n/config.js
# Expected: fallbackLng: 'en',

# Check all 5 languages are imported
grep "import.*from './.*\.json'" src/i18n/config.js
# Expected to see: pl.json, en.json, nl.json, de.json, cs.json

# Check all 5 languages in resources
grep -A 6 "resources:" src/i18n/config.js
# Expected to see all 5 languages listed
```

### 2. Verify Translation Files Completeness

```bash
# Count keys in each translation file
for lang in en pl nl de cs; do
  echo -n "$lang.json: "
  grep -c '".*":' src/i18n/$lang.json
done

# All files should show ~220 keys (de and cs now completed)
```

### 3. Verify Language Selector

```bash
# Check language order
grep -A 6 "const LANGUAGES" src/components/LanguageSelector.jsx
# Expected order: en, cs, de, nl, pl (English first)
```

### 4. Run Tests

```bash
# Run full test suite
npm run test

# All tests should pass with updated expectations
```

### 5. Start Development Server

```bash
# Start the application
npm run dev

# Open browser to http://localhost:5173
```

---

## Manual Testing Checklist

### Test Scenario 1: New User Experience

**Objective**: Verify new users see English by default

**Steps**:
1. Open browser in incognito/private mode
2. Open Developer Tools → Application → Local Storage
3. Clear all localStorage data
4. Navigate to http://localhost:5173
5. **Verify**: Interface displays in English
6. **Verify**: Language selector shows English selected (checkmark)

**Expected Result**: ✅ All UI text in English, English marked as current language

---

### Test Scenario 2: Existing Polish User

**Objective**: Verify existing users keep their language preference

**Steps**:
1. Open Developer Tools → Application → Local Storage
2. Set `i18nextLng` = `"pl"`
3. Refresh page
4. **Verify**: Interface displays in Polish
5. **Verify**: Language selector shows Polish selected

**Expected Result**: ✅ User preference respected, Polish interface maintained

---

### Test Scenario 3: All 5 Languages Available

**Objective**: Verify all 5 languages are selectable and functional

**Steps**:
1. Click language selector (Globe icon)
2. **Verify**: Dropdown shows 5 languages in order:
   - English
   - Čeština (Czech)
   - Deutsch (German)
   - Nederlands (Dutch)
   - Polski (Polish)
3. Select each language one by one
4. **Verify**: UI updates immediately for each language
5. **Verify**: No broken translations (nokey paths displayed)

**Expected Result**: ✅ All 5 languages functional with complete translations

---

### Test Scenario 4: German/Czech Completeness

**Objective**: Verify German and Czech translations are complete

**Steps**:
1. Select German (Deutsch)
2. Navigate through all pages: Live, Matches, Brackets, Standings, Players, Organizer
3. **Verify**: All text displays in German (no English fallback visible)
4. Select Czech (Čeština)
5. Navigate through all pages again
6. **Verify**: All text displays in Czech (no English fallback visible)

**Expected Result**: ✅ No mixed language displays, complete translations throughout

---

### Test Scenario 5: Language Switching Performance

**Objective**: Verify language switching is fast

**Steps**:
1. Open Developer Tools → Console
2. Open Language selector
3. Click different languages rapidly
4. **Verify**: UI updates immediately (<100ms)
5. **Verify**: No console errors or warnings
6. **Verify**: No UI flicker or broken layouts

**Expected Result**: ✅ Instant language switching with no errors

---

### Test Scenario 6: Fallback Behavior (Optional)

**Objective**: Verify fallback works correctly if a key is manually removed

**Steps**:
1. Open `src/i18n/de.json` in editor
2. Temporarily remove one translation key (e.g., delete `"navigation.live"`)
3. Save file and refresh browser
4. Select German language
5. Navigate to the page with missing translation
6. **Verify**: English text appears for that specific key
7. Restore the deleted key

**Expected Result**: ✅ English fallback works when translation missing

---

## Testing Translation File Changes

### Verify German Translation Completeness

```bash
# Extract all keys from English (reference)
node -e "console.log(Object.keys(require('./src/i18n/en.json')).join('\n'))" > /tmp/en-keys.txt

# Extract all keys from German
node -e "console.log(Object.keys(require('./src/i18n/de.json')).join('\n'))" > /tmp/de-keys.txt

# Check for missing keys (should be empty)
comm -23 /tmp/en-keys.txt /tmp/de-keys.txt
```

### Verify Czech Translation Completeness

```bash
# Extract all keys from Czech
node -e "console.log(Object.keys(require('./src/i18n/cs.json')).join('\n'))" > /tmp/cs-keys.txt

# Check for missing keys (should be empty)
comm -23 /tmp/en-keys.txt /tmp/cs-keys.txt
```

**Expected**: Both commands return no output (all keys present)

---

## Automated Testing

### Run Specific Test Suites

```bash
# Run i18n configuration tests
npm run test -- src/i18n/config.test.js

# Run LanguageSelector component tests
npm run test -- src/components/LanguageSelector.test.jsx

# Run all tests in watch mode
npm run test:ui
```

### Verify Test Expectations Updated

```bash
# Check that tests no longer expect Polish defaults
grep -r "fallbackLng.*pl" src/**/*.test.js src/**/*.test.jsx
# Should return no matches

# Check tests now expect English defaults
grep -r "fallbackLng.*en" src/**/*.test.js src/**/*.test.jsx
# Should show updated test files
```

---

## Documentation Verification

### Verify Documentation Updates

```bash
# Check copilot instructions updated
grep -i "fallback.*english\|fallback.*en" .github/copilot-instructions.md
# Should show English as fallback

# Check no outdated Polish fallback references
grep -i "fallback.*polish\|fallback.*pl" .github/copilot-instructions.md agent-os/standards/i18n/*.md
# Should return no matches

# Verify language support documentation
cat agent-os/standards/i18n/language-support.md
# Should list all 5 languages with English first/default
```

---

## Performance Verification

### Check Bundle Size Impact

```bash
# Build production bundle
npm run build

# Check dist size
du -sh dist/

# Translation files should add minimal size (~50-100KB for 2 new languages)
ls -lh dist/assets/*.json
```

**Expected**: Modest increase in bundle size (<100KB), acceptable for 5-language support

---

## Common Issues & Solutions

### Issue: Tests failing with Polish text expectations

**Solution**: Update test assertions to expect English text instead of Polish

```javascript
// Before
expect(screen.getByText('Polski tekst')).toBeInTheDocument();

// After
expect(screen.getByText('English text')).toBeInTheDocument();
```

### Issue: Language selector still shows only 3 languages

**Solution**: Verify de.json and cs.json are imported in config.js

```javascript
// Should be present in src/i18n/config.js
import de from './de.json';
import cs from './cs.json';

//And registered in resources
resources: {
  // ...
  de: { translation: de },
  cs: { translation: cs }
}
```

### Issue: German/Czech text shows English fallback

**Solution**: Verify translation files are complete with all keys

```bash
# Run completeness check script
node scripts/check-translations.js
```

### Issue: ESLint errors

**Solution**: Run linter and fix issues

```bash
npm run lint
# Fix any import ordering or syntax issues
```

---

## Rollback Procedure

If issues are discovered and rollback is needed:

```bash
# 1. Stash or commit any work
git stash

# 2. Switch back to main branch
git checkout main

# 3. The application will work with old configuration
npm run dev

# 4. To resume work on feature
git checkout 001-en-default-language
git stash pop  # if you stashed changes
```

**Note**: No data loss occurs during rollback - language preferences are preserved in user browsers.

---

## Deployment Checklist

Before merging to main:

- [ ] All tests pass: `npm run test`
- [ ] ESLint passes: `npm run lint`
- [ ] Production build succeeds: `npm run build`
- [ ] All 5 manual test scenarios completed successfully
- [ ] Documentation updated and verified
- [ ] Translation completeness verified (all files ~220 keys)
- [ ] Performance acceptable (language switching <100ms)
- [ ] No console errors or warnings in browser
- [ ] Feature branch is up-to-date with main

---

## Support Resources

**Documentation**:
- Feature spec: [specs/001-en-default-language/spec.md](./spec.md)
- Implementation plan: [specs/001-en-default-language/plan.md](./plan.md)
- Research findings: [specs/001-en-default-language/research.md](./research.md)
- i18n contract: [specs/001-en-default-language/contracts/i18n-interface.md](./contracts/i18n-interface.md)

**External Resources**:
- i18next documentation: https://www.i18next.com/
- react-i18next: https://react.i18next.com/
- Language detection: https://github.com/i18next/i18next-browser-languageDetector

**Questions**: Refer to clarifications in spec.md or implementation plan
