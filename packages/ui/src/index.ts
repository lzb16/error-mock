// Import styles to ensure they're included in bundle
import './styles/main.css';

// Export main App component
export { default as App } from './App.svelte';

// Export stores
export * from './stores/config';
export * from './stores/rules';

