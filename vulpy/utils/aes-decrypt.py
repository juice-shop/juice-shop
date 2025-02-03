#!/usr/bin/env python3

import sys

from binascii import unhexlify

import click

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes


@click.command()
@click.argument('key')
@click.argument('iv')
@click.argument('message')
def aes_decrypt(key, iv, message):

    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(key.encode())
    key_digest = digest.finalize()

    cipher = Cipher(algorithms.AES(key_digest), modes.CFB(unhexlify(iv)), backend=default_backend())
    decryptor = cipher.decryptor()
    plain = decryptor.update(unhexlify(message)) + decryptor.finalize()

    print(plain.decode(errors='ignore'))


if __name__ == '__main__':
    aes_decrypt()

