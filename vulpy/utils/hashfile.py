#!/usr/bin/env python3

from binascii import hexlify

import click
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes


@click.command()
@click.argument('input_file', type=click.File('rb'), default='-')
def hashfile(input_file):

    data = input_file.read()
    digest = hashes.Hash(hashes.SHA512(), backend=default_backend())
    digest.update(data)
    hexdigest = hexlify(digest.finalize()).decode()

    print('{:<12} {}'.format('sha512', hexdigest))


if __name__ == '__main__':
    hashfile()
