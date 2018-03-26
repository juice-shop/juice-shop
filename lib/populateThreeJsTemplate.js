const fs = require('fs-extra')
const config = require('config')
const replace = require('replace')
const utils = require('./utils')

const populateThreeJsTemplate = () => {
  fs.copy('app/private/threejs-demo.template.html', 'app/private/threejs-demo.html', { overwrite: true }, () => {
    if (config.get('application.planetOverlayMap')) {
      let overlay = config.get('application.planetOverlayMap')
      if (utils.startsWith(overlay, 'http')) {
        const overlayPath = overlay
        overlay = decodeURIComponent(overlay.substring(overlay.lastIndexOf('/') + 1))
        utils.downloadToFile(overlayPath, 'app/private/' + overlay)
        replaceImagePath(overlay)
      }
    }
    if (config.get('application.planetName')) {
      replaceThreeJsTitleTag()
    }
  })
}

const replaceImagePath = (overlay) => {
  replace({
    regex: 'orangemap2k.jpg',
    replacement: overlay,
    paths: ['app/private/threejs-demo.html'],
    recursive: false,
    silent: true
  })
}

const replaceThreeJsTitleTag = () => {
  const threeJsTitleTag = '<title>Welcome to Planet ' + config.get('application.planetName') + '</title>'
  replace({
    regex: '<title>Welcome to Planet Orangeuze</title>',
    replacement: threeJsTitleTag,
    paths: ['app/private/threejs-demo.html'],
    recursive: false,
    silent: true
  })
}

module.exports = populateThreeJsTemplate
