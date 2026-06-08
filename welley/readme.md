***Run Project*** /n
Open a terminal and navigate to the main folder (i.e. cd Desktop/projects/juice-shop-welley.) /n
Run `npm install` (only has to be done before first start) /n
Run `npm start` /n
Browse to <http://localhost:3000> /n

***Prepare to run Tests*** /n
Open a new terminal window and navigate to the `welley` folder (i.e. cd Desktop/projects/juice-shop-welley/welley.) /n
run ```npm i``` and then ```npm ci``` (first time only) /n
Check if playwright is installed ```npx playwright --version``` /n
If not installed, run 
```npm install -D @playwright/test@latest && npx playwright install --with-deps``` 

***Run Tests*** /n
In order to run your tests, open your terminal and run the script associated with your name. /n
i.e. ```npm run test:Moore``` /n
You can find the scripts in package.json.

***Reports*** /n
To see and inspect the results of your test run in detail, you can run the report after the test is finished. /n
```npm run test:report```
