import config
import utils
import replace

def customize_easter_egg():
    if config.has('application.easterEggPlanet.overlayMap'):
        overlay = config.get('application.easterEggPlanet.overlayMap')
        if utils.is_url(overlay):
            overlay_path = overlay
            overlay = utils.extract_filename(overlay)
            utils.download_to_file(overlay_path, 'frontend/dist/frontend/assets/private/' + overlay)
        replace_image_path(overlay)
    if config.has('application.easterEggPlanet.name'):
        replace_three_js_title_tag()

def replace_image_path(overlay):
    texture_declaration = 'orangeTexture = THREE.ImageUtils.loadTexture("/assets/private/' + overlay + '");'
    replace({
        'regex': 'orangeTexture = .*;',
        'replacement': texture_declaration,
        'paths': ['frontend/dist/frontend/assets/private/threejs-demo.html'],
        'recursive': False,
        'silent': True
    })

def replace_three_js_title_tag():
    three_js_title_tag = '<title>Welcome to Planet ' + config.get('application.easterEggPlanet.name') + '</title>'
    replace({
        'regex': '<title>.*</title>',
        'replacement': three_js_title_tag,
        'paths': ['frontend/dist/frontend/assets/private/threejs-demo.html'],
        'recursive': False,
        'silent': True
    })
