
import hashlib
import os
import sqlite3
from binascii import hexlify, unhexlify
from pathlib import Path

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.exceptions import InvalidKey

HERE = Path(__file__).parent


def login(username, password, **kwargs):

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    user = c.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()

    if not user:
        #print('The user doesnt exists')
        return False

    backend = default_backend()

    kdf = Scrypt(
        salt=unhexlify(user['salt']),
        length=32,
        n=2**14,
        r=8,
        p=1,
        backend=backend
    )

    try:
        kdf.verify(password.encode(), unhexlify(user['password']))
        #print('valid')
        return username
    except InvalidKey:
        #print('invalid1')
        return False
    except Exception as e:
        #print('invalid2', e)
        return False

    #print('No deberia haber llegado aca')
    return False



def user_create(username, password=None):

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("INSERT INTO users (username, password, salt, failures, mfa_enabled, mfa_secret) VALUES ('%s', '%s', '%s', '%d', '%d', '%s')" %(username, '', '', 0, 0, ''))
    conn.commit()

    if password:
        password_set(username, password)

    return True


def password_set(username, password):

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

    key = kdf.derive(password.encode())

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    print('Changing password for', username)
    c.execute("UPDATE users SET password = ?, salt = ? WHERE username = ?", (hexlify(key).decode(), hexlify(salt).decode(), username))
    conn.commit()


def userlist():

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    users = c.execute("SELECT * FROM users").fetchall()

    if not users:
        return []
    else:
        return [ user['username'] for user in users ]


def password_change(username, old_password, new_password):

    if not login(username, old_password):
        return False

    if not is_password_allowed(new_password):
        return False

    password_set(username, new_password)

    return True


def is_password_complex(password):
    return len(password) >= 12


def is_password_leaked(password):
    with (HERE / 'leaked_passwords.txt').open() as leaked_password_file:
        for p in leaked_password_file.read().split('\n'):
            if password == p:
                return True
    return False


def is_password_allowed(password):
    return is_password_complex(password) and not is_password_leaked(password)
