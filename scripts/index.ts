// Completes plugins.json from each entry's release: npm run index. Write repo and version for a new plugin, or change
// version for a new release, then run it: it fills the rest from the package and keeps the list in id order.
import { readFileSync, writeFileSync } from 'node:fs'
import { EntryError, complete, type Seed } from './complete.ts'
import { problems, type Registry } from './registry.ts'

const registry = JSON.parse(readFileSync('plugins.json', 'utf8')) as { $schema?: string; plugins: Seed[] }
try {
  const plugins = await Promise.all(registry.plugins.map(seed => complete(seed)))
  plugins.sort((a, b) => a.id.localeCompare(b.id))
  const indexed: Registry & { $schema?: string } = { $schema: registry.$schema, plugins }
  const found = problems(indexed)
  for (const problem of found) console.error(problem)
  if (found.length > 0) process.exit(1)
  writeFileSync('plugins.json', `${JSON.stringify(indexed, null, 2)}\n`)
  console.log(`${plugins.length} plugin(s) indexed`)
} catch (error) {
  if (!(error instanceof EntryError)) throw error
  console.error(error.message)
  process.exit(1)
}
