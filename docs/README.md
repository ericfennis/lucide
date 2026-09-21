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

## Icon search

Search on `/icons` and `/icons/categories` queries the Algolia `icons` index, which is filled by the Algolia crawler. The site only reads from it (`.vitepress/theme/utils/algolia.ts`), it never writes to it.

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
