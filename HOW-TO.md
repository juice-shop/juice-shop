# CS467 OWASP Juice Shop How-to Guide


## Injection Vulnerability - OWASP #3
#### Exploiting Injection via DOM XSS
###### By: Kuljot Biring

For this vulnerability it should be noted that Cross-site Scripting (XSS) is a vulnerability that allows an attacker to inject malicious scripts into web pages. They can be used to steal information. Hijack user sessions (cookies) and perform other nefarious actions.

Here we are going to inject a payload into the Document Object Model (DOM). Insecure client-side Javascript is allowing this XSS to take place.

Looking at the Juice Shop webpage, the area that stands out as a place to test any kind of injection or payload would be areas that allow user input. In our case this is the website's search bar.

Since we are just doing a proof of concept lets send a script that contains and alert. First, right click on the webpage and select inspect. This will open developers tools in a separate frame. In the search bar, we will enter: `<h1>Hacking is Cool</h1>`

Press enter. Notice how this shows up on the webpage search results? If we right click and inspect the text we put on the page, we can see it has been inserted into the code.

Now lets try inserting a bit of JavaScript. In the search bar enter the following and hit enter:

```
<iframe src="javascript:alert(`HERE IS AN XSS INJECTION - KULJOT BIRING`)">.
```

![Screenshot 2024-10-21 at 9 35 10 PM](https://github.com/user-attachments/assets/fbf4bd51-4678-4bb6-8cfc-2f8b5172a79c)

_Screen shot of payload in the search bar_


If we search for this string in the page inspector we entered, we can see our iframe has been injected into the code. Now imagine if this had been something much more malicious being injected into our code such as code to steal a user's cookies?


![Screenshot 2024-10-22 at 3 13 49 PM](https://github.com/user-attachments/assets/951dc834-48d5-4736-a597-f6d82de7a3fd)

_code inserted into DOM_

#### Remediating the Injection Vulnerability

OK, now that we know we can perform injection attacks via the search bar, we look to how we can remedy this. Let's find the code that deals with the search bar. After some digging we see that in the folder:

```
frontend > src > app > search-result
```
there is a file called `search-result.component.ts`. In this file we can see the following snippet of code which seems to be overriding Angular's built-in safeguards which would prevent an XSS attack.

![Screenshot 2024-10-21 at 9 35 37 PM](https://github.com/user-attachments/assets/9feb704f-dcf9-4500-97be-55f192bc17f8)

_image of insecure code_


The solution here is to remedy this code by not bypassing built-in security trusts in the first place.

![Screenshot 2024-10-21 at 9 35 55 PM](https://github.com/user-attachments/assets/10094bd5-cd40-4dd6-afdb-7684901f77b2)

_code fix_


#### Key Takeaways

XSS allows malicious code to be injected. Without sanitization and security checks, bad actors can perform a number of actions which can lead to various effects such as; running malicious scripts which can steal user information, cookies and run a wide variety of other nefarious code on your webpage. Here we are simply using a DOM XSS to trigger an alert as a proof of concept. However, as you can see, this vulnerability has a lot of potential for harm.

## Vulnerable and Outdated Components - OWASP #6
#### Exploiting Outdated Allowlist
###### By: Jason Gottlieb

For this vulnerability we will be looking at how outdated parts of a web application can be used as an attack vector. Often, websites will want to move users to another website to handle things such as donations or payments. Since developers want to ensure that users are only redirected to websites that are safe, they will ensure that only certain websites can be used as a redirect. The term for this collection of allowed URL's is an Allowlist. If an attacker tries to redirect a user through the site to a URL that they control, it won't work. 

This concept works well to protect users, but can unintentionally be used as an opportunity for scammers when the list is out of date. In this scenario, the Juice Shop has an outdated Allowlist that will let users be redirected to Cryptocurrency wallet sites. In the past, the Juice Shop used one of this wallets for a legitimate purpose, to collect payments from users. However, the Juice Shop has stopped using the wallet but left the URL's in the Allowlist. 

If an attacker was to discover that these URL's are in the Allowlist, they could generate their own wallet URL that is slightly different from the official Juice Shop one and present it to users. Since the URL would redirect through the Juice Shop site, it would be very hard for the average user to tell that this is a scam. Let's go over how an attacker might discover a vulnerable link.

First, right click on the webpage and select inspect. Navigate to the debugger tab and take a look at main.js. From there we can use CTRL-F to search for the string "redirect" until we come accross a URL that could be used as an attack vector.

![alt text](image.png)

_image of potentially vulnerable URL_


Here we find the following URL:
```
/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm
```

If we are to paste that into our search bar, we will be redirected to a Cryptocurrency wallet. While this by itself isn't an issue, the Juice Shop no longer uses these wallets to collect payments so we are just leaving an attack vector open with no benefit.

#### Remediating the Outdated Component Vulnerability

The easiest way to fix this vulnerability is to remove those URL's from the Allowlist. Inside the lib folder there is a file called `insecurity.ts` that handles the Allowlist.

![alt text](image-1.png)

_image of insecure code_

The solution is to remove any URL's that we don't want to  be redirected. Just comment out the appropriate URL's.

![alt text](image-2.png)

_code fix_

#### Key Takeaways

Allowlists are a powerful tool in controlling where users can be redirected. However, if they fall out of date they can become a serious vulnerability. Developers should strive to make sure that the URL's that are within their Allowlist are secure and can't be used for phishing scams. Additionally, Allowlists should be kept up to date. Developers should add checking their Allowlist to a regular maintenance schedule and frequently audit which URL's are contained within it.

## Cryptographic Failures vulnerability - OWASP #2
#### Exploiting Sensitive Data
###### By: Pontipe Kopkaew

For this vulnerability, we will exploit a confidential document. The goal is to find a hidden file containing sensitive information about potential hostile takeovers by management. By exploring various links within the application, we should be able to locate this unprotected file and access its contents.

To begin, we do not need any tools to exploit the vulnerability; instead, we should thoroughly explore the Juice Shop website, looking for links that might lead to embedded documents.

![alt text](image-3.png)

_screenshot of About Us Page_

There is a link on the "About Us" page that directs users to the terms of use, which leads to the URL: https://cs467-owasp-juice-shop-87450be9c684.herokuapp.com/ftp/legal.md. From this, we can deduce that the document is named legal.md and is located in the ftp directory, prompting us to investigate further.

![alt text](image-4.png)

_screenshot of the content of legal.md_

The next step is to navigate to the directory at https://cs467-owasp-juice-shop-87450be9c684.herokuapp.com/ftp to check its contents.

![alt text](image-5.png)

_screenshot of the content of the ftp directory_

Finally, if we examine the contents of the directory, we will discover that acquisitions.md is the file containing the sensitive data we are seeking.

![alt text](image-6.png)

_screenshot of the content of acquisitions.md_

#### Remediating Cryptographic Failures vulnerability

To address this issue, we should eliminate access to the directory listing of /ftp directory by commenting out the relevant code snippet in the server.ts file of the application. This code creates an endpoint that serves a directory listing of the ftp folder, which can be a potential security risk if not properly secured, as it could expose sensitive files to unauthorized users. By taking this action, we effectively resolve the data leak.

![alt text](image-7.png)

_screenshot of insecure code snippet from GitHub_

![alt text](image-8.png)

_screenshot of secure code snippet from code editor_

#### Key Takeaways

The key takeaway from this exploit is the importance for organizations to prioritize strong data protection measures to keep sensitive information safe. Protecting data is important not only for maintaining customer trust but also for complying with legal regulations and avoiding potential financial losses. Regularly reviewing and enhancing security practices is vital for reducing risks and ensuring that data is secure from potential threats.

## Broken Access Control Vulnerability - OWASP #1
#### Exploiting Broken Acess Controls via Forging another user's review
###### By: Kuljot Biring

In this vulnerability, I we will be taking advantage of broken access controls in OWASP Juice Shop. These vulnerabilities occur when an applicaiton does not properly restrict user permissions and allows unauthorized users to access or modify resources. This usually results from having inadequate authentication checks or failing to enfoce access controls at the applicaiton level. Attackers can take advantage of these weaknesses to access sensitive data or take unauthorized actions including but not limited to escalating priveledges. 

In investigating proper access controls for the Web Application, I noticed that a user can forge another user's review on the products page. 

To exploit this vulnerability we are going to need to have [Burp Suite](https://portswigger.net/burp/communitydownload) downloaded and installed. We are going to use this popular Web Security software to "catch" requests we make to the website on the fly (as we send them over).

We open up the Burp Suite application and just accept the default settings and make a Temporary Project in Memory option with the default settings, and then click Start Burp.

In the tabs on the top of the application select Proxy and on that screen slide the toggle for Intercept to be in the ON position. Now click the open browser button which will launch a web browser. Note: you will have to click forward as the GET (or other HTTP request) are getting processed for the page to load and to move forward with your actions.

![Bupr Proxy](image-burpproxy.png)
_screenshot of Bupr Proxy Tab_

In this browser we want to navigate to [OWASP Juice Shop](https://juice-shop.herokuapp.com/#/search) and click Account in the top right. We want to create a new user via the ```Not yet a cutomer?``` link.

![Create Account](image-creatingaccount.png)
_screenshot of creating a new account_

Once we have created a new user, go ahead and log in as the user you just created. On the main page of the website, we can take a look at the Apple Juice product. We can see that there is a review there currently when we click on the product:

![Juice comment](image-juicecomment.png)
_screenshot of comment on Apple Juice product_

Let's leave one of our own comments on the product. Now, in Burp Suite we see our PATCH appear. Before we press forward let's take a closer look at the request. At the very bottom of the Request window in Burp Suite we can see our email that is submitting the review listed as author as well as the message for we had written for the review.

![Burp Request](image-burprequest.png)
_screenshot of PUT request in Burp Suite_

Go ahead and forward this request. We see that our review shows up as expected. No surprise here. 

![New Review](image-newreview.png)
_screenshot of our new review_

Since we are able to intercept and examine the request before it's sent through, let us test if there is any authentication in the method that handles this. Let's craft a new review that says ```This is filled with poison```. However, before we forward the request in Burp Suite let's change the author. We saw that the first review was left by admin@juice-sh.op. We know this is a valid authenticated user (since they are able to leave comments), so let's use this as the author in the request instead of our own cs467@gmail.com. See below:


![Editing Author](image-editauthor.png)
_screenshot of editing author in new review PUT request_

Forward the request. Look at what happened! A new review is left with the admin of juice shop saying the product is filled with poison. We were able to forge a comment as the Juice Shop admin!

![Forged Review](image-forgedreview.png)
_screenshot of forged admin review_

What happened here? I seems as though there is a seriously flaw in the way that authentication and authorization are handled on the web app. The application is not checking that the person logged in is only able to leave reviews as themselves. There is definately a Broken Acccess Control vulnerability in the web application.


#### Remediating the Broken Access Control Vulnerability

Now that we have exploited the vulnerability, let's remediate it to patch this security issue. Looking through the code we can see that the file ```updateProductReviews.ts``` appears to be handling the review functionality of the web site. Taking a deeper look at the source code, we can see that it processes incoming request to update a review, checks for the authentication of the user and then updates the review message in the database if the user is authorized to do so. The vulnerable code is here:


![Vulnerable Code](image-vulnerablecode.png)
_screenshot of vulnerable code_

The issues with this code are; the code does not check whether the authenticated user is the actual author the the review (as we demonstrated any user can author a review for another user). The lines of code allowing this are below:

```
const user = security.authenticatedUsers.from(req) // vuln-code-snippet vuln-line forgedReviewChallenge
    db.reviewsCollection.update( // vuln-code-snippet neutral-line forgedReviewChallenge
      { _id: req.body.id }, // vuln-code-snippet vuln-line noSqlReviewsChallenge forgedReviewChallenge
      { $set: { message: req.body.message } }
```

To remedy this issue, we are going to do an authentication check before that snippet of code:

```
if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
```

We also add code to ensure that before directly updating the review there is appropriate ownership via:
```
// Only allow message update, do not allow author to be changed
const updateData = { $set: { message: req.body.message } }; 

// at this point OK to update review
return db.reviewsCollection.update( // vuln-code-snippet neutral-line forgedReviewChallenge
    { _id: reviewId }, // vuln-code-snippet vuln-line noSqlReviewsChallenge forgedReviewChallenge
    updateData
```

In the same vein we need to check the authorization of the author using:

```
if (!review || typeof review.author !== 'string' || review.author !== user.data.email) {
          // user is not authorized to edit review
          return res.status(403).json({ error: 'Forbidden' });
        }
```

This ensure that only the user who originally posted a review can modify it. Now we have handled Authentication and Authorization of Access Controls.

The line of code ```{ multi: true }``` raises the possiblilty of an SQL injection as it does not allow assurance that only one document is updated. A malicious user could craft a request body with an SQL command that would cause the database to update multiple reviews.

To remedy this we are going to remove this line from the code.

Additionally the database operation is using ```result.original``` without any sanitization. If this becomes undefined or malformed the logic could break as there is no checking as to the integrity of the response from the database query.

To remedy this, we are going to add checking to see if the ```result.original``` exists and whether it has any elements. If it's null or empty, the DB likely didn't return expected data - we can handle that gracefully with an error.

```
if (!result.original || result.original.length === 0) {
            return res.status(500).json({ error: 'Failed to retrieve the original review' });
          }
```

Lastly, the error handling in the code uses a generic ```500`` response for all errors which would not provide enough context or detail about the issue that occurred. An error message with more context (i.e database errors, authorization errors etc) woudl be more beneficial. We update the error block as follows:

```
.catch((err: Error) => {
      // Handle other potential errors like connection issues
      console.error('Error fetching review:', err);
      res.status(500).json({ error: 'Failed to fetch review' });
    });
```

#### Key Takeaways

Broken Access Controls allows individuals to peform actions for which they should not be authorized. In our example, we used broken access controls to forge reviews on products. This proof of concepts highlights the need to have proper controls in place which strictly control Authentication - verifying the entity is who they claim to be, Authorization - allowing the entity to perform only actions that have been specifically granted to them, and Accounting - keeping track of the entity's actions. Without these measures in place, a malicious actor can bypass safeguards and perform a plethora of nefarious actions.