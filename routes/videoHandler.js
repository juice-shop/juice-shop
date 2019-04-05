const fs = require('fs')
const jade = require('jade')
const config = require('config')
const challenges = require('../data/datacache').challenges
const utils = require('../lib/utils')
const themes = require('../views/themes/themes').themes

exports.getVideo = () => {
  return (req, res, next) => {
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
  return (req, res, next) => {
    fs.readFile('views/promotionVideo.jade', function (err, buf) {
      if (err) throw err
      let jadeTemplate = buf.toString()
      let subs = getSubsFromFile()
      if (utils.contains(subs, `</script><script>alert(\`xss\`)</script>`)) {
        if (utils.notSolved(challenges.videoXssChallenge)) {
          utils.solve(challenges.videoXssChallenge)
        }
      }
      const theme = themes[config.get('application.theme')]
      jadeTemplate = jadeTemplate.replace(/_title_/g, config.get('application.name'))
      jadeTemplate = jadeTemplate.replace(/_favicon_/g, favicon())
      jadeTemplate = jadeTemplate.replace(/_bgColor_/g, theme.bgColor)
      jadeTemplate = jadeTemplate.replace(/_textColor_/g, theme.textColor)
      jadeTemplate = jadeTemplate.replace(/_navColor_/g, theme.navColor)
      const fn = jade.compile(jadeTemplate)
      let compiledJade = fn()
      compiledJade = compiledJade.replace(`<script id="subtitle"></script>`, `<script id="subtitle" type="text/vtt" data-label="English" data-lang="en">` + subs + `</script>`)
      res.send(compiledJade)
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
