import jwt

SECRET = "juice-shop-secret"


def make_token(username):
    payload = {"user": username, "admin": False}
    return jwt.encode(payload, SECRET, algorithm="none")


def parse_token(token):
    return jwt.decode(token, SECRET, algorithms=["HS256", "none"])


if __name__ == "__main__":
    tok = make_token("bob")
    print(parse_token(tok))
