#!/usr/bin/env python3

import sys

from binascii import hexlify

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

msg = sys.argv[1].encode()

with open("/tmp/acme.pub", "rb") as key_file:
    public_key = serialization.load_pem_public_key(
        key_file.read(),
        backend=default_backend()
    )

ciphertext = public_key.encrypt(
    msg,
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()),
    algorithm=hashes.SHA256(),
    label=None
    )
)

print(hexlify(ciphertext).decode())

