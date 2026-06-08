***Run Project*** 

Open a terminal and navigate to the main folder (i.e. cd Desktop/projects/juice-shop-welley.) 

Run `npm install` (only has to be done before first start) 

Run `npm start` 

Browse to <http://localhost:3000> 


***Prepare to run Tests*** /n
Open a new terminal window and navigate to the `welley` folder (i.e. cd Desktop/projects/juice-shop-welley/welley.)

run ```npm i``` and then ```npm ci``` (first time only)

Check if playwright is installed ```npx playwright --version```

If not installed, run 
```npm install -D @playwright/test@latest && npx playwright install --with-deps``` 


***Run Tests***

In order to run your tests, open your terminal and run the script associated with your name.

i.e. ```npm run test:Moore```

You can find the scripts in package.json.


***Reports***

To see and inspect the results of your test run in detail, you can run the report after the test is finished.

```npm run test:report```
