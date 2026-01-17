# OWASP Juice Shop Deployment

## Application
OWASP Juice Shop – intentionally vulnerable web application.

## Environment
- OS: macOS
- Docker Desktop
- Git
- Browser: Chrome

## Steps Followed
1. Forked the OWASP Juice Shop repository from GitHub.
2. Cloned the forked repository to my local machine using Git.
3. Installed and started Docker Desktop.
4. Pulled the OWASP Juice Shop Docker image:
   docker pull bkimminich/juice-shop
5. Ran the container exposing port 3000:
   docker run -d -p 3000:3000 bkimminich/juice-shop
6. Verified the container was running using:
   docker ps
7. Opened the application via http://localhost:3000.
8. Took a screenshot of the homepage and saved it in `screenshots/homepage.png`.

## Screenshot
![Juice Shop Homepage](screenshots/homepage.png)
