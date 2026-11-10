/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// note: this file can't have any other imports than the dynamic one below as it needs to be able to at least start up without the npm dependencies installed
// otherwise this check would be useless as the app would fail on a random import before even reaching this point
const validateIfDependencyCheckerIsInstalled = async () => {
  try {
    await import('semver')
  } catch (err) {
    console.error('Please run "npm install" before starting the application!')
    process.exit(1)
  }
}

export default validateIfDependencyCheckerIsInstalled
