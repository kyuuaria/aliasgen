# Alias Gen

A minimal web app for generating unique email aliases on your own domain. Create a per-service alias in seconds, copy it, and register it with your email provider.

Inspired by [SimpleLogin](https://simplelogin.io/), but built for providers that let you create unlimited aliases on a custom domain - like [Tuta](https://tuta.com/), your own mail server, or any host that supports catch-all or unlimited alias creation.

## How it works

The alias is generated as:

```
{service}.{suffix}@{domain}
```

The suffix depends on the selected mode:

- **Random characters** - configurable length (3-12 chars), e.g. `github.x9f2k@example.com`
- **Random words** - 1-3 words (adjective, or adjectives + noun), e.g. `github.swift@example.com` or `github.bright-falcon@example.com`

Configuration is stored in the URL hash so you can bookmark different setups. Hash fragments are never sent to the server, so your domain stays client-side.

## Features

- Two suffix modes with configurable length/word count
- Debounced domain validation
- Copy on click or Enter, auto-clears for the next alias
- Lazy-loaded Three.js shader background
- Installable PWA

## Stack

- [SvelteKit](https://kit.svelte.dev/)
- [Three.js](https://threejs.org/) - GLSL shader background (lazy-loaded)
- [shadcn-svelte](https://www.shadcn-svelte.com/) - UI components
- [runed](https://runed.dev/) - reactive utilities (`Debounced`, `Previous`)
- [random-word-slugs](https://github.com/nas5w/random-word-slugs) - word-based suffixes
- [Zod](https://zod.dev/) - schema validation
- [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit) - PWA support
- [Tailwind CSS](https://tailwindcss.com/)

## Getting started

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
pnpm preview
```

> PWA install prompt only appears in `preview` or production - not in `dev`.
