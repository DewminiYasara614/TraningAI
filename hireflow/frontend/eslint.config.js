// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

const storageMessage =
  'Only StorageService may touch localStorage — go through ApplicationService/JobService (constitution V).';

module.exports = defineConfig([
  { ignores: ['dist/**', '.angular/**', 'coverage/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'hf', style: 'camelCase' },
      ],
      // Element components, plus attribute components on native elements (e.g. button[hf-button]).
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'hf', style: 'kebab-case' },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-globals': ['error', { name: 'localStorage', message: storageMessage }],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'localStorage', message: storageMessage },
        { object: 'globalThis', property: 'localStorage', message: storageMessage },
      ],
    },
  },
  {
    files: ['src/app/core/storage/storage.service.ts', '**/*.spec.ts'],
    rules: { 'no-restricted-globals': 'off', 'no-restricted-properties': 'off' },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
    },
  },
]);
