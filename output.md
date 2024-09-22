OWAASP - Juice-shop - Assignment for Cycode

Techincal Exercise

- Accesed one both the apps suggested. 

For Webgoat, 


Decided to swap to the OWASP-Juice-Shop

From the README page, I proceeded to use the Docker installation

1. Accessed my GH account: elchamojavier
2. Forked the app to my account & named it : 
https://github.com/elchamojavier/chamos-juicy-shop

3. Downloaded Github Desktop and cloned the repo to my desktop 
/Users/javicortamerino/Documents/GitHub/chamos-juicy-shop

4. Completed the steps using the Docker installation 
https://github.com/elchamojavier/chamos-juicy-shop/blob/master/README.md#docker-container

I executed the app successfully as you'll see in the screenshots

5. Here are the commands & logs: 
Javiers-MacBook-Pro-2:~ javicortamerino$ mkdir chamos-juicy-shop
Javiers-MacBook-Pro-2:~ javicortamerino$ docker pull chamos-juicy-shop
Using default tag: latest

#What's next:
Javiers-MacBook-Pro-2:~ javicortamerino$ docker pull bkimminich/juice-shop
Using default tag: latest
latest: Pulling from bkimminich/juice-shop
1c56d6035a42: Pull complete 
e33bce57de28: Pull complete 
473d8557b1b2: Pull complete 
b6824ed73363: Pull complete 
7c12895b777b: Pull complete 
33e068de2649: Pull complete 
5664b15f108b: Pull complete 
27be814a09eb: Pull complete 
4aa0ea1413d3: Pull complete 
9ef7d74bdfdf: Pull complete 
9112d77ee5b1: Pull complete 
83f8d4690e1f: Pull complete 
a4ba90834fb4: Pull complete 
df368711b362: Pull complete 
e89169bec965: Pull complete 
7f3501c931c2: Pull complete 
88934a1bc18c: Pull complete 
e5035db4cc0a: Pull complete 
8efa0c0f471f: Pull complete 
3ff24aff2a94: Pull complete 
5262974a31dc: Pull complete 
Digest: sha256:ada9b7ecd3d5f9485e3734bc8b4f07699f9774c0807d1ece65f07c62e5961c22
Status: Downloaded newer image for bkimminich/juice-shop:latest
docker.io/bkimminich/juice-shop:latest

What's next:
    View a summary of image vulnerabilities and recommendations → docker scout quickview bkimminich/juice-shop
Javiers-MacBook-Pro-2:~ javicortamerino$ docker scout quickview bkimminich/juice-shop
    ✓ Image stored for indexing
    ✓ Indexed 1031 packages
    ✓ Provenance obtained from attestation

    i Base image was auto-detected. To get more accurate results, build images with max-mode provenance attestations.
      Review docs.docker.com ↗ for more information.
      
  Target     │  bkimminich/juice-shop:latest       │    9C    25H    27M     0L    10?   
    digest   │  520e3f10057c                       │                                     
  Base image │  distroless/static-debian11:latest  │    0C     0H     0M     0L          

What's next:
    View vulnerabilities → docker scout cves bkimminich/juice-shop
    Include policy results in your quickview by supplying an organization → docker scout quickview bkimminich/juice-shop --org <organization>

Javiers-MacBook-Pro-2:~ javicortamerino$ docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop
info: Detected Node.js version v20.17.0 (OK)
info: Detected OS linux (OK)
info: Detected CPU x64 (OK)
info: Configuration default validated (OK)
info: Entity models 19 of 19 are initialized (OK)
info: Required file server.js is present (OK)
info: Required file index.html is present (OK)
info: Required file styles.css is present (OK)
info: Required file main.js is present (OK)
info: Required file runtime.js is present (OK)
info: Required file vendor.js is present (OK)
info: Required file polyfills.js is present (OK)
info: Port 3000 is available (OK)
info: Chatbot training data botDefaultTrainingData.json validated (OK)
info: Domain https://www.alchemy.com/ is reachable (OK)
info: Server listening on port 3000
        Javiers-MacBook-Pro-2:~ javicorta
Javiers-MacBook-Pro-2:~ javicortamerino$ 
Javiers-MacBook-Pro-2:~ javicortamerino$ 
Javiers-MacBook-Pro-2:~ javicortamerino$ script terminal_session-chamo-juicy-shop.log
Script started, output file is terminal_session-chamo-juicy-shop.log

The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
bash-3.2$ docker ps -a
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
bash-3.2$ docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop
info: Detected Node.js version v20.17.0 (OK)
info: Detected OS linux (OK)
info: Detected CPU x64 (OK)
info: Configuration default validated (OK)
info: Entity models 19 of 19 are initialized (OK)
info: Required file server.js is present (OK)
info: Required file styles.css is present (OK)
info: Required file main.js is present (OK)
info: Required file index.html is present (OK)
info: Required file runtime.js is present (OK)
info: Required file vendor.js is present (OK)
info: Required file polyfills.js is present (OK)
info: Port 3000 is available (OK)
info: Chatbot training data botDefaultTrainingData.json validated (OK)
info: Domain https://www.alchemy.com/ is reachable (OK)
info: Server listening on port 3000

# screenshot is attached

6. 
To your questions in step 6. 
a. The output.md file was not in the local repo
b. Obviously, I needed to create a branch ahead of adding the output.md file to the master 
c. These steps were added to the file using the --amend option. Then, i merged it.
Rest of steps 5, 7, 8 coming next
