# @vedify/web

The main Astro v7 web application for the Vedify.in platform.

Built with [Astro](https://astro.build), [Tailwind CSS v4](https://tailwindcss.com), and [DaisyUI v5](https://daisyui.com).

## Commands

All commands run from the repository root:

| Command        | Action                                     |
| :------------- | :----------------------------------------- |
| `pnpm dev`     | Start local dev server at `localhost:4321` |
| `pnpm build`   | Build to `dist/`                           |
| `pnpm preview` | Preview production build locally           |
| `pnpm test`    | Run unit tests                             |
| `pnpm check`   | Run format + lint + typecheck + tests      |

## Content Management

Content is fetched at build/dev time from external git repos, not committed directly in the `develop` or `main` branches.

### Configuration

`content-config.yaml` defines named content sources and maps them to branches:

```yaml
sources:
  dummy: git@github.com:VedifyIn/vedify-in.git#content # dev dummy content
  stage: git@github.com:Vaidic/in.vedify.content.git#develop
  production: git@github.com:Vaidic/in.vedify.content.git#main

defaults:
  develop: dummy
  main: production
```

### Source resolution (highest to lowest priority)

1. `--content=<name>` CLI flag
2. `CONTENT_SOURCE=<name>` environment variable
3. Branch default from `content-config.yaml`

### Pinning a commit

Add an optional `commit` field to a source to pin to a specific hash instead of the branch tip:

```yaml
production:
  repo: git@github.com:Vaidic/in.vedify.content.git
  branch: main
  commit: abc123def
```

Omit `commit` to always fetch the latest from the branch.

### Workflow

| Branch  | Content source | Auth needed                           |
| ------- | -------------- | ------------------------------------- |
| develop | `dummy`        | SSH key with repo read access         |
| main    | `production`   | SSH key / deploy key for private repo |

Override for testing: `CONTENT_SOURCE=dummy pnpm build` on any branch.

### Authentication

The build environment needs SSH access to the content repo. On Cloudflare Pages, add the deploy key as an environment secret. For local dev, ensure your SSH agent has the key loaded.
