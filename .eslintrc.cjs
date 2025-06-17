module.exports = {
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  globals: {
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  plugins: [
    'react',
    'react-hooks',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': ['error', { 
      varsIgnorePattern: 'React',
      ignoreRestSiblings: true,
      args: 'after-used',
      argsIgnorePattern: '^_'
    }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 