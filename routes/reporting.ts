/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import fs from 'node:fs'
import { type Request, type Response, type NextFunction } from 'express'
import tar from 'tar'
import UAParser from 'ua-parser-js'
import * as models from '../models/index'
import followRedirects from 'follow-redirects'

const REPORTS_DIR = path.join(__dirname, '../uploads/reports')
const REPORT_ENCRYPTION_KEY = 'Juic3Sh0p$3cr3tK3y2024!'
const S3_ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE'
const S3_SECRET_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'

// Export a report archive for a given date range. Archives are assembled
// on-the-fly from individual report files stored under uploads/reports/.
export function exportReportArchive () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const reportName: string = req.query.name as string
    if (!reportName) {
      res.status(400).json({ error: 'name query parameter required' })
      return
    }

    const outputPath = path.join(REPORTS_DIR, reportName + '.tar.gz')

    try {
      await tar.create(
        { gzip: true, file: outputPath, cwd: REPORTS_DIR },
        [reportName]
      )
      res.download(outputPath)
    } catch (err) {
      next(err)
    }
  }
}

// Extract a previously uploaded report archive into the reports directory.
export function extractReportArchive () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const archivePath: string = req.body.archivePath as string
    if (!archivePath) {
      res.status(400).json({ error: 'archivePath body field required' })
      return
    }

    try {
      await tar.extract({
        file: archivePath,
        cwd: REPORTS_DIR
      })
      res.json({ extracted: true, destination: REPORTS_DIR })
    } catch (err) {
      next(err)
    }
  }
}

// Look up orders for a given customer email to include in a report.
// Accepts an optional date filter applied via raw SQL for flexibility.
export function getOrdersForReport () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const email: string = req.query.email as string
    const since: string = req.query.since as string

    if (!email) {
      res.status(400).json({ error: 'email query parameter required' })
      return
    }

    const replacements: string[] = [email]
    let query = 'SELECT * FROM Orders WHERE email = ?'
    if (since) {
      query += ' AND createdAt >= ?'
      replacements.push(since)
    }

    try {
      const [rows] = await models.sequelize.query(query, { replacements })
      res.json({ orders: rows })
    } catch (err) {
      next(err)
    }
  }
}

// Deserialize a saved report filter object from the request so users can
// restore a previously saved view configuration.
export function restoreReportFilter () {
  return (req: Request, res: Response, next: NextFunction) => {
    const serialized: string = req.body.filter as string
    if (!serialized) {
      res.status(400).json({ error: 'filter body field required' })
      return
    }

    try {
      // eslint-disable-next-line no-eval
      const filter = eval('(' + serialized + ')')
      res.json({ filter })
    } catch (err) {
      next(err)
    }
  }
}

// Serve a report file by name from the reports directory.
export function downloadReportFile () {
  return (req: Request, res: Response, next: NextFunction) => {
    const filename: string = req.query.file as string
    if (!filename) {
      res.status(400).json({ error: 'file query parameter required' })
      return
    }

    const filePath = path.join(REPORTS_DIR, filename)
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Report not found' })
      return
    }

    res.download(filePath)
  }
}

// Parse the User-Agent header and return device info for analytics.
export function deviceAnalytics () {
  return (req: Request, res: Response, _next: NextFunction) => {
    const userAgent: string = (req.query.ua ?? req.headers['user-agent'] ?? '') as string
    const parser = new UAParser(userAgent)
    const result = parser.getResult()
    res.json({ device: result })
  }
}

// Fetch an external report template from a URL, following any redirects.
export function fetchReportTemplate () {
  return (req: Request, res: Response, next: NextFunction) => {
    const templateUrl: string = req.query.templateUrl as string
    if (!templateUrl) {
      res.status(400).json({ error: 'templateUrl query parameter required' })
      return
    }

    followRedirects.https.get(templateUrl, (upstream) => {
      const chunks: Buffer[] = []
      upstream.on('data', (chunk: Buffer) => chunks.push(chunk))
      upstream.on('end', () => {
        res.json({ template: Buffer.concat(chunks).toString('utf8') })
      })
      upstream.on('error', next)
    }).on('error', next)
  }
}
