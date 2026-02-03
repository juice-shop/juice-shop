/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

'use strict'

const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const STATS_INPUT = path.resolve(__dirname, '../frontend/dist/frontend/stats.json')
const STATS_OUTPUT = path.resolve(__dirname, '../bundle-stats.json')
const PACKAGE_JSON = path.resolve(__dirname, '../package.json')

const CHUNK_NAMES = ['vendor.js', 'main.js', 'polyfills.js', 'runtime.js', 'common.js', 'styles.css']

function calculateGzipSize (content) {
  if (!content) return 0
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content)
  try {
    return zlib.gzipSync(buffer).length
  } catch {
    return Math.round(buffer.length * 0.3)
  }
}

function extractPackageName (modulePath) {
  if (!modulePath) return null
  const normalized = modulePath.replace(/\\/g, '/')
  const nodeModulesMatch = normalized.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/)
  if (nodeModulesMatch) return nodeModulesMatch[1]
  if (normalized.includes('/src/') || normalized.startsWith('./src/')) return 'app'
  return null
}

function extractChildName (modulePath, packageName) {
  if (!modulePath || !packageName) return null
  const normalized = modulePath.replace(/\\/g, '/')
  const afterPackage = normalized.split(packageName)[1]
  if (!afterPackage) return null
  const parts = afterPackage.split('/').filter(Boolean)
  if (parts.length === 0) return null
  return parts[parts.length - 1] || null
}

function processModules (modules) {
  const packageMap = new Map()

  for (const mod of modules || []) {
    const name = mod.name || mod.identifier || ''
    const size = mod.size || 0
    if (size === 0) continue

    const packageName = extractPackageName(name)
    if (!packageName) continue

    if (!packageMap.has(packageName)) {
      packageMap.set(packageName, { name: packageName, size: 0, childrenMap: new Map() })
    }

    const pkg = packageMap.get(packageName)
    pkg.size += size

    const childName = extractChildName(name, packageName)
    if (childName) {
      const existingSize = pkg.childrenMap.get(childName) || 0
      pkg.childrenMap.set(childName, existingSize + size)
    }
  }

  return Array.from(packageMap.values())
    .map(pkg => ({
      name: pkg.name,
      size: pkg.size,
      children: Array.from(pkg.childrenMap.entries())
        .map(([name, size]) => ({ name, size }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 20)
    }))
    .filter(pkg => pkg.size > 0)
    .sort((a, b) => b.size - a.size)
}

function findChunkByFileName (stats, fileName) {
  for (const chunk of stats.chunks || []) {
    if (chunk.files && chunk.files.includes(fileName)) {
      return chunk
    }
  }
  return null
}

function main () {
  if (!fs.existsSync(STATS_INPUT)) {
    console.error(`Stats file not found: ${STATS_INPUT}`)
    console.error('Run "npx ng build --stats-json" in the frontend directory first.')
    process.exit(1)
  }

  const stats = JSON.parse(fs.readFileSync(STATS_INPUT, 'utf8'))
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'))
  const distDir = path.dirname(STATS_INPUT)

  const chunks = []
  let totalSize = 0
  let totalGzip = 0

  for (const chunkName of CHUNK_NAMES) {
    const chunkPath = path.join(distDir, chunkName)
    if (!fs.existsSync(chunkPath)) continue

    const content = fs.readFileSync(chunkPath)
    const size = content.length
    const gzip = calculateGzipSize(content)

    totalSize += size
    totalGzip += gzip

    const chunk = findChunkByFileName(stats, chunkName)
    const modules = processModules(chunk?.modules)

    chunks.push({
      name: chunkName,
      size,
      gzip,
      modules
    })
  }

  const output = {
    version: pkg.version.replace('-SNAPSHOT', ''),
    timestamp: new Date().toISOString(),
    summary: {
      totalSize,
      totalGzip,
      chunkCount: chunks.length
    },
    chunks
  }

  fs.writeFileSync(STATS_OUTPUT, JSON.stringify(output, null, 2))
  console.log(`Bundle stats written to ${STATS_OUTPUT}`)
  console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Gzip estimate: ${(totalGzip / 1024 / 1024).toFixed(2)} MB`)
}

main()
