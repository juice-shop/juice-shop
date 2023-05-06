// from https://github.com/jonschlinkert/is-windows MIT Licensed
// inlined to avoid import problems in cypress
import process from 'process'

export default function isWindows () {
  return process && (process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE ?? ''))
}
