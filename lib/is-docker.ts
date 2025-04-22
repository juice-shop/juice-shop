// from https://github.com/sindresorhus/is-docker/tree/main MIT Licensed
// inlined to avoid import problems in cypress

import fs from 'node:fs'

let isDockerCached: boolean | undefined

function hasDockerEnv () {
  try {
    fs.statSync('/.dockerenv')
    return true
  } catch {
    return false
  }
}

function hasDockerCGroup () {
  try {
    return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker')
  } catch {
    return false
  }
}

export default function isDocker () {
  // TODO: Use `??=` when targeting Node.js 16.
  if (isDockerCached === undefined) {
    isDockerCached = hasDockerEnv() || hasDockerCGroup()
  }
  return isDockerCached
}
