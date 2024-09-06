import os
import glob
import logging

logger = logging.getLogger(__name__)

def cleanup_ftp_folder():
    try:
        files = glob.glob('ftp/*.pdf')
        for filename in files:
            os.remove(filename)
    except Exception as e:
        logger.warning(f"Error listing PDF files in /ftp folder: {str(e)}")
