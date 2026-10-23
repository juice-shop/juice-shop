/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Router, type Request, type Response } from 'express'
import fs from 'node:fs'

export interface RobotEntry {
  UserAgent?: string | string[]
  Disallow?: string | string[]
  CrawlDelay?: number | string
  Sitemap?: string | string[]
  Host?: string | string[]
}

export type RobotsConfig = RobotEntry | RobotEntry[] | string

const asArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) return []
  if (Array.isArray(value)) return value
  return [value]
}

export const renderRobotsTxt = (robots?: RobotsConfig): string => {
  if (!robots) return ''
  if (typeof robots === 'string') {
    if (fs.existsSync(robots)) {
      try {
        return fs.readFileSync(robots, 'utf8')
      } catch {
        return robots
      }
    }
    return robots
  }

  const robotEntries = Array.isArray(robots) ? robots : [robots]
  let sitemaps: string[] = []
  let hosts: string[] = []

  const formattedEntries = robotEntries.map((robot) => {
    const lines: string[] = []
    const userAgents = asArray(robot.UserAgent)
    for (const ua of userAgents) {
      lines.push(`User-agent: ${ua}`)
    }

    if (robot.CrawlDelay !== undefined) {
      lines.push(`Crawl-delay: ${robot.CrawlDelay}`)
    }

    if (robot.Sitemap) {
      sitemaps = sitemaps.concat(asArray(robot.Sitemap))
    }
    if (robot.Host) {
      hosts = hosts.concat(asArray(robot.Host))
    }

    const disallows = asArray(robot.Disallow)
    for (const disallow of disallows) {
      lines.push(`Disallow: ${disallow}`)
    }

    return lines.join('\n')
  }).join('\n')

  let result = formattedEntries
  if (sitemaps.length > 0) {
    result += '\n' + sitemaps.map((s) => `Sitemap: ${s}`).join('\n')
  }
  if (hosts.length > 0) {
    result += '\n' + hosts.map((h) => `Host: ${h}`).join('\n')
  }

  return result
}

export const robotsTxt = (config?: RobotsConfig) => {
  const router = Router()
  const content = renderRobotsTxt(config)

  router.get('/robots.txt', (req: Request, res: Response) => {
    res.header('Content-Type', 'text/plain')
    res.send(content)
  })

  return router
}

export default robotsTxt
