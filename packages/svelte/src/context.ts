import { getContext } from 'svelte';

const LucideGlobalContextKey = Symbol('LucideGlobalContext');

const lucideGlobalStyleContext = getContext(LucideGlobalContextKey);

export default lucideGlobalStyleContext
