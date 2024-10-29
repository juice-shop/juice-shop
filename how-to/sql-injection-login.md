# SQL Injection - Login
## How To (Vulnerable Website)
1. Go to vulnerable website
2. Go to login page

    ![sql-injection-login-location.png](..%2Fhow-to-images%2Fsql-injection-login-location.png)

3. Enter `' or 1=1--` for the email and `password` for the password

    ![sql-injection-login-credentials.png](..%2Fhow-to-images%2Fsql-injection-login-credentials.png)

4. Click "login"
5. Verify access as admin by clicking on "Account" in the header and ensure logged in as "admin@juice-shop.op"

    ![sql-injection-admin-login-success.png](..%2Fhow-to-images%2Fsql-injection-admin-login-success.png)

## How To (Secured Website)
1. Go to secured website
2. Go to login page

   ![sql-injection-login-location.png](..%2Fhow-to-images%2Fsql-injection-login-location.png)

3. Enter `' or 1=1--` for the email and `password` for the password

   ![sql-injection-login-credentials.png](..%2Fhow-to-images%2Fsql-injection-login-credentials.png)

4. Click "login"
5. Verify failed login:

    ![sql-injection-login-failed.png](..%2Fhow-to-images%2Fsql-injection-login-failed.png)


## Mitigations
**Use of Prepared Statements:** Use prepared statements with parameterized queries to prevent SQL injection.
This technique is where the database pre-compiles SQL code and stores the results, separating it from data.

## Root cause
The root cause of the issue is that raw SQL is being used in the login api (routes/login.ts)
```
SELECT * FROM Users WHERE email = '${req.body.email || ''}' AND password = '${security.hash(req.body.password || '')}' 
AND deletedAt IS NULL`, { model: UserModel, plain: true })
```


Authored by: Elizabeth Mayer
