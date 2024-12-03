# Identification and Authentication Failures
https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/


# Vulnerability

Passwords do not comply totally with the National Institute of Standards and Technology (NIST) 800-63b's guidelines in section 5.1.1 for Memorized Secrets

- Memorized secrets must be at least 8 characters long and allow ASCII and Unicode characters.
- Secrets should be normalized if using Unicode to ensure consistent representation.
- Verifiers must reject weak or compromised passwords and provide feedback for rejection.
- Arbitrary password changes and strict composition rules are discouraged.
- "Paste" functionality should be allowed to support password manager usage.
- Rate limiting must be enforced, and hints or personal prompts are prohibited.
- Verifiers SHOULD consider avoiding case-sensitive rules to enhance usability, reduce errors, and focus on password length and strength over capitalization.

## How To (Vulnerable Website)

Go to the website or run a local instance of juice shop
Try to login as a new user

Enter "password" into the password input
This is a very easy password to guess and if the site had a significant amount of users this would likely be someone's password.  

Try and enter a password of only 5 characters
This is too short and is suceptible to a brute force attack

The conditions for creating an acceptable password are very complicated (uppercase, lowercase, symbol), which makes it likely that you will forget, or write it down.

## How To (Hardened Website)

Go to the website or run a local instance of the hardened juice shop
Try to login as a new user

Enter "password" into the password input
You will be prompted that the password is "too common" and will be forced to pick something else. 

Try and enter a password of only 5 characters
You will be prompted that the password is "too short" and will be forced to pick something else. 

The conditions for creating an acceptable password are streamlined, which makes it unlikely that you will write it down.

Authored by: Marcus Royce-Fulton