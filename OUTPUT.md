1. CD into the cloned folder juice-shop
2. Run `npm install`
3. Run `npm start` to start the server
4. Browse to <http://localhost:3000>
5. Capture screenshot of the running instance of juice-shop: 
![Alt text](image.png)
6. Merge the file directly into the master branch.
git add .
git commit -m "update output.md file"
git push -u origin master
7. Is there anything wrong with committing the file directly to the master branch?
If I am the only contributor/owner working on a personal project (not in prod), I can merge directly into the master/main (although this is not a best practice). But if I am working in a team, I would want to submit code changes via a development branch PR that is reviewed and have approved by a code maintainer.
8. How would you prevent that?
You would setup branch protection rules inside your git that requires a code reviewer and/or a successful status check before merging any PRs. For Github, in the repo under >Settings >Branches, you can add "classic branch protection rules", specify protection for the "master" branch and choose additional settings.
9. If you made changes to the repository settings, then add it to your answers in the output.md file and merge.
As the only contributor to a personal project, I did not need to set branch protection rules up. But I could follow the steps above to add them.
10. Send the URL of the forked project in GitHub to your hiring manager.
