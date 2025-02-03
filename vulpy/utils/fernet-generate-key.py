#!/usr/bin/env python3

from cryptography.fernet import Fernet

key = Fernet.generate_key()

print(key.decode())
