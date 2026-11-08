import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: [
    'typescript',
    'unicorn',
    'oxc',
    'import',
    'promise',
    'react',
    'jsx-a11y',
    'vitest',
  ],
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'error',
  },
  env: {
    browser: true,
    builtin: true,
    es2024: true,
  },
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    'coverage/**',
    'tools/oxlint/anti-slop/**',
  ],
  jsPlugins: [
    { name: 'anti-slop', specifier: './tools/oxlint/anti-slop/index.ts' },
    // The React Compiler's own rules ship in eslint-plugin-react-hooks. Its
    // rules-of-hooks and exhaustive-deps duplicate oxlint's built-in react
    // rules, so only the compiler rules are enabled under this name.
    { name: 'react-compiler', specifier: 'eslint-plugin-react-hooks' },
    { name: 'no-only-tests', specifier: 'eslint-plugin-no-only-tests' },
  ],
  rules: {
    complexity: ['error', { max: 10 }],
    'max-depth': ['error', { max: 3 }],
    'max-params': ['error', { max: 3 }],
    'max-nested-callbacks': ['error', { max: 4 }],
    'max-lines-per-function': [
      'error',
      { max: 60, skipBlankLines: true, skipComments: true },
    ],
    'max-lines': [
      'error',
      { max: 300, skipBlankLines: true, skipComments: true },
    ],
    'max-statements': ['error', { max: 20 }],
    'import/no-cycle': 'error',
    'oxc/no-accumulating-spread': 'error',

    'anti-slop/no-array-filter-map': 'error',
    'anti-slop/no-reduce-accumulator-copy': 'error',
    'anti-slop/no-chained-type-assertions': 'error',
    'anti-slop/no-conditional-empty-object-spread': 'error',
    'anti-slop/no-known-value-widening': 'error',
    'anti-slop/no-module-mocking': 'error',
    'anti-slop/no-object-parameters': 'error',
    'anti-slop/no-reflect-apply': 'error',
    'anti-slop/no-reflect-get': 'error',
    'anti-slop/no-runtime-typeof': 'error',
    'anti-slop/no-shape-in-symbol-names': 'error',
    'anti-slop/no-unknown-parameters': 'error',
    'anti-slop/no-unknown-returns': 'error',
    'anti-slop/no-unknown-type-aliases': 'error',
    'anti-slop/no-unsafe-dictionary-type': 'error',
    'anti-slop/no-widen-then-assert': 'error',
    'anti-slop/require-readable-spacing': 'error',
    'anti-slop/require-safety-comment-for-type-assertion': 'error',

    // The automatic JSX runtime doesn't need React in scope.
    'react/react-in-jsx-scope': 'off',
    // The React Compiler memoizes context values.
    'react/jsx-no-constructed-context-values': 'off',
    // eslint-plugin-jsx-a11y's recommended options, so a table can be an ARIA grid.
    'jsx-a11y/no-noninteractive-element-to-interactive-role': [
      'error',
      {
        fieldset: ['radiogroup', 'presentation'],
        li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
        ol: [
          'listbox',
          'menu',
          'menubar',
          'radiogroup',
          'tablist',
          'tree',
          'treegrid',
        ],
        table: ['grid'],
        td: ['gridcell'],
        ul: [
          'listbox',
          'menu',
          'menubar',
          'radiogroup',
          'tablist',
          'tree',
          'treegrid',
        ],
      },
    ],
    'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    'react/button-has-type': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/no-unknown-property': 'error',
    'react-compiler/static-components': 'error',
    'react-compiler/use-memo': 'error',
    'react-compiler/void-use-memo': 'error',
    'react-compiler/preserve-manual-memoization': 'error',
    'react-compiler/incompatible-library': 'error',
    'react-compiler/immutability': 'error',
    'react-compiler/globals': 'error',
    'react-compiler/refs': 'error',
    'react-compiler/set-state-in-effect': 'error',
    'react-compiler/error-boundaries': 'error',
    'react-compiler/purity': 'error',
    'react-compiler/set-state-in-render': 'error',
    'react-compiler/unsupported-syntax': 'error',
    'react-compiler/config': 'error',
    'react-compiler/gating': 'error',

    '@typescript-eslint/no-explicit-any': 'error',
    curly: 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-console': 'error',
    'no-only-tests/no-only-tests': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx,js,jsx}', '**/__tests__/**'],
      rules: {
        'max-lines-per-function': 'off',
        'max-lines': 'off',
        'max-statements': 'off',
        'max-nested-callbacks': 'off',
        // expectPath polls the URL with expect.poll.
        'vitest/expect-expect': [
          'error',
          { assertFunctionNames: ['expect', 'expect.*', 'expectPath'] },
        ],
      },
    },
  ],
})
