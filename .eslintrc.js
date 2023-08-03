// eslint-disable-next-line no-undef
module.exports = {
	env: {
		browser: true,
		es2021: true,
		'cypress/globals': true,
		'jest/globals': true,
	},
	plugins: ['prettier', 'jest', 'cypress'],
	extends: [
		'eslint:recommended',
		'plugin:jest/recommended',
		'plugin:cypress/recommended',
		'prettier',
	],
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'no-var': 'error',
		'no-duplicate-imports': 'error',
		'no-template-curly-in-string': 'error',
		'no-extra-semi': 'error',
		semi: 'error',
		'prettier/prettier': 'error',
	},
	ignorePatterns: ['node_modules/', 'dist/'],
};
