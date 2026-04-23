#!/usr/bin/env node

/**
 * Feature Coverage Check
 * Reads docs/FEATURES.md, finds implemented features, checks that listed test files exist.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const featuresPath = resolve(rootDir, 'docs/FEATURES.md')

if (!existsSync(featuresPath)) {
  console.error('ERROR: docs/FEATURES.md not found')
  process.exit(1)
}

const content = readFileSync(featuresPath, 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
const lines = content.split('\n')

// Parse features by iterating line-by-line
const features = []
let currentFeature = null

for (const line of lines) {
  // Match feature header: ### F-001: Feature Name
  const featureMatch = line.match(/^### (F-\d+): (.+)$/)
  if (featureMatch) {
    if (currentFeature) features.push(currentFeature)
    currentFeature = {
      id: featureMatch[1],
      name: featureMatch[2],
      status: 'unknown',
      testFiles: [],
    }
    continue
  }

  if (!currentFeature) continue

  // Match status line
  const statusMatch = line.match(/^\s*- \*\*Status:\*\* (\w+)/)
  if (statusMatch) {
    currentFeature.status = statusMatch[1]
    continue
  }

  // Match test file lines — may contain multiple backtick-wrapped paths
  const testLineMatch = line.match(/^\s*- (?:Unit|E2E|A11y|Integration): /)
  if (testLineMatch) {
    const backtickPaths = line.matchAll(/`([^`]+)`/g)
    for (const m of backtickPaths) {
      currentFeature.testFiles.push(m[1])
    }
  }
}

// Push last feature
if (currentFeature) features.push(currentFeature)

// Check coverage
let passed = 0
let failed = 0
let skipped = 0
const missing = []

console.log('\n=== Feature Coverage Report ===\n')

for (const feature of features) {
  const { id, name, status, testFiles } = feature

  if (status !== 'implemented' && status !== 'tested') {
    console.log(`  SKIP  ${id}: ${name} (status: ${status})`)
    skipped++
    continue
  }

  if (testFiles.length === 0) {
    console.log(`  WARN  ${id}: ${name} -- no test files listed`)
    missing.push({ id, name, reason: 'no test files listed' })
    failed++
    continue
  }

  let allExist = true
  for (const tf of testFiles) {
    const fullPath = resolve(rootDir, tf)
    if (!existsSync(fullPath)) {
      console.log(`  FAIL  ${id}: ${name} -- missing: ${tf}`)
      missing.push({ id, name, reason: `file not found: ${tf}` })
      allExist = false
    }
  }

  if (allExist) {
    console.log(`  PASS  ${id}: ${name} (${testFiles.length} test file${testFiles.length !== 1 ? 's' : ''})`)
    passed++
  } else {
    failed++
  }
}

console.log('\n--- Summary ---')
console.log(`  Total features: ${features.length}`)
console.log(`  Passed: ${passed}`)
console.log(`  Failed: ${failed}`)
console.log(`  Skipped: ${skipped}`)

if (missing.length > 0) {
  console.log('\n--- Missing Test Files ---')
  for (const m of missing) {
    console.log(`  ${m.id}: ${m.name} -- ${m.reason}`)
  }
}

console.log('')

// Exit with failure if any implemented features are missing tests
process.exit(failed > 0 ? 1 : 0)
