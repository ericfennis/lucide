import { computed, ref, shallowRef, watch, type ComputedRef, type Ref } from 'vue';
import { isAlgoliaEnabled, searchIconIds } from '../utils/algolia';

interface SearchableIcon {
  name: string;
  externalLibrary?: string;
}

/** Matches the `objectID` scheme used in docs/scripts/writeAlgoliaIndex.mts */
export const entityId = (icon: SearchableIcon) =>
  icon.externalLibrary ? `${icon.externalLibrary}/${icon.name}` : icon.name;

export interface UseIconSearchOptions {
  restrictSearchableAttributes?: string[];
}

export interface UseIconSearchResult<T> {
  /** Matching icons in relevance order, or the full collection when the query is empty. */
  results: ComputedRef<T[]>;
  /** `true` while a search request is in flight. */
  isPending: Ref<boolean>;
}

let warnedDisabled = false;

const useIconSearch = <T extends SearchableIcon>(
  query: Ref<string>,
  collection: Ref<T[]>,
  { restrictSearchableAttributes }: UseIconSearchOptions = {},
): UseIconSearchResult<T> => {
  if (!isAlgoliaEnabled && !warnedDisabled && typeof window !== 'undefined') {
    warnedDisabled = true;
    console.warn(
      'Algolia search is not configured (VITE_ALGOLIA_APP_ID / VITE_ALGOLIA_SEARCH_API_KEY), icon search is disabled.',
    );
  }

  const byId = computed(() => new Map(collection.value.map((icon) => [entityId(icon), icon])));

  // Joined into a string so re-sorting the collection does not trigger a new request.
  const libraries = computed(() =>
    [...new Set(collection.value.map((icon) => icon.externalLibrary ?? 'core'))].sort().join(','),
  );

  const hitIds = shallowRef<string[]>([]);
  const isPending = ref(false);
  let requestSeq = 0;

  watch(
    [query, libraries],
    async ([searchQuery, libs]) => {
      if (!searchQuery || !isAlgoliaEnabled) {
        isPending.value = false;
        return;
      }

      const seq = ++requestSeq;
      isPending.value = true;

      try {
        const ids = await searchIconIds(searchQuery, {
          libraries: libs.split(','),
          restrictSearchableAttributes,
        });

        if (seq === requestSeq) {
          hitIds.value = ids;
        }
      } catch (error) {
        console.error('Algolia search failed', error);

        if (seq === requestSeq) {
          hitIds.value = [];
        }
      } finally {
        if (seq === requestSeq) {
          isPending.value = false;
        }
      }
    },
    { immediate: true },
  );

  const results = computed(() => {
    if (!query.value || !isAlgoliaEnabled) {
      return collection.value;
    }

    // Hits without a local entity (index ahead of the deployed site, or a library that
    // is not loaded) are dropped.
    return hitIds.value
      .map((id) => byId.value.get(id))
      .filter((icon): icon is T => icon !== undefined);
  });

  return { results, isPending };
};

export default useIconSearch;
