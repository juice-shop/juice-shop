/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import { type Request, type Response, type NextFunction } from 'express'
import { exec } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { sequelize } from '../models'

// Intentionally problematic utilities and handlers for Sonar and security scanners demonstration
// Contains examples of: hardcoded secrets, eval-like behavior, SQL injection, command injection,
// weak crypto, insecure randomness, log of sensitive data, path traversal, fragile error handling,
// and maintainability issues like duplicated code and long method bodies.

// Hardcoded secrets (exposed secrets)
const HARDCODED_API_KEY = 'sk_test_51K3Y-EXPOSED-DO-NOT-COMMIT'
const DEFAULT_ADMIN_PASSWORD = 'P@ssw0rd!' // CWE-259: Use of Hard-coded Password

export function leakSecrets () {
  return (_req: Request, res: Response) => {
    // Expose environment and hardcoded secrets (CWE-200)
    const envSubset: Record<string, string | undefined> = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET
    }
    res.json({
      message: 'Diagnostics (unsafe): do not expose in production',
      hardcoded: { HARDCODED_API_KEY, DEFAULT_ADMIN_PASSWORD },
      env: envSubset
    })
  }
}

export function insecureEval () {
  return (req: Request, res: Response) => {
    // CWE-95: Eval Injection (using Function constructor)
    const code = req.body?.code ?? '(() => \"no code\")()'
    let result: unknown
    try {
      // eslint-disable-next-line no-new-func
      result = (new Function(`return (${code});`))()
    } catch (e: any) {
      result = { error: String(e?.message ?? e) }
    }
    res.json({ result })
  }
}

export function vulnerableSql () {
  return async (req: Request, res: Response) => {
    // CWE-89: SQL Injection via string concatenation
    const email = String(req.query.email ?? '')
    const query = `SELECT id, email FROM Users WHERE email = '${email}'`
    try {
      const [rows] = await sequelize.query(query)
      res.json({ rows })
    } catch (err: unknown) {
      res.status(500).json({ error: 'Query failed', details: String((err as any)?.message ?? err) })
    }
  }
}

export function insecureCommand () {
  return (req: Request, res: Response) => {
    // CWE-78: OS Command Injection
    const userCmd = String(req.body?.cmd ?? 'echo safe')
    exec(userCmd, (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({ ok: false, error: String(error) })
        return
      }
      res.json({ ok: true, stdout, stderr })
    })
  }
}

export function weakCrypto () {
  return (_req: Request, res: Response) => {
    // CWE-327/326: Weak crypto parameters and hardcoded key/iv
    const key = Buffer.from('00000000000000000000000000000000', 'hex') // 128-bit zero key
    const iv = Buffer.alloc(16, 0) // static IV
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv)
    let enc = cipher.update('Sensitive message', 'utf8', 'hex')
    enc += cipher.final('hex')
    res.json({ ciphertext: enc, key: key.toString('hex'), iv: iv.toString('hex') })
  }
}

export function insecureRandom () {
  return (_req: Request, res: Response) => {
    // CWE-330: Use of Insufficiently Random Values for security token
    const token = Math.random().toString(36).slice(2) // not cryptographically secure
    res.json({ token })
  }
}

export function authBypass () {
  return (req: Request, res: Response) => {
    // CWE-287: Authentication Bypass via query flag
    if (req.query?.debug === 'true') {
      res.json({ user: { id: 1, role: 'admin', note: 'debug bypass (unsafe)' } })
      return
    }
    res.status(401).json({ error: 'Unauthorized' })
  }
}

export function pathTraversal () {
  return (req: Request, res: Response) => {
    // CWE-22: Path Traversal reading arbitrary files
    const filename = String(req.query.file ?? 'server.ts')
    const p = path.resolve('.', filename) // resolves traversal but still allows reading arbitrary project files
    try {
      const data = fs.readFileSync(p, 'utf8')
      res.type('text/plain').send(data)
    } catch (e: any) {
      res.status(404).json({ error: 'File not found', details: String(e?.message ?? e) })
    }
  }
}

export function logSensitive () {
  return (req: Request, res: Response, _next: NextFunction) => {
    // CWE-532: Insertion of Sensitive Information into Log Files
    const email = String(req.body?.email ?? '')
    const password = String(req.body?.password ?? '')
    // eslint-disable-next-line no-console
    console.log('[DEBUG LOGIN] Attempt', { email, password })
    res.json({ ok: true })
  }
}

export function fragileErrorHandling () {
  return (_req: Request, res: Response) => {
    // Reliability and maintainability issues: overly long function, empty catch, duplicated logic
    let total = 0
    for (let i = 0; i < 5; i++) {
      total += i
    }
    for (let i = 0; i < 5; i++) { // duplicated loop
      total += i
    }
    try {
      JSON.parse('{ invalid json }') // will throw
    } catch (e) {
      // swallow error intentionally
    }
    // overly chatty return with unnecessary nesting
    if (total > -1) {
      if (total > -2) {
        res.json({ total, status: 'ok' })
        return
      } else {
        res.json({ total, status: 'weird' })
        return
      }
    }
    res.json({ total })
  }
}


