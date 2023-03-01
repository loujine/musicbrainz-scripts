module.exports = {
    "env": {
        "browser": true,
        "es2022": true,
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
        "ecmaVersion": 2020,
        "sourceType": "module"
    },
    "rules": {
        "no-console": "off",
        "no-inner-declarations": "warn",
        "no-global-assign": "warn",
        "no-redeclare": "warn",
        "no-self-assign": "warn",
        "no-undef": "warn",
        "no-useless-concat": "warn",
        "no-useless-escape": "warn",
        "no-unused-vars": "warn",
        "no-var": "error",
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
        "prefer-const": "error",
        "one-var": [
            "error",
            "never"
        ]
    }
};
