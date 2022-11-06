import { LucideIcons } from "./api/fetchIcons";

type Icon = { name: string, svg: string, size: number }

export type PluginMessage
  = { type: 'getCachedIcons' }
  | { type: 'drawIcon' }
  | { type: 'generateIconComponents', icons: Icon[] }
  | { type: 'setCachedIcons', lucideIcons: LucideIcons }
  | { type: 'getPaintStyles' }
  | { type: 'close' }
