/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// CLI script to validate all customization config files against the config schema.
// Example: npm run lint:config

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import yaml from 'js-yaml'
import colors from 'colors/safe'

import { ValidationSchema } from '../config.schema'

const configDir = path.resolve(__dirname, '../../config')

async function validateFile (file: string): Promise<boolean> {
  let configuration: unknown
  try {
    configuration = yaml.load(await readFile(file, 'utf8'))
  } catch (error) {
    console.error(colors.red(`Could not read or parse ${file}: ${error instanceof Error ? error.message : String(error)}`))
    return false
  }

  const result = ValidationSchema.safeParse(configuration)
  if (!result.success) {
    console.error(`Config schema validation of ${colors.bold(file)} failed with ${result.error.issues.length} errors (${colors.red('ERROR')})`)
    result.error.issues.forEach(issue => {
      const issuePath = issue.path.join('.')
      console.error(`${issuePath}:${colors.red(` ${issue.message}`)}`)
    })
    return false
  }

  console.log(`Config schema validation of ${colors.bold(file)} passed (${colors.green('SUCCESS')})`)
  return true
}

async function main () {
  const entries = await readdir(configDir)
  const files = entries.filter(name => name.endsWith('.yml')).sort().map(name => path.join(configDir, name))

  let success = true
  for (const file of files) {
    success = await validateFile(file) && success
  }

  if (!success) {
    process.exit(1)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
