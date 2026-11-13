<div align="center">

# 📚 Hodi plugin registry

**The list of [Hodi](https://github.com/leclaudeur/hodi) plugins, one entry each.**<br>
One file, `plugins.json`. Each plugin keeps its code and releases in its own repository.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Patreon](https://img.shields.io/badge/Patreon-Le%20Claudeur-F96854?logo=patreon&logoColor=white)](https://www.patreon.com/cw/LeClaudeur)

[**How Hodi uses it**](#how-hodi-uses-it) · [**An entry**](#an-entry) · [**Add a plugin**](#add-or-update-a-plugin) · [**Sponsor**](#sponsor)

</div>

## How Hodi uses it

Hodi will list these plugins in _Server › Plugins_. To install one, it:

1. downloads the `.hodi-plugin` file of the entry;
2. checks its SHA-256, and refuses a file that doesn't match;
3. checks its signature: a package signed by Hodi's maintainer shows as _Verified_.

The list is reviewed, not endorsed. The signature, not the list, says who made a plugin.

> [!NOTE]
> Hodi doesn't read this list yet, and Hodi's side comes later. Until then, install a plugin from its `.hodi-plugin` file
> with **Add a plugin** in _Server › Plugins_, the same way for every plugin.

To make your own plugin, start from the [plugin template](https://github.com/leclaudeur/hodi-plugin-template).

## An entry

You write two fields. `npm run index` fills the rest from your release:

```json
{
  "repo": "https://github.com/leclaudeur/hodi-plugin-diagnostic",
  "version": "x.x.x"
}
```

It becomes:

```json
{
  "id": "diagnostic",
  "name": "Diagnostic",
  "description": "Signale ce que le lecteur rate sur un article, et prépare un pack pour le corriger.",
  "translations": {
    "en": {
      "name": "Diagnostic",
      "description": "Reports what the reader misses on an article, and builds a pack to fix it."
    },
    "fr": {
      "name": "Diagnostic",
      "description": "Signale ce que le lecteur rate sur un article, et prépare un pack pour le corriger."
    }
  },
  "repo": "https://github.com/leclaudeur/hodi-plugin-diagnostic",
  "version": "x.x.x",
  "api": 2,
  "url": "https://github.com/leclaudeur/hodi-plugin-diagnostic/releases/download/vx.x.x/diagnostic-x.x.x.hodi-plugin",
  "sha256": "…"
}
```

What you write:

- `repo`: the plugin's repository on GitHub.
- `version`: the release to list, with its plugin file attached.

What the index script fills:

- `id`, `name`, `description` and `api`: from the plugin's manifest.
- `translations`: the name and description in other languages, when the plugin has them.
- `url`: the plugin file of the release.
- `sha256`: the hash of that file. Once merged, a replaced release is refused.

`x.x.x` stands for the real version, so this example never goes stale. The full format is in [plugins.schema.json](plugins.schema.json).

> [!IMPORTANT]
> The repository and its release must be public. Hodi downloads the file without signing in.

## Add or update a plugin

1. Publish a release `v<version>` of your plugin, with its `.hodi-plugin` file attached.
2. In `plugins.json`, add `{ "repo": "…", "version": "…" }` for a new plugin, or change `version` for a new release.
3. Fill the entry, then run the checks:

```bash
npm ci
npm run index     # downloads the release, checks it and fills the entry
npm run check     # the format of plugins.json
npm run verify    # downloads each release again and checks its entry is what index makes of it
```

4. Open a pull request with the result. CI runs `check` and `verify` again: an entry changed by hand fails.

Without a token, GitHub answers only 60 requests an hour from one address. If the script stops because GitHub refused a request, set `GITHUB_TOKEN` to a [personal access token](https://github.com/settings/tokens) with no scope and run it again.

A new version of a plugin is a new pull request. Only Hodi's maintainer merges.

## Sponsor

Hodi is free and open source, with no ads and nothing to pay.\
If it is useful to you, you can support its work on Patreon.

[![Support Hodi on Patreon](https://img.shields.io/badge/Support%20Hodi-Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/cw/LeClaudeur)

## License

Copyright © 2026 Le Claudeur.

The Hodi plugin registry is free software under the [MIT license](LICENSE): you may **use, change and share** it freely.
