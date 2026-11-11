<div align="center">

# 📚 Hodi plugin registry

**The list of [Hodi](https://github.com/leclaudeur/hodi) plugins, ready to install in one click.**<br>
One file, `plugins.json`. Each plugin keeps its code and releases in its own repository.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[**How Hodi uses it**](#how-hodi-uses-it) · [**An entry**](#an-entry) · [**Add a plugin**](#add-or-update-a-plugin)

</div>

## How Hodi uses it

Hodi will list these plugins in _Server › Plugins_. To install one, it:

1. downloads the `.hodi-plugin` file of the entry;
2. checks its SHA-256, and refuses a file that doesn't match;
3. checks its signature: a package signed by Hodi's maintainer shows as _Verified_.

The list is reviewed, not endorsed. The signature, not the list, says who made a plugin.

> [!NOTE]
> Hodi doesn't read this list yet: the list is empty, and Hodi's side comes later. Until then, install a plugin from
> its `.hodi-plugin` file with **Add a plugin**, the way Hodi's own docs describe it.

To make your own plugin, start from the [plugin template](https://github.com/leclaudeur/hodi-plugin-template).

## An entry

```json
{
  "id": "diagnostic",
  "name": "Diagnostic",
  "description": "Signale ce que le lecteur rate sur un article, et prépare un pack pour le corriger.",
  "repo": "https://github.com/leclaudeur/hodi-plugin-diagnostic",
  "version": "x.x.x",
  "api": 2,
  "url": "https://github.com/leclaudeur/hodi-plugin-diagnostic/releases/download/vx.x.x/diagnostic-x.x.x.hodi-plugin",
  "sha256": "…"
}
```

- `id`: the plugin's id, as in its `plugin.json`.
- `name`: its name, as in its `plugin.json`.
- `description`: its description, as in its `plugin.json`.
- `repo`: its repository on GitHub.
- `version`: the version of the release below, as in its `plugin.json`.
- `api`: the plugin API it was written for. Hodi hides plugins it cannot run.
- `url`: the `.hodi-plugin` file attached to the release `v<version>`.
- `sha256`: the SHA-256 of that file, from `sha256sum <file>` or `shasum -a 256 <file>`.

`x.x.x` stands for the real version, so this example never goes stale. The full format is in [plugins.schema.json](plugins.schema.json).

> [!IMPORTANT]
> The repository and its release must be public. Hodi downloads the file without signing in.

## Add or update a plugin

1. Publish a release `v<version>` of your plugin, with its `.hodi-plugin` file attached.
2. Open a pull request here that adds or updates your entry. Keep the list sorted by id.
3. Run the checks before you open it. CI runs them too:

```bash
npm ci
npm run check     # the format of plugins.json
npm run verify    # downloads each release, checks its hash and its plugin.json
```

A new version of a plugin is a new pull request, which updates `version`, `url` and `sha256`. Only Hodi's maintainer
merges.

## License

Copyright © 2026 Le Claudeur.

The Hodi plugin registry is free software under the [MIT license](LICENSE): you may **use, change and share** it freely.
