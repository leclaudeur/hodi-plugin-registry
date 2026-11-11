// Fills an entry from its release: the author gives repo and version, the package gives the rest. npm run index
// writes the result, npm run verify checks plugins.json is still exactly that.
import { createHash } from 'node:crypto'
import { describePackage } from './package.ts'
import type { Entry } from './registry.ts'

// sha256, once written, pins the file: the release reviewed is the one Hodi installs.
export type Seed = Pick<Entry, 'repo' | 'version'> & { sha256?: string }

// Hodi refuses bigger packages than this from the registry.
const MAX_BYTES = 20 * 1024 * 1024

export class EntryError extends Error {}

const releaseAsset = async (seed: Seed, fetcher: typeof fetch) => {
  const repo = new URL(seed.repo).pathname.slice(1)
  const api = `https://api.github.com/repos/${repo}/releases/tags/v${seed.version}`
  // Without a token, GitHub answers 60 requests an hour per address: CI and anyone who has one pass GITHUB_TOKEN.
  const token = process.env.GITHUB_TOKEN
  const headers = { accept: 'application/vnd.github+json', ...(token && { authorization: `Bearer ${token}` }) }
  const response = await fetcher(api, { headers })
  if (response.status === 403 || response.status === 429)
    throw new EntryError(`${seed.repo}: GitHub refused the request (${response.status}), set GITHUB_TOKEN and retry`)
  // A private repository answers 404 to anyone outside it, Hodi included.
  if (!response.ok)
    throw new EntryError(`${seed.repo}: release v${seed.version} answered ${response.status}, is it public?`)
  const { assets = [] } = (await response.json()) as { assets?: { browser_download_url: string }[] }
  const files = assets.map(asset => asset.browser_download_url).filter(url => url.endsWith('.hodi-plugin'))
  if (files.length !== 1)
    throw new EntryError(
      `${seed.repo}: release v${seed.version} must have one .hodi-plugin file, it has ${files.length}`
    )
  return files[0]
}

const download = async (url: string, seed: Seed, fetcher: typeof fetch) => {
  const response = await fetcher(url)
  if (!response.ok) throw new EntryError(`${url} answered ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > MAX_BYTES) throw new EntryError(`${url}: the package is over ${MAX_BYTES / 1024 / 1024} MB`)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  // A release replaced after its entry was written is refused.
  if (seed.sha256 !== undefined && sha256 !== seed.sha256)
    throw new EntryError(`${url}: sha256 is ${sha256}, the entry says ${seed.sha256}`)
  return { bytes, sha256 }
}

export const complete = async (seed: Seed, fetcher: typeof fetch = fetch): Promise<Entry> => {
  const url = await releaseAsset(seed, fetcher)
  const { bytes, sha256 } = await download(url, seed, fetcher)
  const described = await describePackage(bytes)
  if (described.version !== seed.version)
    throw new EntryError(`${seed.repo}: plugin.json says version ${JSON.stringify(described.version)}`)
  // Fields in the order Hodi's docs list them, so a diff shows only what changed.
  return {
    id: described.id as string,
    name: described.name as string,
    description: described.description as string,
    ...(Object.keys(described.texts).length > 0 && { texts: described.texts }),
    repo: seed.repo,
    version: seed.version,
    api: described.api as number,
    url,
    sha256
  }
}
