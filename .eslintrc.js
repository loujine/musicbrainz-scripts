module.exports = {
    "env": {
        "browser": true,
        "es2020": true,
        "es6": true,
        "greasemonkey": true,
    },
    "extends": [
        "eslint:recommended",
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "arrowFunctions": true,
            "blockBindings": true,
            "jsx": false,
            "modules": false
        },
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "rules": {
        "no-console": "off",
        "no-inner-declarations": "warn",
        "no-global-assign": "warn",
        "no-redeclare": "off",
        "no-self-assign": "warn",
        "no-undef": "warn",
        "no-useless-concat": "warn",
        "no-useless-escape": "warn",
        "no-unused-vars": "warn",
        "no-var": "off",
        "indent": [
            "off",
            4
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "max-len": [
            1,
            100,
            4,
            {
                "ignoreUrls": true,
                "ignoreComments": true
            }
        ],
        "prefer-const": "off",
        "one-var": [
            "error",
            "never"
        ]
    }
};
