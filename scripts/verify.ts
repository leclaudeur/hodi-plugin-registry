// Downloads every release listed in plugins.json and checks the entry is exactly what npm run index makes of it:
// npm run verify. Hodi checks the same sha256 before installing, then the signature.
import { isDeepStrictEqual } from 'node:util'
import { readFileSync } from 'node:fs'
import { EntryError, complete } from './complete.ts'
import { problems, type Entry, type Registry } from './registry.ts'

const verify = async (entry: Entry): Promise<string[]> => {
  try {
    const indexed = await complete(entry)
    if (isDeepStrictEqual(indexed, entry)) return []
    const keys = [...new Set([...Object.keys(indexed), ...Object.keys(entry)])] as (keyof Entry)[]
    return keys
      .filter(key => !isDeepStrictEqual(indexed[key], entry[key]))
      .map(key => `${entry.id}: ${key} should be ${JSON.stringify(indexed[key])}, run npm run index`)
  } catch (error) {
    if (error instanceof EntryError) return [error.message]
    throw error
  }
}

const registry = JSON.parse(readFileSync('plugins.json', 'utf8')) as Registry
const found = problems(registry)
for (const entry of found.length === 0 ? registry.plugins : []) found.push(...(await verify(entry)))
for (const problem of found) console.error(problem)
if (found.length > 0) process.exit(1)
console.log(`${registry.plugins.length} plugin(s) verified`)
