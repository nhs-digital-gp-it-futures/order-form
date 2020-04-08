module.exports = {
  "extends": "airbnb-base",
  "env": {
    "browser": true,
    "mocha": true,
    "node": true,
    "jest": true,
  },
  "rules": {
    "import/prefer-default-export": "off",
    "array-callback-return": "off",
    "linebreak-style": "off",
    "no-console": 1,
    "import/no-extraneous-dependencies": ["error", { "devDependencies": ["**/test-utils/**", '**/*test.js', '**/testcafeRunner.js', '**/server.js'] }]
  },
  "globals": {
    "fixture": "readonly"
  },
  "overrides": [
    {
      "files": ["**/test-utils/**", "**/ui.test.js"],
        "rules": {
          "newline-per-chained-call": 0,
          "max-len": "off"
        }
      }
    ]
};

