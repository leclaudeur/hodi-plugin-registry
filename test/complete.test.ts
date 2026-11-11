import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { create } from 'tar'
import { EntryError, complete } from '../scripts/complete.ts'

const REPO = 'https://github.com/leclaudeur/hodi-plugin-diagnostic'
const URL_020 = `${REPO}/releases/download/v0.2.0/diagnostic-0.2.0.hodi-plugin`

// A package as hodi-plugin build makes it: the plugin's folder, gzipped in a tar.
const packageOf = async (files: Record<string, string>) => {
  const root = mkdtempSync(path.join(tmpdir(), 'registry-test-'))
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    writeFileSync(path.join(root, name), content)
  }
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'registry-tgz-')), 'plugin.hodi-plugin')
  await create({ gzip: true, file, cwd: root, portable: true }, readdirSync(root))
  return readFileSync(file)
}

const MANIFEST = {
  id: 'diagnostic',
  name: 'Diagnostic',
  version: '0.2.0',
  description: 'Signale ce que le lecteur rate sur un article.',
  api: 2
}

// GitHub as the script sees it: the release's assets, then the file.
const github =
  (bytes: Buffer, assets = [URL_020]): typeof fetch =>
  async input => {
    const url = String(input)
    if (url.endsWith('/releases/tags/v0.2.0'))
      return Response.json({ assets: assets.map(browser_download_url => ({ browser_download_url })) })
    if (url === URL_020) return new Response(bytes)
    return new Response('not found', { status: 404 })
  }

test('fills an entry from its release, with the translations of its locales', async () => {
  const bytes = await packageOf({
    'plugin.json': JSON.stringify(MANIFEST),
    'locales/fr.json': '{"page":{"title":"Diagnostic"}}',
    'locales/en.json': JSON.stringify({ manifest: { description: 'Reports what the reader misses.' } })
  })
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  assert.deepEqual(await complete({ repo: REPO, version: '0.2.0' }, github(bytes)), {
    ...MANIFEST,
    translations: { en: { description: 'Reports what the reader misses.' } },
    repo: REPO,
    version: '0.2.0',
    url: URL_020,
    sha256
  })
  // The same sha256 written in the entry passes.
  assert.equal((await complete({ repo: REPO, version: '0.2.0', sha256 }, github(bytes))).sha256, sha256)
})

test('leaves translations out when the locales give none', async () => {
  const bytes = await packageOf({ 'plugin.json': JSON.stringify(MANIFEST) })
  assert.equal('translations' in (await complete({ repo: REPO, version: '0.2.0' }, github(bytes))), false)
})

test('refuses a replaced file, a wrong version, a release without one package and a private one', async () => {
  const bytes = await packageOf({ 'plugin.json': JSON.stringify(MANIFEST) })
  await assert.rejects(complete({ repo: REPO, version: '0.2.0', sha256: 'a'.repeat(64) }, github(bytes)), /sha256 is/)
  const other = await packageOf({ 'plugin.json': JSON.stringify({ ...MANIFEST, version: '0.1.0' }) })
  await assert.rejects(complete({ repo: REPO, version: '0.2.0' }, github(other)), /version "0.1.0"/)
  await assert.rejects(complete({ repo: REPO, version: '0.2.0' }, github(bytes, [])), /one .hodi-plugin file, it has 0/)
  await assert.rejects(complete({ repo: REPO, version: '0.3.0' }, github(bytes)), EntryError)
})
