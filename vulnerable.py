from flask import Flask, request, send_file
import os

app = Flask(__name__)

@app.route("/read")
def read_file():
    filename = request.args.get("file")  # ❌ untrusted input
    path = "uploads/" + filename         # ❌ can break out using ../

    return send_file(path)               # Vulnerable sink

app.run()
