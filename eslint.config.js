import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Adicione suas regras personalizadas aqui
    },
  },
  {
    ignores: ['node_modules/**', 'output/**'],
  },
];

