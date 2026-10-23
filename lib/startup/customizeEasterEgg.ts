/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs'
import config from 'config'
import * as utils from '../utils'

const customizeEasterEgg = async () => {
  if (config.has('application.easterEggPlanet.overlayMap')) {
    let overlay: string = config.get('application.easterEggPlanet.overlayMap')
    if (utils.isUrl(overlay)) {
      const overlayPath = overlay
      overlay = utils.extractFilename(overlay)
      await utils.downloadToFile(overlayPath, 'frontend/dist/frontend/assets/private/' + overlay)
    }
    replaceImagePath(overlay)
  }
  if (config.has('application.easterEggPlanet.name')) {
    replaceThreeJsTitleTag()
  }
}

const replaceInFile = (filePath: string, regex: RegExp | string, replacement: string) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      const updated = content.replace(regex, replacement)
      if (content !== updated) {
        fs.writeFileSync(filePath, updated, 'utf8')
      }
    }
  } catch {
    // Ignore errors matching previous replace({ silent: true }) behavior
  }
}

const replaceImagePath = (overlay: string) => {
  const textureDeclaration = 'orangeTexture = THREE.ImageUtils.loadTexture("/assets/private/' + overlay + '");'
  replaceInFile('frontend/dist/frontend/assets/private/threejs-demo.html', /orangeTexture = .*;/, textureDeclaration)
}

const replaceThreeJsTitleTag = () => {
  const threeJsTitleTag = '<title>Welcome to Planet ' + config.get<string>('application.easterEggPlanet.name') + '</title>'
  replaceInFile('frontend/dist/frontend/assets/private/threejs-demo.html', /<title>.*<\/title>/, threeJsTitleTag)
}

export default customizeEasterEgg
