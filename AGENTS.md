# AGENTS.md

Instructions for AI coding agents working on the Hodi plugin registry. Read `README.md` first.

- This repository holds only an index, `plugins.json`. A plugin's code, CI, releases and signature live in its own
  repository.
- One entry per plugin, sorted by id. Every field matches the plugin's `plugin.json` in the release the entry points to,
  and `sha256` is the hash of that `.hodi-plugin` file.
- Before a pull request: `npm run typecheck`, `npm test`, `npm run check`, `npm run verify` and `npm run format:check`
  must pass.
- TypeScript strict, ES modules, imports with the `.ts` extension. Prettier decides formatting (no semicolons, single
  quotes, 120 columns). Code, comments, identifiers, commits and docs are in English.
- Commits and pull request titles follow Conventional Commits. Never put a session link in a commit, a pull request or a
  comment. Only Antho merges.
