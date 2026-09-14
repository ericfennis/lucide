import type { IconEntity } from '../types';

export type SortKey = 'popularity' | 'release-date' | 'name';

export function sortIcons<T extends IconEntity>(icons: T[], sort: SortKey): T[] {
  switch (sort) {
    case 'popularity':
      return [...icons].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case 'release-date':
      return [...icons].sort((a, b) => {
        const aDate = a.createdRelease?.date ? new Date(a.createdRelease.date).getTime() : 0;
        const bDate = b.createdRelease?.date ? new Date(b.createdRelease.date).getTime() : 0;
        return bDate - aDate;
      });
    case 'name':
      return [...icons].sort((a, b) => a.name.localeCompare(b.name));
    default:
      return icons;
  }
}
