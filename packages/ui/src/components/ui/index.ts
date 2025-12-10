/**
 * UI Component Library
 *
 * Wrapper components around Melt UI (Svelte 4) with GitHub Primer styling.
 *
 * Purpose: Isolate third-party dependencies for future migration to Bits UI (Svelte 5).
 * When Svelte 5 migration happens, only these files need to change.
 */

export { default as Tabs } from './Tabs.svelte';
export { default as Switch } from './Switch.svelte';

export type { Tab } from './types';
