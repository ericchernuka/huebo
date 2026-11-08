/*
 * Adapted from @nkzw/oxlint-config 2.0.1.
 * Copyright (c) 2026 Nakazawa Tech
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  env: {
    browser: true,
    builtin: true,
    es2024: true,
    node: true,
  },
  ignorePatterns: ['build/**', 'coverage/**'],
  jsPlugins: [
    {
      name: 'no-only-tests',
      specifier: import.meta.resolve('eslint-plugin-no-only-tests'),
    },
    {
      name: 'perfectionist',
      specifier: import.meta.resolve('eslint-plugin-perfectionist'),
    },
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
      rules: {
        'constructor-super': 'off',
        'getter-return': 'off',
        'no-class-assign': 'off',
        'no-const-assign': 'off',
        'no-dupe-class-members': 'off',
        'no-dupe-keys': 'off',
        'no-func-assign': 'off',
        'no-import-assign': 'off',
        'no-new-native-nonconstructor': 'off',
        'no-obj-calls': 'off',
        'no-redeclare': 'off',
        'no-setter-return': 'off',
        'no-this-before-super': 'off',
        'no-undef': 'off',
        'no-unreachable': 'off',
        'no-unsafe-negation': 'off',
        'no-with': 'off',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
      },
    },
    {
      files: [
        'server/scripts/**/*.tsx',
        'server/src/app.tsx',
        'server/src/index.tsx',
        'server/src/prisma/seed.tsx',
        'server/src/worker.tsx',
      ],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['server/**/*.tsx'],
      rules: {
        'react/rules-of-hooks': 'off',
      },
    },
  ],
  plugins: ['typescript', 'import', 'oxc', 'react', 'unicorn'],
  rules: {
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'generic',
      },
    ],
    '@typescript-eslint/no-empty-object-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-unsafe-function-type': 'error',
    'array-callback-return': 'error',
    curly: 'error',
    eqeqeq: [
      'error',
      'always',
      {
        null: 'ignore',
      },
    ],
    'import-x/export': 'error',
    'import-x/no-namespace': 'error',
    'no-array-constructor': 'error',
    'no-case-declarations': 'error',
    'no-console': 'error',
    'no-empty': 'error',
    'no-fallthrough': 'error',
    'no-new-wrappers': 'error',
    'no-only-tests/no-only-tests': 'error',
    'no-prototype-builtins': 'error',
    'no-redeclare': 'error',
    'no-regex-spaces': 'error',
    'no-self-compare': 'error',
    'no-throw-literal': 'error',
    'no-undef': 'error',
    'no-unused-vars': [
      'error',
      {
        args: 'none',
        fix: {
          imports: 'safe-fix',
          variables: 'off',
        },
        varsIgnorePattern: '^_',
      },
    ],
    'no-var': 'error',
    'no-warning-comments': [
      'error',
      {
        terms: ['@nocommit'],
      },
    ],
    'object-shorthand': 'error',
    'oxc/bad-bitwise-operator': 'error',
    'perfectionist/sort-enums': [
      'error',
      {
        partitionByComment: true,
        sortByValue: 'always',
      },
    ],
    'perfectionist/sort-heritage-clauses': 'error',
    'perfectionist/sort-interfaces': 'error',
    'perfectionist/sort-jsx-props': 'error',
    'perfectionist/sort-object-types': 'error',
    'perfectionist/sort-objects': [
      'error',
      {
        partitionByComment: true,
      },
    ],
    'prefer-arrow-callback': [
      'error',
      {
        allowNamedFunctions: true,
      },
    ],
    'prefer-const': 'error',
    'prefer-object-has-own': 'error',
    'react/button-has-type': 'error',
    'react/checked-requires-onchange-or-readonly': 'error',
    'react/display-name': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/require-render-return': 'error',
    'react/rules-of-hooks': 'error',
    'react/unsupported-syntax': 'error',
    'unicorn/catch-error-name': 'error',
    'unicorn/consistent-empty-array-spread': 'error',
    'unicorn/no-abusive-eslint-disable': 'error',
    'unicorn/no-hex-escape': 'error',
    'unicorn/no-magic-array-flat-depth': 'error',
    'unicorn/no-typeof-undefined': 'error',
    'unicorn/no-unnecessary-slice-end': 'error',
    'unicorn/no-useless-promise-resolve-reject': 'error',
    'unicorn/numeric-separators-style': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-array-index-of': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-at': 'error',
    'unicorn/prefer-dom-node-append': 'error',
    'unicorn/prefer-import-meta-properties': 'error',
    'unicorn/prefer-native-coercion-functions': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-single-call': 'error',
    'unicorn/prefer-string-raw': 'error',
    'unicorn/prefer-string-replace-all': 'error',
    'unicorn/prefer-string-slice': 'error',
    'unicorn/prefer-structured-clone': 'error',
    'unicorn/prefer-top-level-await': 'error',
    'unicorn/text-encoding-identifier-case': 'error',
  },
});
