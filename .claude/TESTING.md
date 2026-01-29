# Testing Strategy

## Test Organization

- Tests live in `__tests__/` folders colocated with source
- Exception: Router tests in `src/router/__tests__/` (avoid TanStack Router codegen conflicts)
- Test file naming: `{component-name}.test.{ts,tsx}` (matches source file name)

## Coverage Priorities

1. **Critical**: Migration regression points
   - Path → search param redirects (`src/router/__tests__/`)
   - Zod schema validation (`src/schemas/__tests__/`)
   - Color conversion logic (`src/utils/__tests__/color_utils.test.ts`)

2. **High**: Core business logic
   - Hooks with memoization (`src/hooks/__tests__/`)
   - Component integration (`src/components/__tests__/`)

3. **Medium/Low**: UI interactions, analytics

## Test Utilities

- `src/test-utils/router.tsx` - Mock router for component tests
- `src/test-utils/render.tsx` - Custom render with router context

## Testing Best Practices

- **Pure functions**: Test exhaustively (color_utils, schemas)
- **React components**: Focus on integration over implementation details
- **Mocking complexity**: Simplify complex interaction tests, defer to E2E (Playwright) for:
  - Debounced navigation
  - Browser back/forward
  - Full user workflows
- **Test cleanup**: Always use `cleanup()` in `afterEach` to prevent DOM pollution
- **Fake timers**: Use `vi.useFakeTimers()` for debounce testing, restore in `afterEach`

## Running Tests

```bash
pnpm vitest:run  # Single run (CI)
pnpm test        # Full suite: tsc + vitest + lint + format
```
