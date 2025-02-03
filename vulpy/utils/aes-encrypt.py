#!/usr/bin/env python3

import os
import sys

from binascii import hexlify

import click

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes

@click.command()
@click.argument('key')
@click.argument('message')
def aes_encrypt(key, message):

    #key = sys.argv[1].encode()
    #plain = sys.argv[2].encode()
    iv = os.urandom(16)

    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(key.encode())
    key_digest = digest.finalize()


    cipher = Cipher(algorithms.AES(key_digest), modes.CFB(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    encrypted = encryptor.update(message.encode()) + encryptor.finalize()

    print(hexlify(iv).decode(), hexlify(encrypted).decode())

if __name__ == '__main__':
    aes_encrypt()

