#!/usr/bin/env python3

from binascii import hexlify

import click
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, hmac


@click.command()
@click.argument('key')
@click.argument('message')
def hmac_generate(key, message):

    h = hmac.HMAC(key.encode(), hashes.SHA256(), backend=default_backend())
    h.update(message.encode())

    print(hexlify(h.finalize()).decode())

if __name__ == '__main__':
    hmac_generate()
