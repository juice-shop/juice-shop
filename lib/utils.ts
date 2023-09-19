/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import packageJson from '../package.json'
import fs from 'fs'
import logger from './logger'
import config from 'config'
import jsSHA from 'jssha'
import download from 'download'
import crypto from 'crypto'
import clarinet from 'clarinet'

import isDocker from './is-docker'
import isWindows from './is-windows'
import isHeroku from './is-heroku'
// import isGitpod from 'is-gitpod') // FIXME Roll back to this when https://github.com/dword-design/is-gitpod/issues/94 is resolve
const isGitpod = () => false

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export const queryResultToJson = (data: any, status: string = 'success') => {
  let wrappedData: any = {}
  if (data) {
    if (!data.length && data.dataValues) {
      wrappedData = data.dataValues
    } else if (data.length > 0) {
      wrappedData = []
      for (let i = 0; i < data.length; i++) {
        wrappedData.push(data[i]?.dataValues ? data[i].dataValues : data[i])
      }
    } else {
      wrappedData = data
    }
  }
  return {
    status,
    data: wrappedData
  }
}

export const isUrl = (url: string) => {
  return startsWith(url, 'http')
}

export const startsWith = (str: string, prefix: string) => str ? str.indexOf(prefix) === 0 : false

export const endsWith = (str?: string, suffix?: string) => (str && suffix) ? str.includes(suffix, str.length - suffix.length) : false

export const contains = (str: string, element: string) => str ? str.includes(element) : false // TODO Inline all usages as this function is not adding any functionality to String.includes

export const containsEscaped = function (str: string, element: string) {
  return contains(str, element.replace(/"/g, '\\"'))
}

export const containsOrEscaped = function (str: string, element: string) {
  return contains(str, element) || containsEscaped(str, element)
}

export const unquote = function (str: string) {
  if (str && startsWith(str, '"') && endsWith(str, '"')) {
    return str.substring(1, str.length - 1)
  } else {
    return str
  }
}

export const trunc = function (str: string, length: number) {
  str = str.replace(/(\r\n|\n|\r)/gm, '')
  return (str.length > length) ? str.substr(0, length - 1) + '...' : str
}

export const version = (module?: string) => {
  if (module) {
    // @ts-expect-error FIXME Ignoring any type issue on purpose
    return packageJson.dependencies[module]
  } else {
    return packageJson.version
  }
}

let cachedCtfKey: string | undefined
const getCtfKey = () => {
  if (!cachedCtfKey) {
    if (process.env.CTF_KEY !== undefined && process.env.CTF_KEY !== '') {
      cachedCtfKey = process.env.CTF_KEY
    } else {
      const data = fs.readFileSync('ctf.key', 'utf8')
      cachedCtfKey = data
    }
  }
  return cachedCtfKey
}
export const ctfFlag = (text: string) => {
  const shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(getCtfKey(), 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}

export const toMMMYY = (date: Date) => {
  const month = date.getMonth()
  const year = date.getFullYear()
  return months[month] + year.toString().substring(2, 4)
}

export const toISO8601 = (date: Date) => {
  let day = '' + date.getDate()
  let month = '' + (date.getMonth() + 1)
  const year = date.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [year, month, day].join('-')
}

export const extractFilename = (url: string) => {
  let file = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1))
  if (contains(file, '?')) {
    file = file.substring(0, file.indexOf('?'))
  }
  return file
}

export const downloadToFile = async (url: string, dest: string) => {
  try {
    const data = await download(url)
    fs.writeFileSync(dest, data)
  } catch (err) {
    logger.warn('Failed to download ' + url + ' (' + getErrorMessage(err) + ')')
  }
}

export const jwtFrom = ({ headers }: { headers: any }) => {
  if (headers?.authorization) {
    const parts = headers.authorization.split(' ')
    if (parts.length === 2) {
      const scheme = parts[0]
      const token = parts[1]

      if (/^Bearer$/i.test(scheme)) {
        return token
      }
    }
  }
  return undefined
}

export const randomHexString = (length: number) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

export const disableOnContainerEnv = () => {
  return (isDocker() || isGitpod() || isHeroku()) && !config.get('challenges.safetyOverride')
}

export const disableOnWindowsEnv = () => {
  return isWindows()
}

export const determineDisabledEnv = (disabledEnv: string | string[] | undefined) => {
  if (isDocker()) {
    return disabledEnv && (disabledEnv === 'Docker' || disabledEnv.includes('Docker')) ? 'Docker' : null
  } else if (isHeroku()) {
    return disabledEnv && (disabledEnv === 'Heroku' || disabledEnv.includes('Heroku')) ? 'Heroku' : null
  } else if (isWindows()) {
    return disabledEnv && (disabledEnv === 'Windows' || disabledEnv.includes('Windows')) ? 'Windows' : null
  } else if (isGitpod()) {
    return disabledEnv && (disabledEnv === 'Gitpod' || disabledEnv.includes('Gitpod')) ? 'Gitpod' : null
  }
  return null
}

export const parseJsonCustom = (jsonString: string) => {
  const parser = clarinet.parser()
  const result: any[] = []
  parser.onkey = parser.onopenobject = (k: any) => {
    result.push({ key: k, value: null })
  }
  parser.onvalue = (v: any) => {
    result[result.length - 1].value = v
  }
  parser.write(jsonString)
  parser.close()
  return result
}

export const toSimpleIpAddress = (ipv6: string) => {
  if (startsWith(ipv6, '::ffff:')) {
    return ipv6.substr(7)
  } else if (ipv6 === '::1') {
    return '127.0.0.1'
  } else {
    return ipv6
  }
}

export const thaw = (frozenObject: any) => {
  return JSON.parse(JSON.stringify(frozenObject))
}

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  return String(error)
}

export const matchesSystemIniFile = (text: string) => {
  const match = text.match(/; for 16-bit app support/gi)
  return match !== null && match.length >= 1
}

export const matchesEtcPasswdFile = (text: string) => {
  const match = text.match(/(\w*:\w*:\d*:\d*:\w*:.*)|(Note that this file is consulted directly)/gi)
  return match !== null && match.length >= 1
}
