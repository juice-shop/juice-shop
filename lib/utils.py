import os
import hashlib
import requests
import json
import logging
import datetime
import re
import pandas as pd

logger = logging.getLogger(__name__)

def query_result_to_json(data, status='success'):
    return {
        'status': status,
        'data': data
    }

def is_url(url):
    return url.startswith('http')

def starts_with(string, prefix):
    return string.startswith(prefix)

def ends_with(string, suffix):
    return string.endswith(suffix)

def contains(string, element):
    return element in string

def contains_escaped(string, element):
    return contains(string, element.replace('"', '\\"'))

def contains_or_escaped(string, element):
    return contains(string, element) or contains_escaped(string, element)

def unquote(string):
    if string.startswith('"') and string.endswith('"'):
        return string[1:-1]
    return string

def trunc(string, length):
    string = string.replace('\r', '').replace('\n', '')
    return string[:length] + '...' if len(string) > length else string

def version(module=None):
    with open('package.json') as f:
        package_json = json.load(f)
    if module:
        return package_json['dependencies'].get(module)
    return package_json['version']

def get_ctf_key():
    if 'CTF_KEY' in os.environ and os.environ['CTF_KEY']:
        return os.environ['CTF_KEY']
    with open('ctf.key') as f:
        return f.read().strip()

def ctf_flag(text):
    sha_obj = hashlib.sha1()
    sha_obj.update(get_ctf_key().encode('utf-8'))
    sha_obj.update(text.encode('utf-8'))
    return sha_obj.hexdigest()

def to_mmm_yy(date):
    months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return f"{months[date.month - 1]}{str(date.year)[2:]}"

def to_iso8601(date):
    return date.strftime('%Y-%m-%d')

def extract_filename(url):
    file = os.path.basename(url)
    if '?' in file:
        file = file.split('?')[0]
    return file

def download_to_file(url, dest):
    try:
        response = requests.get(url)
        response.raise_for_status()
        with open(dest, 'wb') as f:
            f.write(response.content)
    except requests.RequestException as e:
        logger.warn(f"Failed to download {url} ({str(e)})")

def jwt_from(headers):
    auth = headers.get('authorization')
    if auth:
        parts = auth.split(' ')
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            return parts[1]
    return None

def random_hex_string(length):
    return os.urandom(length // 2).hex()

def get_challenge_enablement_status(challenge, safety_mode_setting='auto', is_environment_functions=None):
    if not challenge.get('disabledEnv'):
        return {'enabled': True, 'disabledBecause': None}

    if safety_mode_setting == 'disabled':
        return {'enabled': True, 'disabledBecause': None}

    if is_environment_functions is None:
        is_environment_functions = {
            'is_docker': is_docker,
            'is_heroku': is_heroku,
            'is_windows': is_windows,
            'is_gitpod': is_gitpod
        }

    if 'Docker' in challenge['disabledEnv'] and is_environment_functions['is_docker']():
        return {'enabled': False, 'disabledBecause': 'Docker'}
    if 'Heroku' in challenge['disabledEnv'] and is_environment_functions['is_heroku']():
        return {'enabled': False, 'disabledBecause': 'Heroku'}
    if 'Windows' in challenge['disabledEnv'] and is_environment_functions['is_windows']():
        return {'enabled': False, 'disabledBecause': 'Windows'}
    if 'Gitpod' in challenge['disabledEnv'] and is_environment_functions['is_gitpod']():
        return {'enabled': False, 'disabledBecause': 'Gitpod'}
    if challenge['disabledEnv'] and safety_mode_setting == 'enabled':
        return {'enabled': False, 'disabledBecause': 'Safety Mode'}

    return {'enabled': True, 'disabledBecause': None}

def is_challenge_enabled(challenge):
    return get_challenge_enablement_status(challenge)['enabled']

def parse_json_custom(json_string):
    parser = json.JSONDecoder()
    result = []
    for key, value in parser.decode(json_string).items():
        result.append({'key': key, 'value': value})
    return result

def to_simple_ip_address(ipv6):
    if ipv6.startswith('::ffff:'):
        return ipv6[7:]
    if ipv6 == '::1':
        return '127.0.0.1'
    return ipv6

def get_error_message(error):
    return str(error)

def matches_system_ini_file(text):
    return bool(re.search(r'; for 16-bit app support', text, re.IGNORECASE))

def matches_etc_passwd_file(text):
    return bool(re.search(r'(\w*:\w*:\d*:\d*:\w*:.*)|(Note that this file is consulted directly)', text, re.IGNORECASE))
