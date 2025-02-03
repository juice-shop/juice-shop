import pyotp
import sqlite3
from time import sleep

def mfa_is_enabled(username):

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    user = c.execute("SELECT * FROM users WHERE username = ? and mfa_enabled = 1", (username, )).fetchone()

    if user:
        return True
    else:
        return False


def mfa_disable(username):

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("UPDATE users SET mfa_enabled = 0 WHERE username = ?", (username,))
    conn.commit()

    return True


def mfa_enable(username):

    #secret=pyotp.random_base32()

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    #c.execute("UPDATE users SET mfa = ? WHERE username = ?", (secret, username,))
    c.execute("UPDATE users SET mfa_enabled = 1 WHERE username = ?", (username,))
    conn.commit()

    return True


def mfa_get_secret(username):

    #secret=pyotp.random_base32()

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    #c.execute("UPDATE users SET mfa = ? WHERE username = ?", (secret, username,))
    user = c.execute("SELECT * FROM users WHERE username = ?", (username, )).fetchone()

    if user:
        return user['mfa_secret'] #True
    else:
        return False


def mfa_reset_secret(username):

    secret=pyotp.random_base32()

    conn = sqlite3.connect('db_users.sqlite')
    conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    #c.execute("UPDATE users SET mfa = ? WHERE username = ?", (secret, username,))
    #user = c.execute("SELECT * FROM users WHERE username = ?", (username, )).fetchone()
    c.execute("UPDATE users SET mfa_secret = ? WHERE username = ?", (secret, username))
    conn.commit()

    #if user:
    #    return user['mfa_secret'] #True
    #else:
    return False


def mfa_validate(username, otp):

    secret = mfa_get_secret(username)
    totp = pyotp.TOTP(secret)

    if secret and totp.verify(otp):
        return True
    else:
        return False

