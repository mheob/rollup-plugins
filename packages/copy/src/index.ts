/* eslint-disable unicorn/prevent-abbreviations */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { glob } from 'glob';
import type { Plugin } from 'rollup';

export interface CopyOptions {
	exclude?: string | string[];
	patterns: string | string[];
	rootDir?: string;
}

/**
 * Lists all files using the specified glob, starting from the given root directory.
 *
 * Will return all matching file paths fully resolved.
 *
 * @param fromGlob - The glob pattern to match files against.
 * @param rootDir - The root directory to start the search from.
 * @param ignore - An optional array of glob patterns to ignore.
 * @returns A list of file paths.
 */
async function listFiles(
	fromGlob: string,
	rootDir: string,
	ignore?: string | string[],
): Promise<string[]> {
	const files = await glob(fromGlob, { cwd: rootDir, dot: true, ignore });
	const filesWithDirs = files.map(filePath => path.resolve(rootDir, filePath));
	const filesWithOutDirs = filesWithDirs.filter(filePath => !fs.lstatSync(filePath).isDirectory());

	return filesWithOutDirs;
}

/**
 * Converts the given patterns to a list of file paths.
 *
 * @param inPatterns - The patterns to match files against.
 * @param rootDir - The root directory to start the search from.
 * @param exclude - An optional array of glob patterns to ignore.
 * @returns A list of file paths.
 */
async function patternsToFiles(
	inPatterns: string | string[],
	rootDir: string,
	exclude: string | string[],
): Promise<string[]> {
	const patterns = typeof inPatterns === 'string' ? [inPatterns] : inPatterns;
	const listFilesPromises = patterns.map(pattern => listFiles(pattern, rootDir, exclude));
	const arrayOfFilesArrays = await Promise.all(listFilesPromises);
	const files: string[] = [];

	for (const filesArray of arrayOfFilesArrays) {
		for (const filePath of filesArray) {
			files.push(filePath);
		}
	}

	return files;
}

interface CopyPluginOptions {
	exclude: string | string[];
	patterns: string | string[];
	rootDir?: string;
}

/**
 * Copies all files from the given patterns retaining relative paths relative to the root directory.
 *
 * @example
 * // Copy all svg, jpg and json files
 * copy({ patterns: '**\/*.{svg,jpg,json}' })
 * // Copy svg files from two different folders
 * copy({ patterns: ['icons\/*.svg', 'test/icons\/*.svg'] })
 * // Copy all svg files relative to given rootDir
 * copy({ patterns: '**\/*.svg', rootDir: './my-path/' })
 * // you can combine it with path.resolve
 * copy({ patterns: '**\/*.svg', rootDir: path.resolve('./my-path/')  })
 *
 * @param  options - The options for the plugin.
 * @param  options.patterns - Single glob or an array of globs
 * @param  options.exclude - Single glob or an array of globs
 * @param  options.rootDir - Defaults to current working directory
 * @returns A Rollup Plugin
 */
export default function copy({
	exclude,
	patterns = [],
	rootDir = process.cwd(),
}: CopyPluginOptions): Plugin {
	const resolvedRootDir = path.resolve(rootDir);
	let filesToCopy: string[] = [];

	const copyPlugin = {
		async buildStart() {
			filesToCopy = await patternsToFiles(patterns, rootDir, exclude);
			for (const filePath of filesToCopy) {
				this.addWatchFile(filePath);
			}
		},
		async generateBundle() {
			for (const filePath of filesToCopy) {
				const fileName = path.relative(resolvedRootDir, filePath);
				this.emitFile({
					fileName,
					source: fs.readFileSync(filePath),
					type: 'asset',
				});
			}
		},
		name: '@mheob/rollup-plugin-copy',
	} satisfies Plugin;

	return copyPlugin;
}
