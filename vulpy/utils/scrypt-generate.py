#!/usr/bin/env python3

import sys
import os
from binascii import hexlify

import click

from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.backends import default_backend

@click.command()
@click.argument('message')
def scrypt_generate(message):

    backend = default_backend()
    salt = os.urandom(16)

    kdf = Scrypt(
        salt=salt,
        length=32,
        n=2**14,
        r=8,
        p=1,
        backend=backend
    )

    key = kdf.derive(message.encode())

    print(hexlify(salt).decode(), hexlify(key).decode())


if __name__ == '__main__':
    scrypt_generate()

