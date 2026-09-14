/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALGOLIA_APP_ID?: string;
  readonly VITE_ALGOLIA_SEARCH_API_KEY?: string;
  readonly VITE_ALGOLIA_INDEX_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
