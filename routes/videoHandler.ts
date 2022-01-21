/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import { Request, Response } from 'express'

const pug = require('pug')
const config = require('config')
const challenges = require('../data/datacache').challenges
const utils = require('../lib/utils')
const themes = require('../views/themes/themes').themes
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

exports.getVideo = () => {
  return (req: Request, res: Response) => {
    const path = videoPath()
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = (end - start) + 1
      const file = fs.createReadStream(path, { start, end })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Location': '/assets/public/videos/owasp_promo.mp4',
        'Content-Type': 'video/mp4'
      }
      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
  }
}

exports.promotionVideo = () => {
  return (req: Request, res: Response) => {
    fs.readFile('views/promotionVideo.pug', function (err, buf) {
      if (err != null) throw err
      let template = buf.toString()
      const subs = getSubsFromFile()

      utils.solveIf(challenges.videoXssChallenge, () => { return utils.contains(subs, '</script><script>alert(`xss`)</script>') })

      const theme = themes[config.get('application.theme')]
      template = template.replace(/_title_/g, entities.encode(config.get('application.name')))
      template = template.replace(/_favicon_/g, favicon())
      template = template.replace(/_bgColor_/g, theme.bgColor)
      template = template.replace(/_textColor_/g, theme.textColor)
      template = template.replace(/_navColor_/g, theme.navColor)
      template = template.replace(/_primLight_/g, theme.primLight)
      template = template.replace(/_primDark_/g, theme.primDark)
      const fn = pug.compile(template)
      let compiledTemplate = fn()
      compiledTemplate = compiledTemplate.replace('<script id="subtitle"></script>', '<script id="subtitle" type="text/vtt" data-label="English" data-lang="en">' + subs + '</script>')
      res.send(compiledTemplate)
    })
  }
  function favicon () {
    return utils.extractFilename(config.get('application.favicon'))
  }
}

function getSubsFromFile () {
  let subtitles = 'owasp_promo.vtt'
  if (config?.application?.promotion?.subtitles !== null) {
    subtitles = utils.extractFilename(config.application.promotion.subtitles)
  }
  const data = fs.readFileSync('frontend/dist/frontend/assets/public/videos/' + subtitles, 'utf8')
  return data.toString()
}

function videoPath () {
  if (config?.application?.promotion?.video !== null) {
    const video = utils.extractFilename(config.application.promotion.video)
    return 'frontend/src/assets/public/videos/' + video
  }
  return 'frontend/src/assets/public/videos/owasp_promo.mp4'
}
