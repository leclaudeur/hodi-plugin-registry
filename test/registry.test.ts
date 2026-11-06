import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { problems } from '../scripts/registry.ts'

const entry = (id: string, version = '0.1.0') => ({
  id,
  name: 'Diagnostic',
  description: 'Signale ce que le lecteur rate sur un article.',
  repo: `https://github.com/leclaudeur/hodi-plugin-${id}`,
  version,
  api: 1,
  url: `https://github.com/leclaudeur/hodi-plugin-${id}/releases/download/v${version}/${id}-${version}.hodi-plugin`,
  sha256: 'a'.repeat(64)
})

test('accepts the registry as it is', () => {
  assert.deepEqual(problems(JSON.parse(readFileSync('plugins.json', 'utf8'))), [])
})

test('accepts complete entries in id order', () => {
  assert.deepEqual(problems({ plugins: [entry('diagnostic'), entry('piper')] }), [])
})

test('refuses a missing field, an unknown one, a bad id or a bad sha256', () => {
  const { sha256: _, ...withoutSha } = entry('diagnostic')
  assert.notDeepEqual(problems({ plugins: [withoutSha] }), [])
  assert.notDeepEqual(problems({ plugins: [{ ...entry('diagnostic'), extra: true }] }), [])
  assert.notDeepEqual(problems({ plugins: [entry('Diagnostic')] }), [])
  assert.notDeepEqual(problems({ plugins: [{ ...entry('diagnostic'), sha256: 'A'.repeat(64) }] }), [])
})

test('refuses the same id twice, and ids out of order', () => {
  assert.deepEqual(problems({ plugins: [entry('diagnostic'), entry('diagnostic')] }), ['diagnostic: listed twice'])
  assert.deepEqual(problems({ plugins: [entry('piper'), entry('diagnostic')] }), [
    'plugins must be sorted by id: diagnostic, piper'
  ])
})

test('refuses a download that is not the release of that version in that repository', () => {
  const other = { ...entry('diagnostic'), version: '0.2.0' }
  assert.deepEqual(problems({ plugins: [other] }), [
    'diagnostic: url must start with https://github.com/leclaudeur/hodi-plugin-diagnostic/releases/download/v0.2.0/'
  ])
})
