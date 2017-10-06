module.exports = {
  extends: 'standard',
  parser: 'babel-eslint',
  env: {
    node: true,
    browser: true,
  },
  rules: {
    semi: [2, 'always'],
    'arrow-parens': ['error', 'always'],
    'comma-dangle': [2, 'always-multiline'],
    indent: [2, 2, {
      'SwitchCase': 1,
    }],
    'space-before-function-paren': [2, {
      'anonymous': 'always',
      'named': 'never',
    }],
  },
  globals: {
    Prism: true,
    dat: false,
    __SCROLLBAR_VERSION__: true
  }
}
