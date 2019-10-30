const config = require('config')
const replace = require('replace')
const utils = require('../utils')

const customizeEasterEgg = () => {
  if (config.get('application.planetOverlayMap')) {
    let overlay = config.get('application.planetOverlayMap')
    if (utils.startsWith(overlay, 'http')) {
      const overlayPath = overlay
      overlay = utils.extractFilename(overlay)
      utils.downloadToFile(overlayPath, 'frontend/dist/frontend/assets/private/' + overlay)
    }
    replaceImagePath(overlay)
  }
  if (config.get('application.planetName')) {
    replaceThreeJsTitleTag()
  }
}

const replaceImagePath = (overlay) => {
  const textureDeclaration = 'orangeTexture = THREE.ImageUtils.loadTexture("/assets/private/' + overlay + '");'
  replace({
    regex: /orangeTexture = .*;/,
    replacement: textureDeclaration,
    paths: ['frontend/dist/frontend/assets/private/threejs-demo.html'],
    recursive: false,
    silent: true
  })
}

const replaceThreeJsTitleTag = () => {
  const threeJsTitleTag = '<title>Welcome to Planet ' + config.get('application.planetName') + '</title>'
  replace({
    regex: /<title>.*<\/title>/,
    replacement: threeJsTitleTag,
    paths: ['frontend/dist/frontend/assets/private/threejs-demo.html'],
    recursive: false,
    silent: true
  })
}

module.exports = customizeEasterEgg
