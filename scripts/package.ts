// What a .hodi-plugin says about itself: its plugin.json, and its name and description in other languages from
// manifest.name and manifest.description in its locales, as Hodi reads them.
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { extract } from 'tar'

export type Translations = Record<string, { name?: string; description?: string }>

export interface Described {
  id: unknown
  name: unknown
  description: unknown
  version: unknown
  api: unknown
  translations: Translations
}

// Hodi's limits for plugin.json's name and description; a longer text in a locale is left out, as Hodi does.
const LIMITS = { name: 60, description: 280 } as const

const clean = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim() && value.length <= max ? value.trim() : undefined

const textOf = (file: string) => {
  try {
    const { manifest } = JSON.parse(readFileSync(file, 'utf8')) as { manifest?: Record<string, unknown> }
    if (typeof manifest !== 'object' || manifest === null) return {}
    const name = clean(manifest.name, LIMITS.name)
    const description = clean(manifest.description, LIMITS.description)
    return { ...(name && { name }), ...(description && { description }) }
  } catch {
    return {}
  }
}

const translationsIn = (folder: string): Translations => {
  const locales = path.join(folder, 'locales')
  const translations: Translations = {}
  let names: string[] = []
  try {
    names = readdirSync(locales).sort()
  } catch {
    return translations
  }
  for (const name of names) {
    const language = /^([a-z]{2})\.json$/.exec(name)?.[1]
    if (!language) continue
    const text = textOf(path.join(locales, name))
    if (text.name || text.description) translations[language] = text
  }
  return translations
}

export const describePackage = async (bytes: Buffer): Promise<Described> => {
  const folder = mkdtempSync(path.join(tmpdir(), 'registry-package-'))
  try {
    writeFileSync(path.join(folder, 'package.tgz'), bytes)
    const into = path.join(folder, 'plugin')
    mkdirSync(into)
    await extract({ file: path.join(folder, 'package.tgz'), cwd: into })
    const manifest = JSON.parse(readFileSync(path.join(into, 'plugin.json'), 'utf8')) as Record<string, unknown>
    const { id, name, description, version, api } = manifest
    return { id, name, description, version, api, translations: translationsIn(into) }
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}
