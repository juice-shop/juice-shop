
# Juice Shop Master

This project contains my completed hacking challenges from the OWASP Juice Shop application.
The content of this repository is provided solely for educational and ethical security research purposes.

---

## Table of Contents
- [Project Description](#project-description)
- [Quickstart](#quickstart)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
- [Features](#features)
- [Challenge Documentation & Videos](#challenge-documentation--videos)
- [Security Notice](#security-notice)
- [Submitting the Project / Push to GitHub](#submitting-the-project--push-to-github)
- [Contributing](#contributing)
- [License](#license)
- [Resources](#resources)

---

## Project Description
This repository documents several hacking challenges solved within the OWASP Juice Shop environment.
Each challenge includes a written report, related materials, and a demonstration video showing how the vulnerability is exploited.

---

## Quickstart

### 1. Fork the Project

Go to the official OWASP Juice Shop repository <https://github.com/juice-shop/juice-shop.git> and click the *Fork* button to create your own copy:

### 2. Clone Your Fork

Clone the project from *your own GitHub account*:
```bash
git clone https://github.com/<your-username>/juice-shop.git
```
Replace <your-username> with your actual GitHub username.

### 3. Install Dependencies
```bash
cd juice-shop
npm install
```

### 4. Start the Application
```bash
npm start
```

### 5. Visit

Now visit the application at:
```
http://localhost:3000
```

## Prerequisites

Before running the project, ensure you have:

- Node.js

- npm

- A modern web browser

- Basic understanding of web security concepts

## Usage

1. Run Juice Shop locally.

2. Attempt the security challenges.

3. Use browser developer tools or ethical hacking utilities.

4. Document each challenge in its corresponding folder.

## Features

- Structured challenge documentation

- Video demonstrations for each vulnerability

- Organized folder structure

- Educational cybersecurity content

## Challenge Documentation & videos

Below are the three selected challenges for the Juice Shop Master project.

All explanations and technical steps reflect the actual methods used during exploitation using Burp Suite.

Each challenge includes:

- A description of the vulnerability

- The exact method used (based on Burp Suite workflow)

- The exploitation steps

- Security risks

- Results

- The demonstration video

### 1. Client-side XSS Protection

#### Category: 

Cross-Site Scripting (XSS) / Client-Side Input Validation

#### Description

The Juice Shop application attempts to block malicious input using client-side validation.
However, because validation happens only on the frontend, it can be bypassed by intercepting and modifying the request before it reaches the server.

#### Exploitation Steps

1. Register a new user inside Juice Shop but before clicking “Register,” turn on Intercept in Burp Suite.

2. Click Register, allowing Burp to intercept the POST /api/user request.

3. Send the intercepted request to Repeater.

4. From the Scoreboard hint, copy the provided payload:
```
<iframe src="javascript:alert(`xss`)">
```
5. Replace the email field in the JSON request with this payload.

6. Escape internal quotes to keep JSON valid:
```
<iframe src=\"javascript:alert(`xss`)\">
```
7. Click Send in Repeater to forward the modified request.

8. The browser processes the injected payload, triggering the XSS and solving the challenge.

#### Risks & Impact

- Execution of arbitrary JavaScript in a victim’s browser

- Session hijacking

- Account takeover

- Phishing, redirects, or keylogging

- Full compromise of user interaction inside the application

#### Result

The challenge is solved once the JavaScript alert executes successfully, proving that client-side protection was bypassed.

#### Challenge Video

- Client-side XSS Protection — [Watch Video](https://www.loom.com/share/53404102561e450685a398f69a681a15)

### 2. CAPTCHA Bypass challenge

#### Category:

Input Validation / Bot Prevention Failure

#### Description

The CAPTCHA mechanism in Juice Shop does not validate the CAPTCHA value on the server.
This makes it possible to submit feedback repeatedly without solving the CAPTCHA, simply by replaying the request.

#### Exploitation Steps

1. Log out and go to the Customer Feedback section.

2. Write a comment, choose a rating, and solve the CAPTCHA only once.

3. Enable Intercept in Burp Suite and click Submit.

4. In Burp, capture the POST /api/feedback request.

5. Send this request to Repeater.

6. Back in the browser, write another comment but do not solve the CAPTCHA.

7. Instead, repeatedly click Send in Repeater to bypass the CAPTCHA.

8. Each repeated request is accepted successfully despite not solving the CAPTCHA image again.

#### Risks & Impact

- Automated spam through mass feedback submissions

- CAPTCHA becomes ineffective

- Bots can abuse forms and generate noise

- Potential for automated large-scale attacks

#### Result

The challenge is solved once multiple feedback entries are submitted without ever solving the CAPTCHA again.

#### Challenge Video

- CAPTCHA Bypass — [Watch Video](https://www.loom.com/share/9cfd73dc034749449d7da6e9cf5f9f26)

### 3. Admin Registration challenge

#### Category:

Access Control / Account Privilege Escalation

#### Description

Juice Shop exposes internal API functionality allowing the creation of admin users.
When user creation requests are intercepted, an attacker can modify the payload and assign admin privileges to a new account.

#### Exploitation Steps

1. Begin registering a new user in Juice Shop.

2. Before clicking Register, enable Intercept in Burp Suite.

3. Submit the form and intercept the POST /api/user request.

4. Forward the request to Repeater.

5. Under the "passwordRepeat" parameter, manually insert the following:
```
"role": "admin",
```

6. Send the modified request.

7. Turn off Intercept and log in using the newly created account.

8. The account now has administrative privileges.


#### Risks & Impact

- Unauthorized admin account creation

- Full application compromise

- Access to sensitive data

- Ability to modify or delete users, products, and orders

- Severe privilege escalation

#### Result

The challenge is solved when the created user is successfully logged in as an admin.

#### Challenge Video

- Admin Registration — [Watch Video](https://www.loom.com/share/9197fd6d39ab4cb0b444707d4ba0a1fa)

## Security Notice

- No real personal data was used in this project.

- No passwords, tokens, SSH keys, or sensitive information are stored in the repository.

- Environment variables were used where credentials were required.

- All activities were performed for ethical and educational purposes.

## Submitting the Project / Push to GitHub

After completing all challenges and documentation, push your changes to a **feature branch** called `my-challenges`:

```bash

#### Create and switch to the feature branch
git checkout -b my-challenges

#### Add all project files
git add .

#### Commit your changes
git commit -m "Add project and challenge documentation"

#### Push to your forked repository
git push origin my-challenges
```

## Contributing

Contributions are welcome!

Feel free to open a pull request to improve documentation or add enhancements.

## License

This project is licensed under the MIT License.

## Resources

A list of external tools, tutorials, or references will be added here.
