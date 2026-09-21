import type { IconEntity } from '../types';

export type SortKey = 'popularity' | 'release-date' | 'name';

type SortableIcon = Pick<IconEntity, 'name' | 'popularity' | 'createdRelease' | 'awaitingRelease'>;

export function sortIcons<T extends SortableIcon>(icons: T[], sort: SortKey): T[] {
  switch (sort) {
    case 'popularity':
      return [...icons].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case 'release-date':
      return [...icons].sort((a, b) => {
        if (a.awaitingRelease !== b.awaitingRelease) return a.awaitingRelease ? -1 : 1;

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
