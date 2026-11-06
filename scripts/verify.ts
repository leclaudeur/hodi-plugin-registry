// Downloads every release listed in plugins.json and checks it is what its entry says: npm run verify.
// Hodi checks the same sha256 before installing, then the signature: a wrong entry would never install.
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { extract } from 'tar'
import { problems, type Entry, type Registry } from './registry.ts'

const MAX_BYTES = 20 * 1024 * 1024

const verify = async (entry: Entry): Promise<string[]> => {
  const response = await fetch(entry.url)
  // A private repository answers 404 to anyone outside it, Hodi included.
  if (!response.ok) return [`${entry.id}: ${entry.url} answered ${response.status}, is the release public?`]
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > MAX_BYTES) return [`${entry.id}: the package is over ${MAX_BYTES / 1024 / 1024} MB`]
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (sha256 !== entry.sha256) return [`${entry.id}: sha256 is ${sha256}, the entry says ${entry.sha256}`]

  const folder = mkdtempSync(path.join(tmpdir(), `registry-${entry.id}-`))
  try {
    writeFileSync(path.join(folder, 'package.tgz'), bytes)
    await extract({ file: path.join(folder, 'package.tgz'), cwd: folder })
    const manifest = JSON.parse(readFileSync(path.join(folder, 'plugin.json'), 'utf8')) as Record<string, unknown>
    const found: string[] = []
    for (const key of ['id', 'name', 'description', 'version', 'api'] as const) {
      if (manifest[key] !== entry[key])
        found.push(`${entry.id}: ${key} is ${JSON.stringify(manifest[key])} in plugin.json`)
    }
    return found
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

const registry = JSON.parse(readFileSync('plugins.json', 'utf8')) as Registry
const found = problems(registry)
for (const entry of found.length === 0 ? registry.plugins : []) found.push(...(await verify(entry)))
for (const problem of found) console.error(problem)
if (found.length > 0) process.exit(1)
console.log(`${registry.plugins.length} plugin(s) verified`)
