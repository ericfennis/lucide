import fs from 'fs';
import path from 'path';
import { loadEnvFile } from 'node:process';
import { readSvgDirectory } from '@lucide/helpers';
import type { IndexSettings } from 'algoliasearch';

const currentDir = process.cwd();
const dataDirectory = path.resolve(currentDir, '.vitepress/data');
const recordsFile = path.resolve(dataDirectory, 'algoliaRecords.json');

try {
  // Load environment variables from .env file, if it exists.
  loadEnvFile(`${currentDir}/.env`);
} catch {
  // No .env file, so rely on the environment as-is.
}

type Library = 'core' | 'lab';

interface AlgoliaIconRecord {
  /** Icon name, prefixed with the library for non-core icons (e.g. `lab/burger`). */
  objectID: string;
  name: string;
  library: Library;
  /** Alias names only, deprecated aliases included. */
  aliases: string[];
  tags: string[];
  categories: string[];
  /** Free-text use-case phrases from the icon JSON (`use-cases`). */
  useCases: string[];
  popularity: number;
  /** Unix timestamp (seconds) of the release that introduced the icon, `null` when unknown. */
  createdAt: number | null;
  deprecated: boolean;
}

interface IconCollection {
  library: Library;
  iconsDir: string;
  popularityDir: string;
  releaseDir?: string;
}

const collections: IconCollection[] = [
  {
    library: 'core',
    iconsDir: path.resolve(currentDir, '../icons'),
    popularityDir: path.resolve(dataDirectory, 'iconPopularity'),
    releaseDir: path.resolve(dataDirectory, 'releaseMetadata'),
  },
  {
    library: 'lab',
    iconsDir: path.resolve(currentDir, '../lab'),
    popularityDir: path.resolve(dataDirectory, 'lab', 'iconPopularity'),
  },
];

/**
 * Index settings are applied on every upload, so this script is the source of truth.
 * Synonyms and rules are managed in the Algolia dashboard and preserved on upload.
 */
const INDEX_SETTINGS: IndexSettings = {
  // Order matters: earlier attributes rank higher.
  searchableAttributes: ['name', 'aliases', 'tags', 'categories', 'useCases'],
  customRanking: ['desc(popularity)'],
  attributesForFaceting: ['filterOnly(library)'],
  attributesToRetrieve: ['objectID', 'name', 'library'],
  attributesToHighlight: [],
  hitsPerPage: 1000,
  paginationLimitedTo: 3000,
  queryType: 'prefixLast',
  typoTolerance: true,
  minWordSizefor1Typo: 4,
  minWordSizefor2Typos: 8,
  ignorePlurals: ['en'],
  removeStopWords: ['en'],
  // Every word in the query has to match, like the previous client-side search.
  removeWordsIfNoResults: 'none',
  separatorsToIndex: '&+',
};

async function readJsonIfExists<T>(filePath: string): Promise<T | undefined> {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  return JSON.parse(await fs.promises.readFile(filePath, 'utf-8')) as T;
}

interface IconMetaJson {
  tags?: string[];
  categories?: string[];
  'use-cases'?: string[];
  aliases?: (string | { name: string })[];
  deprecated?: boolean;
}

const readCollection = async ({
  library,
  iconsDir,
  popularityDir,
  releaseDir,
}: IconCollection): Promise<AlgoliaIconRecord[]> => {
  const iconJsonFiles = await readSvgDirectory(iconsDir, '.json');

  return Promise.all(
    iconJsonFiles.map(async (iconJsonFile) => {
      const name = path.basename(iconJsonFile, '.json');

      const metaData =
        (await readJsonIfExists<IconMetaJson>(path.resolve(iconsDir, iconJsonFile))) ?? {};
      const popularity = await readJsonIfExists<{ count?: number }>(
        path.resolve(popularityDir, `${name}.json`),
      );
      const release = releaseDir
        ? await readJsonIfExists<{ createdRelease?: { date?: string } }>(
            path.resolve(releaseDir, `${name}.json`),
          )
        : undefined;

      const createdDate = release?.createdRelease?.date
        ? Date.parse(release.createdRelease.date)
        : NaN;

      return {
        objectID: library === 'core' ? name : `${library}/${name}`,
        name,
        library,
        aliases: (metaData.aliases ?? [])
          .map((alias) => (typeof alias === 'string' ? alias : alias?.name))
          .filter((alias): alias is string => Boolean(alias)),
        tags: metaData.tags ?? [],
        categories: metaData.categories ?? [],
        useCases: metaData['use-cases'] ?? [],
        popularity: popularity?.count ?? 0,
        createdAt: Number.isNaN(createdDate) ? null : Math.floor(createdDate / 1000),
        deprecated: metaData.deprecated ?? false,
      };
    }),
  );
};

const buildRecords = async (): Promise<AlgoliaIconRecord[]> => {
  const recordsPerCollection = await Promise.all(collections.map(readCollection));

  return recordsPerCollection.flat();
};

const upload = async (records: AlgoliaIconRecord[]) => {
  const appId = process.env.ALGOLIA_APP_ID!;
  const apiKey = process.env.ALGOLIA_ADMIN_API_KEY!;
  const indexName = process.env.ALGOLIA_INDEX_NAME || 'lucide-icons';

  const { algoliasearch } = await import('algoliasearch');
  const client = algoliasearch(appId, apiKey);

  const { taskID } = await client.setSettings({ indexName, indexSettings: INDEX_SETTINGS });
  await client.waitForTask({ indexName, taskID });

  // Atomic: uploads into a temporary index and swaps it in, so removed icons disappear.
  await client.replaceAllObjects({
    indexName,
    objects: records as unknown as Record<string, unknown>[],
    batchSize: 1000,
    scopes: ['settings', 'synonyms', 'rules'],
  });

  console.log('Successfully uploaded', records.length, `records to Algolia index "${indexName}".`);
};

const records = await buildRecords();

await fs.promises.writeFile(recordsFile, JSON.stringify(records, null, 2), 'utf-8');
console.log('Successfully written', records.length, 'Algolia records to', recordsFile);

const hasKeys = Boolean(process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_API_KEY);
const isProductionBuild = process.env.VERCEL_ENV === 'production';
const isForced = process.env.ALGOLIA_FORCE_INDEX === '1';

if (!hasKeys) {
  console.warn('ALGOLIA_APP_ID or ALGOLIA_ADMIN_API_KEY is not set, skipping Algolia upload.');
  process.exit(0);
}

if (!isProductionBuild && !isForced) {
  console.warn(
    'Not a production build and ALGOLIA_FORCE_INDEX is not set, skipping Algolia upload.',
  );
  process.exit(0);
}

try {
  await upload(records);
} catch (error) {
  console.error('Error uploading records to Algolia:', error);
  process.exit(1);
}
