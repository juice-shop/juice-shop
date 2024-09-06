import os
import requests
import json
import logging
import re

logger = logging.getLogger(__name__)

def customize_application():
    if get_config('application.name'):
        customize_title()
    if get_config('application.logo'):
        customize_logo()
    if get_config('application.favicon'):
        customize_favicon()
    if get_config('application.theme'):
        customize_theme()
    if get_config('application.cookieConsent'):
        customize_cookie_consent_banner()
    if get_config('application.promotion'):
        customize_promotion_video()
        customize_promotion_subtitles()
    if get_config('hackingInstructor'):
        customize_hacking_instructor_avatar()
    if get_config('application.chatBot'):
        customize_chatbot_avatar()

def get_config(key):
    with open('config.json') as f:
        config = json.load(f)
    return config.get(key)

def customize_logo():
    retrieve_custom_file('application.logo', 'frontend/dist/frontend/assets/public/images')

def customize_chatbot_avatar():
    avatar_image = retrieve_custom_file('application.chatBot.avatar', 'frontend/dist/frontend/assets/public/images')
    os.rename('frontend/dist/frontend/assets/public/images/' + avatar_image, 'frontend/dist/frontend/assets/public/images/ChatbotAvatar.png')

def customize_hacking_instructor_avatar():
    avatar_image = retrieve_custom_file('hackingInstructor.avatarImage', 'frontend/dist/frontend/assets/public/images')
    os.rename('frontend/dist/frontend/assets/public/images/' + avatar_image, 'frontend/dist/frontend/assets/public/images/hackingInstructor.png')

def customize_favicon():
    favicon = retrieve_custom_file('application.favicon', 'frontend/dist/frontend/assets/public')
    replace_in_file('frontend/dist/frontend/index.html', r'type="image/x-icon" href="assets/public/.*"', f'type="image/x-icon" href="assets/public/{favicon}"')

def customize_promotion_video():
    retrieve_custom_file('application.promotion.video', 'frontend/dist/frontend/assets/public/videos')

def customize_promotion_subtitles():
    retrieve_custom_file('application.promotion.subtitles', 'frontend/dist/frontend/assets/public/videos')

def retrieve_custom_file(source_property, destination_folder):
    file = get_config(source_property)
    if is_url(file):
        file_path = file
        file = extract_filename(file)
        download_to_file(file_path, os.path.join(destination_folder, file))
    return file

def customize_title():
    title = f'<title>{get_config("application.name")}</title>'
    replace_in_file('frontend/dist/frontend/index.html', r'<title>.*</title>', title)

def customize_theme():
    body_class = f'"mat-app-background {get_config("application.theme")}-theme"'
    replace_in_file('frontend/dist/frontend/index.html', r'"mat-app-background .*-theme"', body_class)

def customize_cookie_consent_banner():
    content_property = f'"content": {{"message": "{get_config("application.cookieConsent.message")}", "dismiss": "{get_config("application.cookieConsent.dismissText")}", "link": "{get_config("application.cookieConsent.linkText")}", "href": "{get_config("application.cookieConsent.linkUrl")}"}}'
    replace_in_file('frontend/dist/frontend/index.html', r'"content": { "message": ".*", "dismiss": ".*", "link": ".*", "href": ".*" }', content_property)

def is_url(url):
    return url.startswith('http')

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

def replace_in_file(file_path, pattern, replacement):
    with open(file_path, 'r') as file:
        content = file.read()
    content_new = re.sub(pattern, replacement, content)
    with open(file_path, 'w') as file:
        file.write(content_new)
