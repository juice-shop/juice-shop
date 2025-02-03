#!/usr/bin/env python3

import click
import requests
import tempfile
#from libuser import password_complex

MINLENGTH = 12
URL = 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-1000000.txt'


@click.command()
@click.option('-o', 'outfile', default='-', type=click.File('w'), help='Output file (default: stdout)')
@click.option('-u', 'url', default=URL, help='URL to retrieve password file')
@click.option('-l', 'minlength', default=MINLENGTH, help='Minimum password length')
def generate_leaked_passwords(outfile, url, minlength):

    temp_outfile = tempfile.NamedTemporaryFile(delete=False)

    click.echo('Downloading password file...', nl=False, err=True)
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        for chunk in r.iter_content(chunk_size=8192):
            if chunk:
                click.echo('.', nl=False, err=True)
                temp_outfile.write(chunk)

    click.echo('OK', err=True)
    temp_outfile.seek(0)

    for password in temp_outfile.read().decode().split('\n'):

        if not password:
            continue

        if len(password) < minlength:
            continue

        outfile.write(password + '\n')

    temp_outfile.close()


if __name__ == '__main__':
    generate_leaked_passwords()

