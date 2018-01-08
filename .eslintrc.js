module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "mocha": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:you-dont-need-lodash-underscore/compatible"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "arrowFunctions": true,
            "blockBindings": true,
            "jsx": false,
            "modules": true
        },
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "rules": {
        "accessor-pairs": 2,
        "array-bracket-spacing": [
            2,
            "never"
        ],
        "array-callback-return": 0,
        "arrow-body-style": [
            2,
            "as-needed"
        ],
        "arrow-parens": [
            2,
            "as-needed"
        ],
        "arrow-spacing": [
            2,
            {
                "after": true,
                "before": true
            }
        ],
        "block-scoped-var": 2,
        "block-spacing": [
            2,
            "never"
        ],
        "brace-style": 0,
        "callback-return": 2,
        "camelcase": 0,
        "comma-spacing": 0,
        "comma-style": [
            2,
            "last"
        ],
        "complexity": 2,
        "computed-property-spacing": [
            2,
            "never"
        ],
        "consistent-return": 2,
        "consistent-this": 0,
        "no-console": 0,
        "curly": 2,
        "default-case": 0,
        "dot-location": [
            2,
            "property"
        ],
        "dot-notation": 0,
        "eol-last": 2,
        "eqeqeq": 0,
        "func-names": 0,
        "func-style": [
            2,
            "declaration"
        ],
        "generator-star-spacing": 2,
        "global-require": 2,
        "guard-for-in": 2,
        "handle-callback-err": 2,
        "id-blacklist": 2,
        "id-length": 0,
        "id-match": 2,
        "indent": 0,
        "init-declarations": 0,
        "jsx-quotes": 2,
        "key-spacing": 2,
        "keyword-spacing": 0,
        "linebreak-style": [
            2,
            "unix"
        ],
        "lines-around-comment": 2,
        "max-depth": 2,
        "max-len": [
            1,
            100,
            4,
            {"ignoreUrls": true,
             "ignoreComments": true}
        ],
        "max-nested-callbacks": 2,
        "max-params": 0,
        "new-parens": 0,
        "newline-after-var": 0,
        "newline-per-chained-call": 0,
        "no-alert": 2,
        "no-array-constructor": 2,
        "no-bitwise": 2,
        "no-caller": 2,
        "no-catch-shadow": 2,
        "no-confusing-arrow": 2,
        "no-continue": 0,
        "no-div-regex": 2,
        "no-else-return": 2,
        "no-empty-function": 0,
        "no-eq-null": 2,
        "no-eval": 2,
        "no-extend-native": 2,
        "no-extra-bind": 2,
        "no-extra-label": 2,
        "no-extra-parens": 0,
        "no-floating-decimal": 2,
        "no-implicit-coercion": 2,
        "no-implicit-globals": 2,
        "no-implied-eval": 2,
        "no-inline-comments": 0,
        "no-inner-declarations": [
            2,
            "functions"
        ],
        "no-invalid-this": 2,
        "no-iterator": 2,
        "no-label-var": 2,
        "no-labels": 2,
        "no-lone-blocks": 2,
        "no-lonely-if": 0,
        "no-loop-func": 2,
        "no-magic-numbers": 0,
        "no-mixed-requires": 2,
        "no-multi-spaces": 0,
        "no-multi-str": 2,
        "no-multiple-empty-lines": 0,
        "no-native-reassign": 0,
        "no-negated-condition": 0,
        "no-nested-ternary": 0,
        "no-new": 2,
        "no-new-func": 2,
        "no-new-object": 2,
        "no-new-require": 2,
        "no-new-wrappers": 2,
        "no-octal-escape": 2,
        "no-param-reassign": 0,
        "no-path-concat": 2,
        "no-plusplus": 0,
        "no-process-env": 2,
        "no-process-exit": 2,
        "no-proto": 2,
        "no-restricted-imports": 2,
        "no-restricted-modules": 2,
        "no-restricted-syntax": 2,
        "no-return-assign": 2,
        "no-script-url": 2,
        "no-self-compare": 2,
        "no-sequences": 2,
        "no-shadow": 0,
        "no-shadow-restricted-names": 2,
        "no-spaced-func": 2,
        "no-sync": 2,
        "no-ternary": 0,
        "no-throw-literal": 2,
        "no-trailing-spaces": 2,
        "no-undef": 2,
        "no-undef-init": 2,
        "no-undefined": 0,
        "no-underscore-dangle": 0,
        "no-unmodified-loop-condition": 2,
        "no-unneeded-ternary": [
            2,
            {
                "defaultAssignment": true
            }
        ],
        "no-unused-expressions": 2,
        "no-use-before-define": 0,
        "no-useless-call": 2,
        "no-useless-concat": 2,
        "no-useless-constructor": 2,
        "no-var": 0,
        "no-void": 2,
        "no-warning-comments": 0,
        "no-whitespace-before-property": 2,
        "no-with": 2,
        "object-curly-spacing": [
            2,
            "never"
        ],
        "object-shorthand": 0,
        "one-var": 0,
        "one-var-declaration-per-line": [
            2,
            "initializations"
        ],
        "operator-assignment": 2,
        "operator-linebreak": 0,
        "padded-blocks": 0,
        "prefer-arrow-callback": 0,
        "prefer-const": 2,
        "prefer-reflect": 0,
        "prefer-rest-params": 2,
        "prefer-spread": 0,
        "prefer-template": 0,
        "quote-props": 0,
        "quotes": 0,
        "radix": [
            2,
            "as-needed"
        ],
        "require-jsdoc": 0,
        "require-yield": 2,
        "semi": 0,
        "semi-spacing": [
            2,
            {
                "after": true,
                "before": false
            }
        ],
        "sort-imports": 2,
        "sort-vars": 0,
        "space-before-blocks": 0,
        "space-before-function-paren": 0,
        "space-in-parens": 0,
        "space-infix-ops": 0,
        "space-unary-ops": [
            2,
            {
                "words": true,
                "nonwords": false
            }
        ],
        "spaced-comment": [
            2,
            "always"
        ],
        "strict": 0,
        "template-curly-spacing": [
            2,
            "never"
        ],
        "valid-jsdoc": 2,
        "vars-on-top": 0,
        "wrap-regex": 2,
        "yield-star-spacing": 2,
        "yoda": [
            2,
            "never"
        ]
    }
};
