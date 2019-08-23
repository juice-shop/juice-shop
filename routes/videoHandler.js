const fs = require('fs')
const pug = require('pug')
const config = require('config')
const challenges = require('../data/datacache').challenges
const utils = require('../lib/utils')
const themes = require('../views/themes/themes').themes

exports.getVideo = () => {
  return (req, res) => {
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
        'Content-Location': '/assets/public/videos/JuiceShopJingle.mp4',
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
  return (req, res) => {
    fs.readFile('views/promotionVideo.pug', function (err, buf) {
      if (err) throw err
      let template = buf.toString()
      const subs = getSubsFromFile()
      if (utils.contains(subs, '</script><script>alert(`xss`)</script>')) {
        if (utils.notSolved(challenges.videoXssChallenge)) {
          utils.solve(challenges.videoXssChallenge)
        }
      }
      const theme = themes[config.get('application.theme')]
      template = template.replace(/_title_/g, config.get('application.name'))
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
    let icon = config.get('application.favicon')
    icon = decodeURIComponent(icon.substring(icon.lastIndexOf('/') + 1))
    return icon
  }
}

function getSubsFromFile () {
  let subtitles = 'JuiceShopJingle.vtt'
  if (config && config.application && config.application.promotion && config.application.promotion.subtitles !== null) {
    subtitles = config.application.promotion.subtitles
    if (subtitles.substring(0, 4) === 'http') {
      subtitles = decodeURIComponent(subtitles.substring(subtitles.lastIndexOf('/') + 1))
    }
  }
  const data = fs.readFileSync('frontend/dist/frontend/assets/public/videos/' + subtitles, 'utf8')
  return data.toString()
}

function videoPath () {
  if (config && config.application && config.application.promotion && config.application.promotion.video !== null) {
    let video = config.application.promotion.video

    if (video.substring(0, 4) === 'http') {
      video = decodeURIComponent(video.substring(video.lastIndexOf('/') + 1))
    }
    return 'frontend/src/assets/public/videos/' + video
  }
  return 'frontend/src/assets/public/videos/JuiceShopJingle.mp4'
}
