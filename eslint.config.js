import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';

const toReadonly = obj =>
  Object.fromEntries(Object.keys(obj).map(k => [k, 'readonly']));

export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...toReadonly(globals.browser),
        ...toReadonly(globals.node),
      },
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2022,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react']
        }
      },
    },
    rules: {
      'no-unused-vars': ['error', { 
        varsIgnorePattern: 'React',
        ignoreRestSiblings: true,
        args: 'after-used',
        argsIgnorePattern: '^_'
      }],
    },
  },
]; 