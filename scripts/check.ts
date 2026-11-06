// Checks plugins.json without the network: npm run check.
import { readFileSync } from 'node:fs'
import { problems } from './registry.ts'

const found = problems(JSON.parse(readFileSync('plugins.json', 'utf8')))
for (const problem of found) console.error(problem)
if (found.length > 0) process.exit(1)
console.log('plugins.json is valid')
