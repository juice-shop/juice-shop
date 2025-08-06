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
If I am the only contributor/owner, I can merge directly into the master/main. But if I am working in a team, I would want to submit code changes via a development branch PR that is reviewed and approved by a code maintainer.
8. How would you prevent that?
You would setup branch protection rules inside your Git that requires a code reviewer to approve any PRs.
9. If you made changes to the repository settings, then add it to your answers in the output.md file and merge.
As the only contributor, I did not need to set branch protection rules up.
10. Send the URL of the forked project in GitHub to your hiring manager.
test

