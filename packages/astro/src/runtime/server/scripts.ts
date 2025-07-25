import type { SSRResult } from '../../types/public/internal.js';
import islandScript from './astro-island.prebuilt.js';
import islandScriptDev from './astro-island.prebuilt-dev.js';
import { ISLAND_STYLES } from './astro-island-styles.js';

export function determineIfNeedsHydrationScript(result: SSRResult): boolean {
	if (result._metadata.hasHydrationScript) {
		return false;
	}
	return (result._metadata.hasHydrationScript = true);
}

export function determinesIfNeedsDirectiveScript(result: SSRResult, directive: string): boolean {
	if (result._metadata.hasDirectives.has(directive)) {
		return false;
	}
	result._metadata.hasDirectives.add(directive);
	return true;
}

export type PrescriptType = 'both' | 'directive';

function getDirectiveScriptText(result: SSRResult, directive: string): string {
	const clientDirectives = result.clientDirectives;
	const clientDirective = clientDirectives.get(directive);
	if (!clientDirective) {
		throw new Error(`Unknown directive: ${directive}`);
	}
	return clientDirective;
}

export function getPrescripts(result: SSRResult, type: PrescriptType, directive: string): string {
	// Note that this is a classic script, not a module script.
	// This is so that it executes immediately, and when the browser encounters
	// an astro-island element, the callbacks will fire immediately, causing the JS
	// deps to be loaded immediately.
	switch (type) {
		case 'both':
			return `<style>${ISLAND_STYLES}</style><script>${getDirectiveScriptText(result, directive)}</script><script>${
				process.env.NODE_ENV === 'development' ? islandScriptDev : islandScript
			}</script>`;
		case 'directive':
			return `<script>${getDirectiveScriptText(result, directive)}</script>`;
	}
}
