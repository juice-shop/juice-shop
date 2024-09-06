import path
import utils
import logger
from shutil import copyfile
from glob import glob

def exists(path):
    try:
        with open(path):
            return True
    except IOError:
        return False

def restore_overwritten_files_with_originals():
    copyfile(path.resolve('data/static/legal.md'), path.resolve('ftp/legal.md'))

    if exists(path.resolve('frontend/dist')):
        copyfile(
            path.resolve('data/static/owasp_promo.vtt'),
            path.resolve('frontend/dist/frontend/assets/public/videos/owasp_promo.vtt')
        )

    try:
        files = glob(path.resolve('data/static/i18n/*.json'))
        for filename in files:
            copyfile(filename, path.resolve('i18n/', filename[filename.rfind('/') + 1:]))
    except Exception as err:
        logger.warn('Error listing JSON files in /data/static/i18n folder: ' + utils.get_error_message(err))
