const globals = require('globals');
const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const _import = require('eslint-plugin-import');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

module.exports = [
	// Ignore built files
	{
		ignores: ['lib/**/*'],
	},
	// Configuration for all files
	{
		languageOptions: {
			globals: {
				...globals.node,
			},
			parser: tsParser,
			sourceType: 'module',
			parserOptions: {
				project: ['tsconfig.json', 'tsconfig.dev.json'],
				tsconfigRootDir: __dirname,
			},
		},
		settings: {
			'import/resolver': {
				typescript: {
					project: ['tsconfig.json', 'tsconfig.dev.json'],
				},
			},
		},
		plugins: {
			'@typescript-eslint': fixupPluginRules(typescriptEslint),
			import: fixupPluginRules(_import),
		},
		rules: {
			quotes: 'off',
			'object-curly-spacing': 'off',
			indent: ['error', 'tab'],
			'no-tabs': 'off',
			camelcase: 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'prefer-promise-reject-errors': 'off',
			'max-len': [
				'error',
				{
					code: 100,
				},
			],
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',
			'operator-linebreak': 'off',
		},
	},
	// Google, ESLint recommended, and TypeScript rules
	...fixupConfigRules(
		compat.extends(
			'eslint:recommended',
			'plugin:import/errors',
			'plugin:import/warnings',
			'plugin:import/typescript',
			'plugin:@typescript-eslint/recommended',
			'plugin:@typescript-eslint/recommended-requiring-type-checking'
		)
	),
];
