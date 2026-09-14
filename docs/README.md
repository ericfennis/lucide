# Lucide Docs website

The Lucide docs website is built with Vitepress: https://vitepress.dev/
This is Markdown-based documentation powered by Vue.

## Development

```sh
# Install dependencies
pnpm install
```

```sh
# Start docs dev server
pnpm docs:dev

# Start api dev server
pnpm dev
```

## Environment variables

Copy `.env.example` to `.env` if you need any of them. All variables are optional; see the comments in `.env.example`.

Icon search is powered by Algolia. `scripts/writeAlgoliaIndex.mts` builds one record per icon (core and lab) and uploads it at the end of `pnpm build` on production deployments. Search settings live in that script.

## Build

```sh
# Build docs
pnpm docs:build
```

```sh
# Build api
pnpm build:api
```

## Components

See .vitepress directory.
