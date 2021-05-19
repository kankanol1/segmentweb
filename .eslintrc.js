module.exports = {
  root: true,
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/no-parsing-error': [2, {
      'x-invalid-end-tag': false
    }],
    'no-undef': 'off',
    'no-unused-vars': 'warn',
    'vue/no-unused-vars': "off",
    'camelcase': 'off',
    "no-self-assign": [
      "error",
      {
        "props": false
      }
    ]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
