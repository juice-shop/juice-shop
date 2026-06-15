import process from 'node:process'
import { defineConfig } from 'vitest/config'

// Node 26 ships a built-in `localStorage` global. It shadows jsdom's
// `Storage.prototype`-based implementation, which breaks tests that spy on
// `Storage.prototype.{getItem,setItem,removeItem,...}`. Passing
// `--no-webstorage` disables Node's web storage so jsdom can own the global.
// The flag was introduced in Node 25; on Node 24 it does not exist (would
// crash the worker), so we only apply it on Node >= 25.
// See https://github.com/nodejs/node/issues/60303 and
//     https://github.com/vitest-dev/vitest/issues/8757
const nodeMajor = Number.parseInt(process.versions.node.split('.')[0], 10)
const execArgv = nodeMajor >= 25 ? ['--no-webstorage'] : []

export default defineConfig({
  test: {
    execArgv,
  },
})
