# @mheob/rollup-plugin-copy

A Rollup plugin that copies asset files while preserving the relative folder structure.

## Installation

```sh
pnpm add -D @mheob/rollup-plugin-copy
```

## Usage

```js
// rollup.config.mjs
import { copy } from '@mheob/rollup-plugin-copy';

export default {
	input: 'src/index.js',
	output: {
		dir: 'output',
		format: 'es',
	},
	plugins: [copy({ patterns: '**/*.{svg,jpg,json}' })],
};
```

## Options

| Options | Type | Mandatory | Default | Description |
| --- | --- | :-: | --- | --- |
| `patterns` | `string\|string[]` | ✅ |  | Does accept a string pattern or an array of strings patterns. |
| `rootDir` | `string` |  | `cwd` | Patterns are relative to this directory and all found files will be resolved relative to it. If files can't be found, use `path.resolve('./my/path')` to supply an absolute path. |
| `exclude` | `string\|string[]` |  | `undefined` | A glob or array of globs to exclude from copying. |

## Thanks

Inspired by the [@web/rollup-plugin-copy](https://modern-web.dev/docs/building/rollup-plugin-copy/) package.
