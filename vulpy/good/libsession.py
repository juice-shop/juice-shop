import json
import base64

import geoip2.database

from cryptography.fernet import Fernet


key = 'JHtM1wEt1I1J9N_Evjwqr3yYauXIqSxYzFnRhcf0ZG0='
fernet = Fernet(key)
ttl = 7200 # seconds
reader = geoip2.database.Reader('GeoLite2-Country.mmdb')


def getcountry(request):

    country = 'XX' # For local connections

    try:
        geo = reader.country(request.remote_addr)
        country = geo.country.iso_code
    except Exception:
        pass

    return country


def create(request, response, username):

    country = getcountry(request)

    response.set_cookie('vulpy_session', fernet.encrypt(
        (username + '|' + country).encode()
    ))

    return response


def load(request):

    cookie = request.cookies.get('vulpy_session')

    if not cookie:
        return {}

    try:
        token = fernet.decrypt(cookie.encode(), ttl=ttl).decode()
        username, country = token.split('|')
    except Exception as e:
        print(e)
        return {}

    if country == getcountry(request.remote_addr):
        return {'username': username, 'country' : country}
    else:
        return {}


def destroy(response):
    response.set_cookie('vulpy_session', '', expires=0)
    return response

