import { Ajv2020 } from 'ajv/dist/2020.js'
import schema from '../plugins.schema.json' with { type: 'json' }

export interface Entry {
  id: string
  name: string
  description: string
  repo: string
  version: string
  api: number
  url: string
  sha256: string
}

export interface Registry {
  plugins: Entry[]
}

const validate = new Ajv2020({ allErrors: true }).compile<Registry>(schema)

// Everything the schema cannot say: one entry per id, in id order so diffs stay small, and a download that is the
// release of that version in that repository.
export const problems = (value: unknown): string[] => {
  if (!validate(value)) return (validate.errors ?? []).map(error => `${error.instancePath || '/'} ${error.message}`)
  const found: string[] = []
  const ids = value.plugins.map(entry => entry.id)
  ids.forEach((id, index) => {
    if (ids.indexOf(id) !== index) found.push(`${id}: listed twice`)
  })
  const sorted = [...ids].sort()
  if (ids.some((id, index) => id !== sorted[index])) found.push(`plugins must be sorted by id: ${sorted.join(', ')}`)
  for (const entry of value.plugins) {
    const release = `${entry.repo}/releases/download/v${entry.version}/`
    if (!entry.url.startsWith(release)) found.push(`${entry.id}: url must start with ${release}`)
  }
  return found
}
