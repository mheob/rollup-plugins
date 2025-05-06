import defaultConfig from '@mheob/prettier-config';

/** @type {import('prettier').Config} */
const config = {
	...defaultConfig,

	overrides: [
		...(defaultConfig.overrides ?? []),
		{
			files: '**/*.md',
			options: {
				parser: 'markdown',
				proseWrap: 'never',
			},
		},
	],
};

export default config;
