/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import os from 'node:os'
import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'
import yaml from 'js-yaml'
import unzipper from 'unzipper'
import { type NextFunction, type Request, type Response } from 'express'
import type { XmlDocument as XmlDocumentType, ParseOption as ParseOptionType } from 'libxml2-wasm'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as utils from '../lib/utils'

// use ESM native import() function to ESM only libxml function, using eval to ensure that the code isn't transpiled back to commonjs
// eslint-disable-next-line no-eval
const libxmlImportPromise = eval("import('libxml2-wasm')")

function ensureFileIsPassed ({ file }: Request, res: Response, next: NextFunction) {
  if (file != null) {
    next()
  } else {
    return res.status(400).json({ error: 'File is not passed' })
  }
}

function handleZipFileUpload ({ file }: Request, res: Response, next: NextFunction) {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.zip')) {
    if (((file?.buffer) != null) && utils.isChallengeEnabled(challenges.fileWriteChallenge)) {
      const buffer = file.buffer
      const filename = file.originalname.toLowerCase()
      const tempFile = path.join(os.tmpdir(), filename)
      fs.open(tempFile, 'w', function (err, fd) {
        if (err != null) { next(err) }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
          if (err != null) { next(err) }
          fs.close(fd, function () {
            fs.createReadStream(tempFile)
              .pipe(unzipper.Parse())
              .on('entry', function (entry: any) {
                const fileName = entry.path
                const absolutePath = path.resolve('uploads/complaints/' + fileName)
                challengeUtils.solveIf(challenges.fileWriteChallenge, () => { return absolutePath === path.resolve('ftp/legal.md') })
                if (absolutePath.includes(path.resolve('.'))) {
                  entry.pipe(fs.createWriteStream('uploads/complaints/' + fileName).on('error', function (err) { next(err) }))
                } else {
                  entry.autodrain()
                }
              }).on('error', function (err: unknown) { next(err) })
          })
        })
      })
    }
    res.status(204).end()
  } else {
    next()
  }
}

function checkUploadSize ({ file }: Request, res: Response, next: NextFunction) {
  if (file != null) {
    challengeUtils.solveIf(challenges.uploadSizeChallenge, () => { return file?.size > 100000 })
  }
  next()
}

function checkFileType ({ file }: Request, res: Response, next: NextFunction) {
  const fileType = file?.originalname.substr(file.originalname.lastIndexOf('.') + 1).toLowerCase()
  challengeUtils.solveIf(challenges.uploadTypeChallenge, () => {
    return !(fileType === 'pdf' || fileType === 'xml' || fileType === 'zip' || fileType === 'yml' || fileType === 'yaml')
  })
  next()
}

async function handleXmlUpload ({ file }: Request, res: Response, next: NextFunction) {
  const { XmlDocument, ParseOption } = (await libxmlImportPromise) as { XmlDocument: typeof XmlDocumentType, ParseOption: typeof ParseOptionType }

  if (utils.endsWith(file?.originalname.toLowerCase(), '.xml')) {
    challengeUtils.solveIf(challenges.deprecatedInterfaceChallenge, () => { return true })
    if (((file?.buffer) == null) || !utils.isChallengeEnabled(challenges.deprecatedInterfaceChallenge)) { // XXE attacks in Docker/Heroku containers regularly cause "segfault" crashes
      res.status(410)
      next(new Error('B2B customer complaints via file upload have been deprecated for security reasons (' + file?.originalname + ')'))
      return
    }

    try {
      const sandbox = { XmlDocument, ParseOption, buffer: file.buffer }
      vm.createContext(sandbox)
      const xmlDoc = vm.runInContext('XmlDocument.fromBuffer(buffer, { option: ParseOption.XML_PARSE_NOBLANKS | ParseOption.XML_PARSE_NOENT | ParseOption.XML_PARSE_NOCDATA })', sandbox, { timeout: 2000 })
      const xmlString = xmlDoc.toString({ format: false })
      challengeUtils.solveIf(challenges.xxeFileDisclosureChallenge, () => doesXmlDocumentContainASuccessfulXxeFileDisclosureAttack(xmlString))
      challengeUtils.solveIf(challenges.xxeDosChallenge, () => doesXmlDocumentContainASuccessfulXxeDosAttack(xmlString))
      res.status(410)
      next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(xmlString, 400) + ' (' + file.originalname + ')'))
    } catch (err: any) { // TODO: Remove any
      if (
        utils.contains(err.message, 'Script execution timed out')
      ) {
        if (challengeUtils.notSolved(challenges.xxeDosChallenge)) {
          challengeUtils.solve(challenges.xxeDosChallenge)
        }
        res.status(503)
        next(new Error('Sorry, we are temporarily not available! Please try again later.'))
      } else {
        res.status(410)
        next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')'))
      }
    }
  }
  next()
}

// checks if the xml file contains a successful XXE file disclosure attack
// actually executing the attack is not possible in the because the libxml2-wasm library runs in a pretty tight sandbox without access to the file system
function doesXmlDocumentContainASuccessfulXxeFileDisclosureAttack (file: string) {
  // for linux/mac check if file contains something like: <!ENTITY ... SYSTEM "file:///etc/passwd" >
  const linuxRegex = /<!ENTITY+.*SYSTEM\s+"file:\/\/\/etc\/passwd"/
  if (linuxRegex.test(file)) {
    return true
  }
  // for windows check if file contains something like: <!ENTITY ... SYSTEM "file:///C:/Windows/system.ini" >
  const windowsRegex = /<!ENTITY+.*SYSTEM\s+"file:\/\/\/C:\/Windows\/system\.ini"/
  if (windowsRegex.test(file)) {
    return true
  }
  return false
}

// checks if the file reads the special linux file streams (e.g. dev/random, dev/null) which is one way to solve the dos challenge
function doesXmlDocumentContainASuccessfulXxeDosAttack (file: string) {
  const linuxRegex = /<!ENTITY+.*SYSTEM\s+"file:\/\/\/dev\/(random|urandom|null)"/
  if (linuxRegex.test(file)) {
    return true
  }
  return false
}

function handleYamlUpload ({ file }: Request, res: Response, next: NextFunction) {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.yml') || utils.endsWith(file?.originalname.toLowerCase(), '.yaml')) {
    challengeUtils.solveIf(challenges.deprecatedInterfaceChallenge, () => { return true })
    if (((file?.buffer) != null) && utils.isChallengeEnabled(challenges.deprecatedInterfaceChallenge)) {
      const data = file.buffer.toString()
      try {
        const sandbox = { yaml, data }
        vm.createContext(sandbox)
        const yamlString = vm.runInContext('JSON.stringify(yaml.load(data))', sandbox, { timeout: 2000 })
        res.status(410)
        next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(yamlString, 400) + ' (' + file.originalname + ')'))
      } catch (err: any) { // TODO: Remove any
        if (utils.contains(err.message, 'Invalid string length') || utils.contains(err.message, 'Script execution timed out')) {
          if (challengeUtils.notSolved(challenges.yamlBombChallenge)) {
            challengeUtils.solve(challenges.yamlBombChallenge)
          }
          res.status(503)
          next(new Error('Sorry, we are temporarily not available! Please try again later.'))
        } else {
          res.status(410)
          next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')'))
        }
      }
    } else {
      res.status(410)
      next(new Error('B2B customer complaints via file upload have been deprecated for security reasons (' + file?.originalname + ')'))
    }
  }
  res.status(204).end()
}

export {
  ensureFileIsPassed,
  handleZipFileUpload,
  checkUploadSize,
  checkFileType,
  handleXmlUpload,
  handleYamlUpload
}
