import { FlatCompat } from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // Extend Next.js recommended rules
  ...compat.extends('next/core-web-vitals'),

  // TypeScript-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // ── No type errors slip through ──────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',          // ban `any`
      '@typescript-eslint/no-unsafe-assignment': 'error',     // no implicit any assignment
      '@typescript-eslint/no-unsafe-call': 'error',           // no calling unknown types
      '@typescript-eslint/no-unsafe-member-access': 'error',  // no unknown property access
      '@typescript-eslint/no-unsafe-return': 'error',         // no returning unknown types
      '@typescript-eslint/explicit-function-return-type': [   // always declare return type
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/consistent-type-imports': [         // use `import type` where possible
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [                  // catch unused variables
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // ── General quality ─────────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },

  // Ignore build output and config files
  {
    ignores: ['.next/**', 'node_modules/**', 'postcss.config.js'],
  },
];

export default config;
