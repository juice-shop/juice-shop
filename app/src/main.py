from flask import Flask, request, render_template_string, redirect, make_response
import os
import subprocess
import requests
import sqlite3
import pickle
import base64
from xml.etree import ElementTree as ET
import hashlib

app = Flask(__name__)

# --- Database Setup (for SQLi, Stored XSS) ---
DATABASE = 'database.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS users")
    cursor.execute("DROP TABLE IF EXISTS comments")
    cursor.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)")
    cursor.execute("CREATE TABLE comments (id INTEGER PRIMARY KEY AUTOINCREMENT, comment TEXT)")
    # Vulnerability 1: Default credentials / Weak password
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", ('admin', 'password123'))
    conn.commit()
    conn.close()

# Initialize database on startup instead of using before_first_request (which is removed in Flask 2.3+)
with app.app_context():
    init_db()

# --- Existing Vulnerabilities (Updated/Commented) ---

@app.route('/')
def hello():
    # Vulnerability 2: Information Leakage (Server/Framework Version potentially exposed via default headers)
    return 'Hello, Welcome to the Vulnerable App!'

@app.route('/exec', methods=['POST']) # Example: curl -X POST -d "cmd=ls -la" http://localhost:5000/exec
def execute_command():
    # Vulnerability 3: Command Injection (OS Command Injection)
    cmd = request.form.get('cmd', 'echo "No command provided"')
    # BAD: Directly using user input in shell command
    try:
        result = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        # Vulnerability 4: Sensitive Data Exposure (Potentially leaking internal paths/errors)
        result = f"Command failed:\n{e.output}"
    except FileNotFoundError:
        # Vulnerability 4 again
        result = f"Command failed: command '{cmd.split()[0]}' not found."
    return f"<pre>{result}</pre>"

@app.route('/data') # Example: /data?filename=../../../../etc/passwd
def get_data():
    # Vulnerability 5: Path Traversal (Directory Traversal)
    filename = request.args.get('filename', 'data.txt')
    # BAD: User input directly used as file path
    try:
        with open(os.path.join(app.root_path, filename), 'r') as f:
             content = f.read()
    except FileNotFoundError:
        content = "File not found."
    except Exception as e:
        # Vulnerability 4 again
        content = f"An error occurred: {str(e)}"
    return content

@app.route('/api') # Example: /api?url=http://metadata.google.internal/
def call_api():
    url = request.args.get('url')
    if not url:
        return "Please provide a URL."
    # Vulnerability 6: Server-Side Request Forgery (SSRF)
    # BAD: Making requests to arbitrary user-supplied URLs
    try:
        # Vulnerability 7: Insecure Request / Missing SSL Verification
        response = requests.get(url, verify=False, timeout=3)
        # Vulnerability 8: Missing Input Validation (Allowing internal network requests, file://, etc.)
        return response.text
    except requests.exceptions.RequestException as e:
        # Vulnerability 4 again
        return f"Request failed: {str(e)}"

# --- New Vulnerabilities ---

# Vulnerability 9: SQL Injection
@app.route('/users/<user_id>') # Example: /users/1 OR 1=1
def get_user(user_id):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    # BAD: Directly embedding user input into SQL query
    query = f"SELECT username FROM users WHERE id = {user_id}"
    try:
        cursor.execute(query)
        user = cursor.fetchone()
        conn.close()
        if user:
            return f"Username: {user[0]}"
        else:
            return "User not found."
    except sqlite3.Error as e:
        # Vulnerability 4 again
        return f"Database error: {str(e)}"
    finally:
        conn.close()

# Vulnerability 10: Reflected Cross-Site Scripting (XSS)
@app.route('/search') # Example: /search?query=<script>alert('XSS')</script>
def search():
    query = request.args.get('query', '')
    # BAD: Reflecting user input directly into HTML without sanitization
    template = f"<h1>Search Results</h1><p>You searched for: {query}</p>"
    return render_template_string(template)

# Vulnerability 11: Stored Cross-Site Scripting (XSS)
@app.route('/comment', methods=['POST']) # Example: Post comment '<script>alert("Stored XSS")</script>'
def add_comment():
    comment_text = request.form.get('comment')
    if comment_text:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        # BAD: Storing raw user input that might contain scripts
        cursor.execute("INSERT INTO comments (comment) VALUES (?)", (comment_text,))
        conn.commit()
        conn.close()
        return "Comment added!"
    return "No comment provided."

@app.route('/comments')
def view_comments():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT comment FROM comments")
    comments = cursor.fetchall()
    conn.close()
    # BAD: Rendering stored data without sanitization
    comment_html = "".join([f"<p>{c[0]}</p>" for c in comments])
    return f"<h1>Comments</h1>{comment_html}"

# Vulnerability 12: Insecure Deserialization
@app.route('/prefs', methods=['POST']) # Example: Post base64 encoded pickled RCE payload
def load_prefs():
    data = request.form.get('prefs_data')
    if data:
        try:
            decoded_data = base64.b64decode(data)
            # BAD: Deserializing untrusted data with pickle
            prefs = pickle.loads(decoded_data)
            return f"Preferences loaded: {prefs}"
        except Exception as e:
            # Vulnerability 4 again
            return f"Failed to load preferences: {str(e)}"
    return "No preference data provided."

# Vulnerability 13: XML External Entity (XXE)
@app.route('/process_xml', methods=['POST']) # Example: Post XML with XXE payload to read /etc/passwd
def process_xml():
    xml_data = request.form.get('xml')
    if xml_data:
        try:
            # BAD: Parsing XML without disabling external entities
            root = ET.fromstring(xml_data)
            return f"Processed XML root tag: {root.tag}"
        except ET.ParseError as e:
            # Vulnerability 4 again
            return f"XML Parse Error: {str(e)}"
    return "No XML data provided."

# Vulnerability 14: Insecure File Upload (No Type/Size/Name Validation)
@app.route('/upload', methods=['POST']) # Example: Upload a .php shell or large file
def upload_file():
    if 'file' not in request.files:
        return 'No file part'
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    if file:
        # BAD: Saving file with user-provided name without sanitization or type/size checks
        # Could lead to path traversal (if filename is ../../file), overwriting files, or storing malicious files (.php, .exe)
        upload_folder = os.path.join(app.root_path, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file.save(os.path.join(upload_folder, file.filename))
        return 'File uploaded successfully'
    return "File upload failed"

# Vulnerability 15: Insecure Direct Object References (IDOR)
@app.route('/orders/<order_id>') # Example: Access /orders/101 even if it's not yours
def get_order(order_id):
    # BAD: No check if the logged-in user is authorized to view this order_id
    # Simulating fetching an order - in real app, would check user session
    return f"Displaying order details for order ID: {order_id}"

# Vulnerability 16: Open Redirect
@app.route('/redirect') # Example: /redirect?url=http://malicious.com
def redirect_user():
    redirect_url = request.args.get('url')
    if redirect_url:
        # BAD: Redirecting to user-controlled URL without validation
        return redirect(redirect_url)
    return "No redirect URL provided."

# Vulnerability 17: Missing Function Level Access Control
@app.route('/admin_action') # Example: Any user can access /admin_action
def admin_action():
    # BAD: Endpoint performs a sensitive action without checking if user is admin
    return "Admin action executed! (But are you really an admin?)"

# Vulnerability 18: Cryptographic Failures (Weak Hashing)
@app.route('/register', methods=['POST'])
def register_user():
    username = request.form.get('username')
    password = request.form.get('password')
    if username and password:
        # BAD: Using outdated/weak hashing algorithm (MD5)
        hashed_pw = hashlib.md5(password.encode()).hexdigest()
        # In a real app, store username and hashed_pw in DB
        return f"User {username} registered with weak hash: {hashed_pw}"
    return "Username or password missing."

# Vulnerability 19: Cross-Site Request Forgery (CSRF) - Conceptual Demo
@app.route('/change_settings', methods=['POST'])
# Example: Malicious site makes user's browser POST to this endpoint
def change_settings():
    new_email = request.form.get('email')
    # BAD: Action performed based on submitted form without CSRF token validation
    # Assumes user is logged in (cookie-based session)
    return f"Settings changed! New email: {new_email} (CSRF vulnerable)"

# Vulnerability 20: Security Misconfiguration (Missing Security Headers)
@app.route('/secure')
def secure_page():
    response = make_response("This page should be secure!")
    # BAD: Missing headers like Content-Security-Policy, X-Frame-Options, Strict-Transport-Security
    return response

# Vulnerability 21: Sensitive Data Exposure (Debug Mode Enabled)
# Set by app.run(debug=True) below

# Vulnerability 22: Binding to All Interfaces (0.0.0.0)
# Potentially exposes dev server to the network
# Set by app.run(host='0.0.0.0') below

# Vulnerability 23: Hardcoded Credentials (already present)
AZURE_STORAGE_KEY = "dGVzdGluZ19rZXlfZm9yX2RlbW9fcHVycG9zZXNfb25seQ=="
AZURE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=dGVzdGluZ19rZXlfZm9yX2RlbW9fcHVycG9zZXNfb25seQ==;EndpointSuffix=core.windows.net"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 
