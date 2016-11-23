module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  plugins: [],
  rules: {
    quotes: ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true
    }]
  },
  globals: {
    define: false
  }
}
