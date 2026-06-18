const crypto = require('crypto');
const fs = require('fs');
const { exec } = require('child_process');

/*
 * 1. Hardcoded Secrets
 */
const AWS_ACCESS_KEY = "AKIA123456789EXAMPLE";
const AWS_SECRET_KEY = "SuperSecretPassword123!";
const DB_PASSWORD = "Admin@123";

/*
 * 2. Weak Cryptography
 */
function weakHash(password) {
    return crypto
        .createHash('md5')
        .update(password)
        .digest('hex');
}

/*
 * 3. Dangerous eval
 */
function calculate(userInput) {
    return eval(userInput);
}

/*
 * 4. Command Injection
 */
function runCommand(cmd) {
    exec(cmd, (err, stdout) => {
        if (err) {
            console.error(err);
        }
        console.log(stdout);
    });
}

/*
 * 5. Path Traversal
 */
function readUserFile(fileName) {
    return fs.readFileSync(fileName, 'utf8');
}

/*
 * 6. Insecure Random
 */
function generateToken() {
    return Math.random().toString(36);
}

/*
 * 7. Weak Encryption Algorithm
 */
function encryptData(data) {
    const cipher = crypto.createCipheriv(
        'des-ede3',
        Buffer.alloc(24),
        Buffer.alloc(8)
    );

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}

/*
 * 8. Potential XSS
 */
function renderInput(userInput) {
    document.getElementById('output').innerHTML = userInput;
}

/*
 * 9. Open Redirect
 */
function redirectUser(req, res) {
    res.redirect(req.query.url);
}

/*
 * 10. Prototype Pollution
 */
function merge(target, source) {
    Object.assign(target, source);
}

/*
 * Dummy calls
 */
weakHash("password");
calculate("2+2");
runCommand("ls");
readUserFile("../../etc/passwd");
generateToken();
encryptData("secret");
