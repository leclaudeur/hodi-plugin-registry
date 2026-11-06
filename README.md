# Hodi plugin registry

The list of plugins Hodi shows in Réglages › Plugins, ready to install in one click.

This repository holds only an index, [`plugins.json`](plugins.json). Each plugin keeps its own repository, with its code,
its CI and its releases. To start one, use
[hodi-plugin-template](https://github.com/leclaudeur/hodi-plugin-template).

## How Hodi uses it

Hodi reads `plugins.json` from this repository and lists the plugins it can run. When someone installs one, Hodi:

1. downloads the `.hodi-plugin` file at `url`;
2. checks that its SHA-256 is `sha256`, and refuses it otherwise;
3. checks its signature: a package signed by Hodi's maintainer shows as "Vérifié", any other one as unverified.

A plugin in this list is reviewed, not endorsed: the signature, not the list, says who made it.

## An entry

```json
{
  "id": "diagnostic",
  "name": "Diagnostic",
  "description": "Signale ce que le lecteur rate sur un article, et prépare un pack pour le corriger.",
  "repo": "https://github.com/leclaudeur/hodi-plugin-diagnostic",
  "version": "0.1.0",
  "api": 1,
  "url": "https://github.com/leclaudeur/hodi-plugin-diagnostic/releases/download/v0.1.0/diagnostic-0.1.0.hodi-plugin",
  "sha256": "…"
}
```

| Field         | What it says                                                                    |
| ------------- | ------------------------------------------------------------------------------- |
| `id`          | The plugin's id, as in its `plugin.json`.                                       |
| `name`        | Its name, as in its `plugin.json`.                                              |
| `description` | Its description, as in its `plugin.json`.                                       |
| `repo`        | Its repository on GitHub. It must be public: Hodi downloads without signing in. |
| `version`     | The version of the release below, as in its `plugin.json`.                      |
| `api`         | The plugin API version it was written for. Hodi hides plugins it cannot run.    |
| `url`         | The `.hodi-plugin` file attached to the release `v<version>` of the repository. |
| `sha256`      | The SHA-256 of that file: `shasum -a 256 <file>` or `sha256sum <file>`.         |

[`plugins.schema.json`](plugins.schema.json) describes the format.

## Adding or updating a plugin

1. Publish a release `v<version>` of your plugin with its `.hodi-plugin` file attached.
2. Open a pull request here that adds or updates your entry, keeping the list sorted by id.
3. CI checks the format (`npm run check`), then downloads the release and checks the hash and the manifest
   (`npm run verify`). Run both before opening the pull request:

```bash
npm ci
npm run check
npm run verify
```

Only Hodi's maintainer merges. A new version of a plugin is a new pull request that updates `version`, `url` and
`sha256`.

## License

[MIT](LICENSE)
