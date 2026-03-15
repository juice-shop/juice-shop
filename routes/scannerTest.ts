/*
 * INTENTIONAL VULNERABILITIES FOR SCANNER TESTING - DO NOT USE IN PRODUCTION
 * This file contains deliberate security flaws to validate SAST scanner detection.
 */

import { type Request, type Response, type NextFunction } from 'express'
import { exec, execSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import http from 'http'

// ============================================================
// SAST Finding: SQL Injection (CWE-89)
// ============================================================
export function unsafeSearch () {
  return (req: Request, res: Response, next: NextFunction) => {
    const userInput = req.query.q as string
    // Direct string concatenation in SQL query
    const query = "SELECT * FROM Users WHERE username = '" + userInput + "'"
    const models = require('../models/index')
    models.sequelize.query(query).then((results: any) => {
      res.json(results)
    }).catch((err: Error) => {
      next(err)
    })
  }
}

// ============================================================
// SAST Finding: SQL Injection via template literal (CWE-89)
// ============================================================
export function unsafeUserLookup () {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id
    const models = require('../models/index')
    models.sequelize.query(`SELECT * FROM Users WHERE id = ${userId} AND deletedAt IS NULL`)
      .then((results: any) => {
        res.json(results)
      }).catch((err: Error) => {
        next(err)
      })
  }
}

// ============================================================
// SAST Finding: Command Injection (CWE-78)
// ============================================================
export function runDiagnostics () {
  return (req: Request, res: Response) => {
    const hostname = req.query.host as string
    // User input passed directly to exec
    exec('ping -c 4 ' + hostname, (error, stdout, stderr) => {
      res.send(stdout || stderr)
    })
  }
}

// ============================================================
// SAST Finding: Command Injection via template literal (CWE-78)
// ============================================================
export function checkDns () {
  return (req: Request, res: Response) => {
    const domain = req.body.domain
    const result = execSync(`nslookup ${domain}`)
    res.send(result.toString())
  }
}

// ============================================================
// SAST Finding: Path Traversal (CWE-22)
// ============================================================
export function downloadFile () {
  return (req: Request, res: Response) => {
    const filename = req.query.file as string
    // No sanitization - allows ../../etc/passwd
    const filePath = path.join('/uploads', filename)
    res.sendFile(filePath)
  }
}

// ============================================================
// SAST Finding: Path Traversal via readFile (CWE-22)
// ============================================================
export function readLogFile () {
  return (req: Request, res: Response) => {
    const logName = req.params.name
    // Direct file read with user-controlled input
    fs.readFile('/var/log/' + logName, 'utf8', (err, data) => {
      if (err) {
        res.status(404).send('Log not found')
      } else {
        res.send(data)
      }
    })
  }
}

// ============================================================
// SAST Finding: Reflected XSS (CWE-79)
// ============================================================
export function searchPage () {
  return (req: Request, res: Response) => {
    const query = req.query.q
    // User input reflected directly in HTML response
    res.send(`<html><body><h1>Search results for: ${query}</h1></body></html>`)
  }
}

// ============================================================
// SAST Finding: Stored XSS via innerHTML pattern (CWE-79)
// ============================================================
export function renderComment () {
  return (req: Request, res: Response) => {
    const comment = req.body.comment
    // No sanitization of user-supplied HTML
    res.send(`<div class="comment">${comment}</div>`)
  }
}

// ============================================================
// SAST Finding: eval() with user input (CWE-95)
// ============================================================
export function calculateExpression () {
  return (req: Request, res: Response) => {
    const expression = req.body.expression
    // eval with user-controlled input
    const result = eval(expression) // eslint-disable-line no-eval
    res.json({ result })
  }
}

// ============================================================
// SAST Finding: Function constructor (CWE-95)
// ============================================================
export function dynamicFunction () {
  return (req: Request, res: Response) => {
    const code = req.body.code
    const fn = new Function('data', code)
    const result = fn(req.body.data)
    res.json({ result })
  }
}

// ============================================================
// SAST Finding: Insecure Deserialization (CWE-502)
// ============================================================
export function deserializeData () {
  return (req: Request, res: Response) => {
    const serialized = req.body.payload
    // Unsafe deserialization
    const obj = JSON.parse(serialized)
    if (obj.__proto__) {
      Object.assign({}, obj)
    }
    // Even worse: eval-based deserialization
    const data = eval('(' + req.body.legacyPayload + ')') // eslint-disable-line no-eval
    res.json({ data })
  }
}

// ============================================================
// SAST Finding: SSRF (CWE-918)
// ============================================================
export function fetchUrl () {
  return (req: Request, res: Response) => {
    const url = req.query.url as string
    // User-controlled URL without validation
    http.get(url, (proxyRes) => {
      let data = ''
      proxyRes.on('data', (chunk) => { data += chunk })
      proxyRes.on('end', () => { res.send(data) })
    }).on('error', (err) => {
      res.status(500).send(err.message)
    })
  }
}

// ============================================================
// SAST Finding: Weak Cryptography - MD5 for passwords (CWE-328)
// ============================================================
export function hashPassword (password: string): string {
  // MD5 is cryptographically broken
  return crypto.createHash('md5').update(password).digest('hex')
}

// ============================================================
// SAST Finding: Weak Cryptography - SHA1 (CWE-328)
// ============================================================
export function generateToken (userId: string): string {
  return crypto.createHash('sha1').update(userId + 'salt').digest('hex')
}

// ============================================================
// SAST Finding: Hardcoded credentials (CWE-798)
// ============================================================
export function connectToDatabase () {
  const dbConfig = {
    host: 'prod-db.internal.example.com',
    port: 5432,
    username: 'admin',
    password: 'D@tabase_P@ssw0rd_2024!',
    database: 'juice_shop'
  }
  return dbConfig
}

// ============================================================
// SAST Finding: Hardcoded API key (CWE-798)
// ============================================================
const API_KEY = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz'
const PRIVATE_TOKEN = 'glpat-xxxxxxxxxxxxxxxxxxxx'

export function callExternalApi () {
  return (req: Request, res: Response) => {
    res.json({ key: API_KEY, token: PRIVATE_TOKEN })
  }
}

// ============================================================
// SAST Finding: Open Redirect (CWE-601)
// ============================================================
export function handleRedirect () {
  return (req: Request, res: Response) => {
    const returnUrl = req.query.url as string
    // No validation on redirect destination
    res.redirect(returnUrl)
  }
}

// ============================================================
// SAST Finding: Missing rate limiting on auth endpoint (CWE-307)
// ============================================================
export function bruteForceLogin () {
  return (req: Request, res: Response) => {
    const { username, password } = req.body
    // No rate limiting, no account lockout
    if (username === 'admin' && password === 'admin123') {
      res.json({ success: true, token: 'fake-jwt-token' })
    } else {
      res.status(401).json({ success: false })
    }
  }
}

// ============================================================
// SAST Finding: Insecure Random (CWE-330)
// ============================================================
export function generateResetToken (): string {
  // Math.random() is not cryptographically secure
  return Math.random().toString(36).substring(2, 15)
}

export function generateSessionId (): string {
  return 'sess_' + Math.random().toString(36).substr(2, 9)
}

// ============================================================
// SAST Finding: Regex DoS / ReDoS (CWE-1333)
// ============================================================
export function validateEmail () {
  return (req: Request, res: Response) => {
    const email = req.body.email
    // Catastrophic backtracking possible
    const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    if (emailRegex.test(email)) {
      res.json({ valid: true })
    } else {
      res.json({ valid: false })
    }
  }
}

// ============================================================
// SAST Finding: Prototype Pollution (CWE-1321)
// ============================================================
export function mergeConfig () {
  return (req: Request, res: Response) => {
    const userConfig = req.body
    const config: any = {}
    // Unsafe recursive merge - allows __proto__ pollution
    for (const key in userConfig) {
      config[key] = userConfig[key]
    }
    res.json(config)
  }
}

// ============================================================
// SAST Finding: XXE - XML External Entity (CWE-611)
// ============================================================
export function parseXml () {
  return (req: Request, res: Response) => {
    const libxmljs = require('libxmljs2')
    const xmlInput = req.body.xml
    // Parsing XML with external entities enabled
    const doc = libxmljs.parseXml(xmlInput, { noent: true, dtdload: true })
    res.send(doc.toString())
  }
}

// ============================================================
// SAST Finding: Insecure Cookie (CWE-614)
// ============================================================
export function setAuthCookie () {
  return (req: Request, res: Response) => {
    const token = req.body.token
    // Cookie without secure, httpOnly, or sameSite flags
    res.cookie('authToken', token, {
      secure: false,
      httpOnly: false,
      sameSite: 'none' as const
    })
    res.json({ status: 'ok' })
  }
}

// ============================================================
// SAST Finding: Information Exposure via error (CWE-209)
// ============================================================
export function debugEndpoint () {
  return (req: Request, res: Response) => {
    try {
      throw new Error('Something went wrong')
    } catch (err: any) {
      // Stack trace exposed to user
      res.status(500).json({
        error: err.message,
        stack: err.stack,
        env: process.env
      })
    }
  }
}

// ============================================================
// SAST Finding: Unvalidated file upload (CWE-434)
// ============================================================
export function uploadFile () {
  return (req: Request, res: Response) => {
    const fileData = req.body.fileData
    const fileName = req.body.fileName
    // No file type validation, no size check
    fs.writeFileSync(path.join('/uploads', fileName), fileData)
    res.json({ message: 'File uploaded: ' + fileName })
  }
}

// ============================================================
// SAST Finding: Insecure TLS configuration (CWE-295)
// ============================================================
export function makeInsecureRequest () {
  return (req: Request, res: Response) => {
    const https = require('https')
    const options = {
      hostname: req.query.host,
      port: 443,
      path: '/',
      method: 'GET',
      // Disabling TLS certificate verification
      rejectUnauthorized: false
    }
    const request = https.request(options, (response: any) => {
      let data = ''
      response.on('data', (chunk: string) => { data += chunk })
      response.on('end', () => { res.send(data) })
    })
    request.end()
  }
}

// ============================================================
// SAST Finding: Log Injection (CWE-117)
// ============================================================
export function logUserAction () {
  return (req: Request, res: Response) => {
    const username = req.body.username
    // User input directly in log - allows log forging
    console.log('User login attempt: ' + username)
    res.json({ logged: true })
  }
}

// ============================================================
// SAST Finding: Timing Attack on comparison (CWE-208)
// ============================================================
export function verifyApiKey () {
  return (req: Request, res: Response) => {
    const providedKey = req.headers['x-api-key'] as string
    const actualKey = 'secret-api-key-12345'
    // Non-constant-time comparison - vulnerable to timing attack
    if (providedKey === actualKey) {
      res.json({ authorized: true })
    } else {
      res.status(403).json({ authorized: false })
    }
  }
}

// ============================================================
// SAST Finding: Mass Assignment (CWE-915)
// ============================================================
export function updateUser () {
  return (req: Request, res: Response) => {
    const UserModel = require('../models/user').UserModel
    // Directly using request body allows overwriting role, isAdmin, etc.
    UserModel.update(req.body, { where: { id: req.params.id } })
      .then(() => res.json({ success: true }))
      .catch((err: Error) => res.status(500).json({ error: err.message }))
  }
}

// ============================================================
// SAST Finding: Unsafe Regex from user input (CWE-625)
// ============================================================
export function searchWithRegex () {
  return (req: Request, res: Response) => {
    const pattern = req.query.pattern as string
    // User-controlled regex without sanitization
    const regex = new RegExp(pattern)
    const testData = ['apple', 'banana', 'cherry']
    const results = testData.filter(item => regex.test(item))
    res.json(results)
  }
}
