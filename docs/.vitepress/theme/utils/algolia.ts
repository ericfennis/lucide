import type { LiteClient } from 'algoliasearch/lite';

/**
 * Public search credentials. The search-only key is shipped in the client bundle by
 * design, so local dev, forks and preview deployments search the production index
 * without any configuration. `VITE_ALGOLIA_*` env vars override these defaults.
 */
const DEFAULTS = {
  appId: '',
  searchApiKey: '',
  indexName: 'lucide-icons',
};

export const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || DEFAULTS.appId;
export const ALGOLIA_SEARCH_API_KEY =
  import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY || DEFAULTS.searchApiKey;
export const ALGOLIA_INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || DEFAULTS.indexName;

export const isAlgoliaEnabled = Boolean(ALGOLIA_APP_ID && ALGOLIA_SEARCH_API_KEY);

/** Must match `hitsPerPage` / `paginationLimitedTo` in docs/scripts/writeAlgoliaIndex.mts */
const HITS_PER_PAGE = 1000;
const MAX_PAGES = 3;

let clientPromise: Promise<LiteClient> | undefined;

/**
 * Lazily loads the Algolia lite client so it stays out of the initial page bundle.
 * Call it on search input focus to prefetch before the first keystroke.
 */
export function getAlgoliaClient(): Promise<LiteClient> {
  clientPromise ??= import('algoliasearch/lite').then(({ liteClient }) =>
    liteClient(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY),
  );

  return clientPromise;
}

export function prefetchAlgoliaClient() {
  if (isAlgoliaEnabled) {
    void getAlgoliaClient();
  }
}

export interface SearchIconIdsOptions {
  /** Libraries to include, e.g. `['core']` or `['core', 'lab']`. */
  libraries: string[];
  restrictSearchableAttributes?: string[];
}

const cache = new Map<string, string[]>();

/**
 * Searches the icon index and returns matching `objectID`s in relevance order.
 */
export async function searchIconIds(
  query: string,
  { libraries, restrictSearchableAttributes }: SearchIconIdsOptions,
): Promise<string[]> {
  const cacheKey = [libraries.join(','), restrictSearchableAttributes?.join(',') ?? '', query].join(
    '|',
  );
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const client = await getAlgoliaClient();
  const ids: string[] = [];
  let page = 0;
  let nbPages = 1;

  while (page < nbPages && page < MAX_PAGES) {
    const {
      results: [result],
    } = await client.searchForHits<{ objectID: string }>({
      requests: [
        {
          indexName: ALGOLIA_INDEX_NAME,
          query,
          page,
          hitsPerPage: HITS_PER_PAGE,
          attributesToRetrieve: ['objectID'],
          attributesToHighlight: [],
          filters: libraries.map((library) => `library:${library}`).join(' OR '),
          restrictSearchableAttributes,
        },
      ],
    });

    ids.push(...result.hits.map((hit) => hit.objectID));
    nbPages = result.nbPages ?? 1;
    page += 1;
  }

  cache.set(cacheKey, ids);

  return ids;
}
