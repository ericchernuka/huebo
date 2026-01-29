# Huebo - HSB Color Picker

## Project Overview (WHY)

HSB color picker with URL-driven state. Users select hue via slider, saturation/brightness via 8×8 grid. All state lives in URL search params (h/s/b).

- React 19 + Vite 7 + TanStack Router
- Node >= 23, pnpm >= 10 (see package.json for full versions)

## Architecture Patterns (HOW)

### URL Params = Source of Truth

- Search params: `?h=120&s=50&b=75`
- Validated via Zod schemas in `src/schemas/search-params.ts`
- **Never** bypass validation

### Debounced Navigation

- 150ms debounce via `useDebouncedCallback` in `Huebo.tsx`
- Local `displayHue` state for instant UI feedback during slider drag
- **Never** bypass this debounce - breaks UX

### Color Pipeline

- HSB → RGB → Hex via pure functions in `src/utils/color_utils.ts`
- No side effects, memoizable, testable

### File-Based Routing

- Routes in `src/router/routes/` auto-generate `src/router/route-tree.gen.ts`
- **NEVER edit route-tree.gen.ts** - TanStack Router plugin regenerates it

### Performance

- React Compiler auto-optimizes (configured in `vite.config.ts`)
- Manual memo/useCallback/useMemo only when profiling shows need
- Pure utils enable safe memoization

## Project Structure (WHAT)

```
src/
├── components/          # Flat UI components (kebab-case names)
│   ├── __tests__/      # Component tests colocated
│   ├── huebo.tsx       # Main component with debounced navigation
│   ├── swatch-grid.tsx # 8×8 saturation/brightness grid
│   ├── hue-selector.tsx # Hue slider
│   └── ...             # color-outputs, google-analytics, etc.
├── hooks/
│   ├── __tests__/
│   └── useColorFormats.ts
├── router/
│   ├── __tests__/      # Router tests (outside routes/)
│   ├── routes/         # File-based routes
│   └── route-tree.gen.ts # AUTO-GENERATED - DO NOT EDIT
├── schemas/
│   ├── __tests__/
│   └── search-params.ts # Zod validation for URL params
├── utils/
│   ├── __tests__/
│   ├── color_utils.ts  # Pure HSB→RGB→Hex conversions
│   └── hue-increments.ts # Grid builder
├── test-utils/         # Shared test helpers (router, render)
├── constants.ts        # INCREMENTS [12,25,38,50,62,75,88,100] drives 8×8 grid
├── setupTests.ts       # Vitest + RTL config
└── index.tsx          # Entry point
```

Key files:

- `src/constants.ts` - INCREMENTS array drives 8×8 grid structure
- `src/utils/color_utils.ts` - All color conversion logic
- `src/components/Huebo.tsx` - Main component with debounced navigation

## Development Workflow (HOW)

```bash
pnpm dev      # :3000 auto-opens
pnpm build    # → /build
pnpm test     # parallel: tsc + vitest + eslint + prettier
pnpm format   # auto-format
```

## Critical Constraints

- `route-tree.gen.ts` auto-regenerates on route changes - edits will be overwritten
- Hue changes require 150ms debounce for responsive UX during slider drag
- Package manager: pnpm (enforced by engines field)
- INCREMENTS array defines grid layout - changes affect 64 swatch structure
- Search params flow through Zod validation

## Code Conventions

- Named exports (routes excepted)
- Props: `interface` over `type`
- **File naming**: kebab-case for all files (e.g., `color-outputs.tsx`, `hue-selector.tsx`)
- **Tests**: `*.test.{ts,tsx}` co-located with source in `__tests__/` folders
  - Exception: router tests in `src/router/__tests__/` (outside `routes/` to avoid codegen conflicts)
- Utils: no side effects
- Linters/formatters handle style

## Environment

- Optional `VITE_GOOGLE_ANALYTICS_ID` for GA4 tracking

## Testing

For testing information see [TESTING.md](./TESTING.md)
