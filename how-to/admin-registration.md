# Admin Registration
## How to execute

Install requirements with `pip install -r requirements.txt`

Execute script `python/exploits/forge_admin_account.py [site url]`
- Copy the site's base url, e.g. `https://not-juice-shop.com`, including `https://` but minus additional slashes and subdirectories.

Use the printed credentials to log into your new admin account

If... 
- ...the exploit succeeds, you will see the console statement "Success!"
- ...the app is hardened against this attack, you will see the console statement: "App invulnerable to this attack!"

To see what you can do with your credentials, follow the [Admin Route How-to](admin-route.md).

## Why does this work?
When registering a new account via Juice Shop's web interface, 
inspecting the HTTP response reveals a user property called `role`, 
which is automatically assigned on account creation to `"customer"`.

Node.js allows mass assignment, which enables HTTP request parameters 
to be automatically assigned to program variables by matching names. The 
parameters submitted via Juice Shop's registration form are assigned to user 
properties in this manner, and the same can be done with the `role` parameter.

The `forge_admin_account` script fabricates a user registration request 
with `role` set to `"admin"`, and sends the request to the registration 
endpoint. For unhardened versions of the application, this creates a new 
admin account.

## How to patch the vulnerability
When a new object is created serverside, it must explicitly assign those properties which a user should not be able to access and manipulate. In this case, the fix was applied by immediately assigning the newly registered user's `role` property to `"customer"` in `server.ts`. Previously this assignment was absent, and `role` was set via a hidden default in the HTTP interface.