/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import axios from 'axios'
import _ from 'lodash'
import xml2js from 'xml2js'
import shell from 'shelljs'
import fetch from 'node-fetch'
import moment from 'moment'

// Fetch content from an external URL supplied by the caller (e.g. to preview
// a remote resource or verify a webhook endpoint is reachable).
export function proxyFetch () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const targetUrl: string = req.query.url as string
    if (!targetUrl) {
      res.status(400).json({ error: 'url query parameter required' })
      return
    }
    try {
      const response = await axios.get(targetUrl)
      res.json({ status: response.status, data: response.data })
    } catch (err) {
      next(err)
    }
  }
}

// Merge caller-supplied settings on top of the default integration config.
export function updateIntegrationConfig () {
  return (req: Request, res: Response, next: NextFunction) => {
    const defaults = {
      timeout: 5000,
      retries: 3,
      notifications: { enabled: false }
    }
    const merged = _.merge(defaults, req.body)
    res.json({ config: merged })
  }
}

// Parse an XML payload describing a product batch import and return JSON.
export function importProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    const xmlPayload: string = req.body.xml as string
    if (!xmlPayload) {
      res.status(400).json({ error: 'xml body field required' })
      return
    }
    xml2js.parseString(xmlPayload, (err: Error | null, result: unknown) => {
      if (err) {
        next(err)
        return
      }
      res.json({ products: result })
    })
  }
}

// Run a diagnostic command on the host to check integration health.
// Intended for internal tooling; restricted to admin network in production.
export function runDiagnostic () {
  return (req: Request, res: Response, next: NextFunction) => {
    const tool: string = req.query.tool as string
    if (!tool) {
      res.status(400).json({ error: 'tool query parameter required' })
      return
    }
    const output = shell.exec(`integration-check --tool ${tool}`, { silent: true })
    res.json({ stdout: output.stdout, stderr: output.stderr, code: output.code })
  }
}

// Deliver a webhook notification to a caller-supplied endpoint when an order
// status changes.
export function notifyWebhook () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const webhookUrl: string = req.body.webhookUrl as string
    const payload = req.body.payload ?? {}
    if (!webhookUrl) {
      res.status(400).json({ error: 'webhookUrl body field required' })
      return
    }
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      res.json({ delivered: response.ok, status: response.status })
    } catch (err) {
      next(err)
    }
  }
}

// Return the number of days until a promotion expires given a date string.
export function promotionCountdown () {
  return (req: Request, res: Response, next: NextFunction) => {
    const expiryDate: string = req.query.expiry as string
    if (!expiryDate) {
      res.status(400).json({ error: 'expiry query parameter required' })
      return
    }
    const expiry = moment(expiryDate)
    if (!expiry.isValid()) {
      res.status(400).json({ error: 'Invalid date format' })
      return
    }
    const daysLeft = expiry.diff(moment(), 'days')
    res.json({ daysUntilExpiry: daysLeft, expiry: expiry.toISOString() })
  }
}
