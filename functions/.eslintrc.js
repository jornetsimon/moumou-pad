module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'google',
		'plugin:@typescript-eslint/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['tsconfig.json', 'tsconfig.dev.json'],
		sourceType: 'module',
	},
	ignorePatterns: [
		'/lib/**/*', // Ignore built files.
	],
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		"quotes": 'off',
		'object-curly-spacing': 'off',
		"indent": ['error', 'tab'],
		'no-tabs': 'off',
		'camelcase': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'prefer-promise-reject-errors': 'off',
		'max-len': ['error', { code: 100 }],
		'require-jsdoc': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'operator-linebreak': 'off',
	},
};
