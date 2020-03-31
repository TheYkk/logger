module.exports = {
  root: true,
  "extends": ["airbnb", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": ["error"],
    "no-console": "off",
    "eqeqeq": "off",
    "import/order": "off",
    "global-require": "off",
    "consistent-return": "off",
    "no-param-reassign": "off",
    "camelcase": "off",
    "no-unused-vars": ["error",{
      "ignoreRestSiblings": true
    }],

    "no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }]

  },
};
