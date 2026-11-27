import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const npmCli = process.env.npm_execpath
if (!npmCli) {
  throw new Error('npm_execpath is not set; run this script through npm')
}

const floatingDependencies = process.env.JUICE_SHOP_FLOATING_DEPENDENCIES === 'true'
const args = floatingDependencies
  ? ['install', '--package-lock=false']
  : ['ci']

const result = spawnSync(process.execPath, [npmCli, ...args], {
  cwd: fileURLToPath(new URL('../frontend/', import.meta.url)),
  stdio: 'inherit'
})

if (result.error) {
  throw result.error
}

if (result.status !== 0) {
  console.error(`Frontend dependency installation failed${result.signal ? ` with signal ${result.signal}` : ''}.`)
  process.exitCode = result.status ?? 1
}
