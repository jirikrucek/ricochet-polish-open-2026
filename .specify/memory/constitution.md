<!--
Sync Impact Report:
- Version: Initial → 1.0.0
- Principles Added: DDD, TDD, SOLID, Dual-Mode Architecture, Internationalization, Domain Integrity
- Templates Status: ✅ All templates validated for constitution alignment
- Follow-up: None - all placeholders filled
-->

# Ricochet Tournament Organization App Constitution

## Core Principles

### I. Domain-Driven Design (DDD)

**MUST** organize all business logic around tournament domain concepts:
- **Domain Logic**: Pure business logic functions in `utils/` (bracket progression, match state transitions) MUST have zero dependencies on UI or storage implementations
- **Ubiquitous Language**: Code MUST use tournament terminology consistently (brackets, rounds, seeding, progression, micro-points)
- **Bounded Contexts**: Tournament management, match tracking, and player profiles MUST remain separate concerns with clear boundaries
- **Repository Pattern**: All data access MUST be abstracted through custom hooks (`usePlayers`, `useMatches`, `useTournamentMatches`)
- **Domain Models**: Tournament, Player, Match entities MUST have explicit boundaries and validation rules

**Rationale**: DDD ensures the codebase mirrors the real-world tournament domain, making it maintainable and understandable for developers familiar with tournament operations. Pure domain logic enables testing without UI or database dependencies.

### II. Test-Driven Development (TDD) (NON-NEGOTIABLE)

**MUST** write tests before or alongside implementation:
- Tests written → Implementation → Tests pass (Red-Green-Refactor cycle)
- All `utils/` functions MUST have unit tests with >80% coverage on critical paths
- Custom hooks SHOULD have integration tests
- Complex components SHOULD have component tests
- Test files MUST be placed adjacent to implementation with `.test.js` or `.test.jsx` extension

**Testing Priorities**:
1. **Priority 1 (MANDATORY)**: Critical business logic (bracket progression, match state transitions, tournament CRUD)
2. **Priority 2 (REQUIRED)**: Data hooks with dual-mode storage, real-time subscriptions
3. **Priority 3 (RECOMMENDED)**: Complex interactive components, form validation
4. **Lower Priority**: Simple presentational components, styling-only changes

**Rationale**: TDD prevents regressions in complex tournament logic where manual testing is insufficient. The bracket progression system has intricate rules that MUST be validated automatically.

### III. SOLID Principles

**MUST** adhere to all five SOLID principles:

- **Single Responsibility**: Each component/hook/utility has ONE reason to change (e.g., `usePlayers` only handles player data operations; `BracketCanvas` only renders bracket visualization)
- **Open/Closed**: Dual-mode storage pattern allows extension (Supabase or localStorage) without modifying core logic; translation system supports adding languages without changing components
- **Liskov Substitution**: Storage implementations (Supabase/localStorage) are interchangeable; all hooks follow consistent interface patterns (loading, error, data)
- **Interface Segregation**: Contexts expose only necessary methods; custom hooks return focused interfaces
- **Dependency Inversion**: Components depend on hooks (abstractions), not direct database access; business logic in `utils/` has no dependencies on React or storage

**Rationale**: SOLID principles ensure the codebase remains flexible and maintainable as requirements evolve. The dual-mode storage demonstrates DIP by allowing tournament logic to work independently of data source.

### IV. Dual-Mode Architecture (NON-NEGOTIABLE)

**MUST** support both Supabase cloud database AND localStorage fallback:
- **ALWAYS check** `isSupabaseConfigured` boolean before data operations
- The app MUST operate in ONE mode: Supabase OR localStorage, never both simultaneously
- All data access hooks MUST implement both paths with identical interfaces
- Real-time features (Supabase channels) MUST gracefully degrade to storage events (localStorage)
- Schema mapping MUST convert between camelCase (app) and snake_case (Supabase)

**Rationale**: Dual-mode ensures the app works offline for local tournaments and online for remote spectators. This architecture requirement is fundamental to the product's value proposition.

### V. Internationalization (i18n)

**MUST** maintain complete 5-language support:
- All UI text MUST be externalized to translation files (en.json, pl.json, de.json, nl.json, cs.json)
- When adding or modifying UI text, you MUST update ALL 5 language files
- Translation keys MUST use nested structure with dot-notation access (`t('section.key')`)
- English (en) is the fallback language (fallbackLng: 'en')
- German and Czech translations may be partial and rely on English fallback

**Rationale**: International tournament support requires maintaining language parity. The nested key structure prevents naming collisions and improves organization.

### VI. Domain Integrity (Brazilian Double Elimination)

**MUST** preserve the strict Brazilian double elimination tournament structure:
- Winners Bracket: 5 rounds (WB)
- Losers Bracket: 6 rounds (LB)
- Grand Finals and placement matches with specific rules
- Match IDs MUST follow pattern: `{bracket}-r{round}-m{matchNum}` (e.g., "wb-r1-m1")
- Drop patterns defined in `bracketLogic.js` are IMMUTABLE without full bracket flow analysis
- Best-of rules: BO5 for WB/GF, BO3 for LB and placement matches

**Rationale**: The Brazilian double elimination system has precise mathematical properties. Incorrect drop patterns break tournament integrity and player fairness.

## Technology Stack Requirements

### Mandatory Technologies

- **React 19.2** with functional components only (exception: ErrorBoundary class component)
- **Vite** for development and production builds
- **React Router v7** for routing
- **Context API** for state management (NO Redux or other state libraries)
- **i18next** for internationalization
- **Vitest** with jsdom for testing
- **@testing-library/react** for component testing

### Storage Layer

- **Supabase** (PostgreSQL) for cloud database (optional)
- **LocalStorage** for offline fallback
- Storage mode selection MUST be automatic based on environment configuration

### UI Libraries (Approved)

- **Lucide React** for icons
- **@dnd-kit** for drag-and-drop
- **react-zoom-pan-pinch** for bracket visualization
- **qrcode.react** for QR code generation

### File Organization (MANDATORY)

```
src/
├── pages/         # Route components (one per route)
├── contexts/      # Global state providers
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks for data operations
├── utils/         # Pure business logic functions
├── i18n/          # Translation files (5 languages)
├── constants/     # Shared constants
├── lib/           # Third-party integrations
└── types/         # TypeScript type definitions
```

## Development Workflow

### Code Standards

1. **File Extensions**: Use `.jsx` for components with JSX, `.js` for utilities, `.tsx`/`.ts` for TypeScript
2. **Import Ordering**: Group by type: external libs → internal modules → styles
3. **ESLint Compliance**: Follow eslint.config.js (unused variables starting with uppercase are allowed)
4. **Naming Conventions**:
   - Components: PascalCase (e.g., `PlayerProfileModal.jsx`)
   - Hooks: camelCase with `use` prefix (e.g., `usePlayers.js`)
   - Utilities: camelCase (e.g., `bracketLogic.js`)
   - localStorage keys: `ricochet_*` prefix (e.g., `ricochet_tournaments_meta`)

### Testing Requirements

- Run tests before pushing: `npm run test`
- All new utilities MUST have unit tests
- All new hooks SHOULD have integration tests
- Mock Supabase in tests using Vitest mocking patterns
- Use `@testing-library/react` for component tests, not enzyme

### Error Handling

- Wrap app in ErrorBoundary (already configured in main.jsx)
- Use `console.error()` with descriptive messages for debugging
- Try-catch blocks for async operations with meaningful error messages
- Display user-friendly error messages via UI, log technical details to console

### Code Review Checklist

Before merging, verify:
- [ ] All 5 language files updated for UI text changes
- [ ] `isSupabaseConfigured` checked before data operations
- [ ] Tests written and passing
- [ ] ESLint passes without errors
- [ ] No hardcoded tournament logic changes (bracket drop patterns)
- [ ] Component follows single responsibility principle
- [ ] Domain logic isolated in `utils/` without UI dependencies

## Governance

This constitution supersedes all other development practices. All pull requests and code reviews MUST verify compliance with these principles.

**Amendment Process**:
- Amendments require explicit documentation of changes and rationale
- Version increments follow semantic versioning:
  - **MAJOR**: Backward incompatible governance/principle removals or redefinitions
  - **MINOR**: New principle/section added or materially expanded guidance
  - **PATCH**: Clarifications, wording improvements, typo fixes
- Last amended date MUST be updated on any content change

**Compliance**:
- All code reviews MUST reference specific principles when requesting changes
- Complexity additions MUST be justified against SOLID and DDD principles
- Runtime development guidance is maintained in `.github/copilot-instructions.md`
- Standards are maintained in `agent-os/standards/` directory

**Version**: 1.0.0 | **Ratified**: 2026-02-16 | **Last Amended**: 2026-02-16
