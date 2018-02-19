/* jslint node: true */
const models = require('../models/index')
const datacache = require('./datacache')
const config = require('config')
const utils = require('../lib/utils')
const mongodb = require('./mongodb')
const challenges = datacache.challenges
const users = datacache.users
const products = datacache.products

module.exports = () => {
  // TODO Wrap entire datacreator into promise to avoid race condition with websocket registration for progress restore
  createChallenges()
  createUsers()
  createRandomFakeUsers()
  createProducts()
  createBaskets()
  createFeedback()
  createComplaints()
  createRecycles()
  createSecurityQuestions()
  createSecurityAnswers()
}

function createChallenges () {
  const addHint = hint => config.get('application.showChallengeHints') ? hint : null

  models.Challenge.create({
    name: 'Score Board',
    category: 'Information Leakage',
    description: 'Find the carefully hidden \'Score Board\' page.',
    difficulty: 1,
    hint: addHint('Try to find a reference or clue behind the scenes. Or simply guess what URL the Score Board might have.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/score-board.html#find-the-carefully-hidden-score-board-page'),
    solved: false
  }).then(challenge => {
    challenges.scoreBoardChallenge = challenge
  })
  models.Challenge.create({
    name: 'Error Handling',
    category: 'Information Leakage',
    description: 'Provoke an error that is not very gracefully handled.',
    difficulty: 1,
    hint: addHint('Try to submit bad input to forms. Alternatively tamper with URL paths or parameters.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/leakage.html#provoke-an-error-that-is-not-very-gracefully-handled'),
    solved: false
  }).then(challenge => {
    challenges.errorHandlingChallenge = challenge
  })
  models.Challenge.create({
    name: 'Login Admin',
    category: 'SQL Injection',
    description: 'Log in with the administrator\'s user account.',
    difficulty: 2,
    hint: addHint('Try different SQL Injection attack patterns depending whether you know the admin\'s email address or not.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/sqli.html#log-in-with-the-administrators-user-account'),
    solved: false
  }).then(challenge => {
    challenges.loginAdminChallenge = challenge
  })
  models.Challenge.create({
    name: 'Login Jim',
    category: 'SQL Injection',
    description: 'Log in with Jim\'s user account.',
    difficulty: 3,
    hint: addHint('Try cracking Jim\'s password hash if you harvested it already. Alternatively, if you know Jim\'s email address, try SQL Injection.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/sqli.html#log-in-with-jims-user-account'),
    solved: false
  }).then(challenge => {
    challenges.loginJimChallenge = challenge
  })
  models.Challenge.create({
    name: 'Login Bender',
    category: 'SQL Injection',
    description: 'Log in with Bender\'s user account.',
    difficulty: 3,
    hint: addHint('If you know Bender\'s email address, try SQL Injection. Bender\'s password hash might not help you very much.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/sqli.html#log-in-with-benders-user-account'),
    solved: false
  }).then(challenge => {
    challenges.loginBenderChallenge = challenge
  })
  models.Challenge.create({
    name: 'XSS Tier 1',
    category: 'XSS',
    description: 'Perform a <i>reflected</i> XSS attack with <code>&lt;script&gt;alert("XSS")&lt;/script&gt;</code>.',
    difficulty: 1,
    hint: addHint('Look for an input field where its content appears in the response HTML when its form is submitted.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/xss.html#perform-a-reflected-xss-attack'),
    solved: false
  }).then(challenge => {
    challenges.localXssChallenge = challenge
  })
  models.Challenge.create({
    name: 'XSS Tier 2',
    category: 'XSS',
    description: 'Perform a <i>persisted</i> XSS attack with <code>&lt;script&gt;alert("XSS")&lt;/script&gt;</code> bypassing a <i>client-side</i> security mechanism.',
    difficulty: 3,
    hint: addHint('Only some input fields validate their input. Even less of these are persisted in a way where their content is shown on another screen.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/xss.html#perform-a-persisted-xss-attack-bypassing-a-client-side-security-mechanism'),
    solved: false
  }).then(challenge => {
    challenges.persistedXssChallengeUser = challenge
  })
  models.Challenge.create({
    name: 'XSS Tier 4',
    category: 'XSS',
    description: 'Perform a <i>persisted</i> XSS attack with <code>&lt;script&gt;alert("XSS")&lt;/script&gt;</code> bypassing a <i>server-side</i> security mechanism.',
    difficulty: 4,
    hint: addHint('The "Comment" field in the "Contact Us" screen is where you want to put your focus on.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/xss.html#perform-a-persisted-xss-attack-bypassing-a-server-side-security-mechanism'),
    solved: false
  }).then(challenge => {
    challenges.persistedXssChallengeFeedback = challenge
  })
  models.Challenge.create({
    name: 'XSS Tier 3',
    category: 'XSS',
    description: 'Perform a <i>persisted</i> XSS attack with <code>&lt;script&gt;alert("XSS")&lt;/script&gt;</code> without using the frontend application at all.',
    difficulty: 3,
    hint: addHint('You need to work with the server-side API directly. Try different HTTP verbs on different entities exposed through the API.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/xss.html#perform-a-persisted-xss-attack-without-using-the-frontend-application-at-all'),
    solved: false
  }).then(challenge => {
    challenges.restfulXssChallenge = challenge
  })
  models.Challenge.create({
    name: 'User Credentials',
    category: 'SQL Injection',
    description: 'Retrieve a list of all user credentials via SQL Injection',
    difficulty: 4,
    hint: addHint('Craft a UNION SELECT attack string against a page where you can influence the data being displayed.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/sqli.html#retrieve-a-list-of-all-user-credentials-via-sql-injection'),
    solved: false
  }).then(challenge => {
    challenges.unionSqlInjectionChallenge = challenge
  })
  models.Challenge.create({
    name: 'Password Strength',
    category: 'Weak Security Mechanisms',
    description: 'Log in with the administrator\'s user credentials without previously changing them or applying SQL Injection.',
    difficulty: 2,
    hint: addHint('This one should be equally easy to a) brute force, b) crack the password hash or c) simply guess.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/weak-security.html#log-in-with-the-administrators-user-credentials-without-previously-changing-them-or-applying-sql-injection'),
    solved: false
  }).then(challenge => {
    challenges.weakPasswordChallenge = challenge
  })
  models.Challenge.create({
    name: 'Five-Star Feedback',
    category: 'Privilege Escalation',
    description: 'Get rid of all 5-star customer feedback.',
    difficulty: 2,
    hint: addHint('Once you found admin section of the application, this challenge is almost trivial.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/privilege-escalation.html#get-rid-of-all-5-star-customer-feedback'),
    solved: false
  }).then(challenge => {
    challenges.feedbackChallenge = challenge
  })
  models.Challenge.create({
    name: 'Forged Feedback',
    category: 'Privilege Escalation',
    description: 'Post some feedback in another users name.',
    difficulty: 3,
    hint: addHint('You can solve this by tampering with the user interface or by intercepting the communication with the RESTful backend.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/privilege-escalation.html#post-some-feedback-in-another-users-name'),
    solved: false
  }).then(challenge => {
    challenges.forgedFeedbackChallenge = challenge
  })
  models.Challenge.create({
    name: 'Redirects Tier 1',
    category: 'Forgotten Content',
    description: 'Let us redirect you to a donation site that went out of business.',
    difficulty: 1,
    hint: addHint('We might have failed to take this out of our code properly.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#let-us-redirect-you-to-a-donation-site-that-went-out-of-business'),
    solved: false
  }).then(challenge => {
    challenges.redirectGratipayChallenge = challenge
  })
  models.Challenge.create({
    name: 'Redirects Tier 2',
    category: 'Weak Security Mechanisms',
    description: 'Wherever you go, there you are.',
    difficulty: 4,
    hint: addHint('You have to find a way to beat the whitelist of allowed redirect URLs.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/weak-security.html#wherever-you-go-there-you-are'),
    solved: false
  }).then(challenge => {
    challenges.redirectChallenge = challenge
  })
  models.Challenge.create({
    name: 'Basket Access',
    category: 'Privilege Escalation',
    description: 'Access someone else\'s basket.',
    difficulty: 2,
    hint: addHint('Have an eye on the HTTP traffic while shopping. Alternatively try to find s client-side association of users to their basket.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/privilege-escalation.html#access-someone-elses-basket'),
    solved: false
  }).then(challenge => {
    challenges.basketChallenge = challenge
  })
  models.Challenge.create({
    name: 'Payback Time',
    category: 'Validation Flaws',
    description: 'Place an order that makes you rich.',
    difficulty: 3,
    hint: addHint('You literally need to make the shop owe you any amount of money.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/validation.html#place-an-order-that-makes-you-rich'),
    solved: false
  }).then(challenge => {
    challenges.negativeOrderChallenge = challenge
  })
  models.Challenge.create({
    name: 'Confidential Document',
    category: 'Forgotten Content',
    description: 'Access a confidential document.',
    difficulty: 1,
    hint: addHint('Analyze and tamper with links in the application that deliver a file directly.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#access-a-confidential-document'),
    solved: false
  }).then(challenge => {
    challenges.directoryListingChallenge = challenge
  })
  models.Challenge.create({
    name: 'Forgotten Developer Backup',
    category: 'Forgotten Content',
    description: 'Access a developer\'s forgotten backup file.',
    difficulty: 4,
    hint: addHint('You need to trick a security mechanism into thinking that the file you want has a valid file type.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#access-a-developers-forgotten-backup-file'),
    solved: false
  }).then(challenge => {
    challenges.forgottenDevBackupChallenge = challenge
  })
  models.Challenge.create({
    name: 'Forgotten Sales Backup',
    category: 'Forgotten Content',
    description: 'Access a salesman\'s forgotten backup file.',
    difficulty: 3,
    hint: addHint('You need to trick a security mechanism into thinking that the file you want has a valid file type.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#access-a-salesmans-forgotten-backup-file'),
    solved: false
  }).then(challenge => {
    challenges.forgottenBackupChallenge = challenge
  })
  models.Challenge.create({
    name: 'Admin Section',
    category: 'Privilege Escalation',
    description: 'Access the administration section of the store.',
    difficulty: 1,
    hint: addHint('It is just slightly harder to find than the score board link.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/privilege-escalation.html#access-the-administration-section-of-the-store'),
    solved: false
  }).then(challenge => {
    challenges.adminSectionChallenge = challenge
  })
  models.Challenge.create({
    name: 'CSRF',
    category: 'CSRF',
    description: 'Change Bender\'s password into <i>slurmCl4ssic</i> without using SQL Injection.',
    difficulty: 4,
    hint: addHint('The fact that this challenge is in the CSRF category is already a huge hint.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/csrf.html#change-benders-password-into-slurmcl4ssic-without-using-sql-injection'),
    solved: false
  }).then(challenge => {
    challenges.csrfChallenge = challenge
  })
  models.Challenge.create({
    name: 'Product Tampering',
    category: 'Privilege Escalation',
    difficulty: 3,
    hint: addHint('Look for one of the following: a) broken admin functionality, b) holes in RESTful API or c) possibility for SQL Injection.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/privilege-escalation.html#change-the-href-of-the-link-within-the-o-saft-product-description'),
    solved: false
  }).then(challenge => {
    challenges.changeProductChallenge = challenge

    for (const product of config.get('products')) {
      if (product.urlForProductTamperingChallenge) {
        models.sequelize.query('UPDATE Challenges SET description = \'Change the <code>href</code> of the link within the <a href="/#/search?q=' + product.name + '">' + product.name + '</a> product description into <i>http://kimminich.de</i>.\' WHERE id = ' + challenge.id)
        break
      }
    }
  })
  models.Challenge.create({
    name: 'Vulnerable Library',
    category: 'Vulnerable Component',
    description: '<a href="/#/contact">Inform the shop</a> about a vulnerable library it is using. (Mention the exact library name and version in your comment)',
    difficulty: 4,
    hint: addHint('Report one of two possible answers via the "Contact Us" form. Do not forget to submit the library\'s version as well.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/vulnerable-components.html#inform-the-shop-about-a-vulnerable-library-it-is-using'),
    solved: false
  }).then(challenge => {
    challenges.knownVulnerableComponentChallenge = challenge
  })
  models.Challenge.create({
    name: 'Weird Crypto',
    category: 'Cryptographic Issues',
    description: '<a href="/#/contact">Inform the shop</a> about an algorithm or library it should definitely not use the way it does.',
    difficulty: 2,
    hint: addHint('Report one of four possible answers via the "Contact Us" form.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/crypto.html#inform-the-shop-about-an-algorithm-or-library-it-should-definitely-not-use-the-way-it-does'),
    solved: false
  }).then(challenge => {
    challenges.weirdCryptoChallenge = challenge
  })
  models.Challenge.create({
    name: 'Easter Egg Tier 1',
    category: 'Forgotten Content',
    description: 'Find the hidden <a href="http://en.wikipedia.org/wiki/Easter_egg_(media)" target="_blank">easter egg</a>.',
    difficulty: 4,
    hint: addHint('If you solved one of the three file access challenges, you already know where to find the easter egg.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#find-the-hidden-easter-egg'),
    solved: false
  }).then(challenge => {
    challenges.easterEggLevelOneChallenge = challenge
  })
  models.Challenge.create({
    name: 'Easter Egg Tier 2',
    category: 'Cryptographic Issues',
    description: 'Apply some advanced cryptanalysis to find <i>the real</i> easter egg.',
    difficulty: 4,
    hint: addHint('You might have to peel through several layers of tough-as-nails encryption for this challenge.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/crypto.html#apply-some-advanced-cryptanalysis-to-find-the-real-easter-egg'),
    solved: false
  }).then(challenge => {
    challenges.easterEggLevelTwoChallenge = challenge
  })
  models.Challenge.create({
    name: 'Forged Coupon',
    category: 'Cryptographic Issues',
    description: 'Forge a coupon code that gives you a discount of at least 80%.',
    difficulty: 6,
    hint: addHint('Try either a) a knowledgable brute force attack or b) reverse engineering.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/crypto.html#forge-a-coupon-code-that-gives-you-a-discount-of-at-least-80'),
    solved: false
  }).then(challenge => {
    challenges.forgedCouponChallenge = challenge
  })
  models.Challenge.create({
    name: 'Eye Candy',
    category: 'Forgotten Content',
    description: 'Travel back in time to the golden era of <img src="/css/geo-bootstrap/img/hot.gif"> web design.',
    difficulty: 4,
    hint: addHint('The mentioned golden era lasted from 1994 to 2009.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#travel-back-in-time-to-the-golden-era-of-web-design'),
    solved: false
  }).then(challenge => {
    challenges.geocitiesThemeChallenge = challenge
  })
  models.Challenge.create({
    name: 'Christmas Special',
    category: 'SQL Injection',
    description: 'Order the Christmas special offer of 2014.',
    difficulty: 2,
    hint: addHint('Find out how the application handles unavailable products.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/sqli.html#order-the-christmas-special-offer-of-2014'),
    solved: false
  }).then(challenge => {
    challenges.christmasSpecialChallenge = challenge
  })
  models.Challenge.create({
    name: 'Upload Size',
    category: 'Validation Flaws',
    description: 'Upload a file larger than 100 kB.',
    difficulty: 3,
    hint: addHint('You can attach a small file to the "File Complaint" form. Investigate how this upload actually works.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/validation.html#upload-a-file-larger-than-100-kb'),
    solved: false
  }).then(challenge => {
    challenges.uploadSizeChallenge = challenge
  })
  models.Challenge.create({
    name: 'Upload Type',
    category: 'Validation Flaws',
    description: 'Upload a file that has no .pdf extension.',
    difficulty: 3,
    hint: addHint('You can attach a PDF file to the "File Complaint" form. Investigate how this upload actually works.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/validation.html#upload-a-file-that-has-no-pdf-extension'),
    solved: false
  }).then(challenge => {
    challenges.uploadTypeChallenge = challenge
  })
  models.Challenge.create({
    name: 'Extra Language',
    category: 'Forgotten Content',
    description: 'Retrieve the language file that never made it into production.',
    difficulty: 5,
    hint: addHint('Brute force is not the only option for this challenge, but a perfectly viable one.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#retrieve-the-language-file-that-never-made-it-into-production'),
    solved: false
  }).then(challenge => {
    challenges.extraLanguageChallenge = challenge
  })
  models.Challenge.create({
    name: 'Zero Stars',
    category: 'Validation Flaws',
    description: 'Give a devastating zero-star feedback to the store.',
    difficulty: 1,
    hint: addHint('Before you invest time bypassing the API, you might want to play around with the UI a bit.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/validation.html#give-a-devastating-zero-star-feedback-to-the-store'),
    solved: false
  }).then(challenge => {
    challenges.zeroStarsChallenge = challenge
  })
  models.Challenge.create({
    name: 'Imaginary Challenge',
    category: 'Cryptographic Issues',
    description: 'Solve challenge #99. Unfortunately, this challenge does not exist.',
    difficulty: 6,
    hint: addHint('You need to trick the hacking progress persistence feature into thinking you solved challenge #99.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/crypto.html#solve-challenge-99'),
    solved: false
  }).then(challenge => {
    challenges.continueCodeChallenge = challenge
  })
  models.Challenge.create({
    name: 'Login Bjoern',
    category: 'Weak Security Mechanisms',
    description: 'Log in with Bjoern\'s user account <i>without</i> previously changing his password, applying SQL Injection, or hacking his Google account.',
    difficulty: 4,
    hint: addHint('The security flaw behind this challenge is 100% Juice Shop\'s fault and 0% Google\'s.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/weak-security.html#log-in-with-bjoerns-user-account'),
    solved: false
  }).then(challenge => {
    challenges.oauthUserPasswordChallenge = challenge
  })
  models.Challenge.create({
    name: 'Login CISO',
    category: 'Weak Security Mechanisms',
    description: 'Exploit OAuth 2.0 to log in with the Chief Information Security Officer\'s user account.',
    difficulty: 5,
    hint: addHint('Don\'t try to beat Google\'s OAuth 2.0 service. Rather investigate implementation flaws on Juice Shop\'s end.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/weak-security.html#exploit-oauth-20-to-log-in-with-the-cisos-user-account'),
    solved: false
  }).then(challenge => {
    challenges.loginCisoChallenge = challenge
  })
  models.Challenge.create({
    name: 'Login Support Team',
    category: 'Weak Security Mechanisms',
    description: 'Log in with the support team\'s original user credentials without applying SQL Injection or any other bypass.',
    difficulty: 6,
    hint: addHint('The underlying flaw of this challenge is a lot more human error than technical weakness.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/weak-security.html#log-in-with-the-support-teams-original-user-credentials'),
    solved: false
  }).then(challenge => {
    challenges.loginSupportChallenge = challenge
  })
  models.Challenge.create({
    name: 'Login MC SafeSearch',
    category: 'Weak Security Mechanisms',
    description: 'Log in with MC SafeSearch\'s original user credentials without applying SQL Injection or any other bypass.',
    difficulty: 2,
    hint: addHint('You should listen to MC\'s hit song "Protect Ya Passwordz".'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/weak-security.html#log-in-with-mc-safesearchs-original-user-credentials'),
    solved: false
  }).then(challenge => {
    challenges.loginRapperChallenge = challenge
  })
  models.Challenge.create({
    name: 'Premium Paywall',
    category: 'Cryptographic Issues',
    description: '<i class="far fa-gem"></i><i class="far fa-gem"></i><i class="far fa-gem"></i><i class="far fa-gem"></i><i class="far fa-gem"></i><!--IvLuRfBJYlmStf9XfL6ckJFngyd9LfV1JaaN/KRTPQPidTuJ7FR+D/nkWJUF+0xUF07CeCeqYfxq+OJVVa0gNbqgYkUNvn//UbE7e95C+6e+7GtdpqJ8mqm4WcPvUGIUxmGLTTAC2+G9UuFCD1DUjg==--> <a href="/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm" target="_blank" class="btn btn-danger btn-xs"><i class="fab fa-btc fa-sm"></i> Unlock Premium Challenge</a> to access exclusive content.',
    difficulty: 6,
    hint: addHint('You do not have to pay anything to unlock this challenge! Nonetheless, donations are very much appreciated.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/crypto.html#unlock-premium-challenge-to-access-exclusive-content'),
    solved: false
  }).then(challenge => {
    challenges.premiumPaywallChallenge = challenge
  })
  models.Challenge.create({
    name: 'Reset Jim\'s Password',
    category: 'Sensitive Data Exposure',
    description: 'Reset Jim\'s password via the <a href="/#/forgot-password">Forgot Password</a> mechanism with <i>the original answer</i> to his security question.',
    difficulty: 3,
    hint: addHint('It\'s hard for celebrities to pick a security question from a hard-coded list where the answer is not publicly exposed.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/sensitive-data.html#reset-jims-password-via-the-forgot-password-mechanism'),
    solved: false
  }).then(challenge => {
    challenges.resetPasswordJimChallenge = challenge
  })
  models.Challenge.create({
    name: 'Reset Bender\'s Password',
    category: 'Sensitive Data Exposure',
    description: 'Reset Bender\'s password via the <a href="/#/forgot-password">Forgot Password</a> mechanism with <i>the original answer</i> to his security question.',
    difficulty: 4,
    hint: addHint('Not as trivial as Jim\'s but still not too difficult with some "Futurama" background knowledge.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/sensitive-data.html#reset-benders-password-via-the-forgot-password-mechanism'),
    solved: false
  }).then(challenge => {
    challenges.resetPasswordBenderChallenge = challenge
  })
  models.Challenge.create({
    name: 'Reset Morty\'s Password',
    category: 'Brute Force',
    description: 'Reset Morty\'s password via the <a href="/#/forgot-password">Forgot Password</a> mechanism by bruteforcing the original answer to his security question.',
    difficulty: 5,
    hint: addHint('Find a way to bypass Rate Limiting and write a script to bruteforce the answer to Morty\'s security question.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/brute-force.html#reset-mortys-password-via-the-forgot-password-mechanism'),
    solved: false
  }).then(challenge => {
    challenges.resetPasswordMortyChallenge = challenge
  })
  models.Challenge.create({
    name: 'Reset Bjoern\'s Password',
    category: 'Sensitive Data Exposure',
    description: 'Reset Bjoern\'s password via the <a href="/#/forgot-password">Forgot Password</a> mechanism with <i>the original answer</i> to his security question.',
    difficulty: 5,
    hint: addHint('Nothing a little bit of Facebook stalking couldn\'t reveal. Might involve a historical twist.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/sensitive-data.html#reset-bjoerns-password-via-the-forgot-password-mechanism'),
    solved: false
  }).then(challenge => {
    challenges.resetPasswordBjoernChallenge = challenge
  })
  models.Challenge.create({
    name: 'NoSQL Injection Tier 1',
    category: 'NoSQL Injection',
    description: 'Let the server sleep for some time. (It has done more than enough hard work for you)',
    hint: addHint('This challenge is essentially a stripped-down Denial of Service (DoS) attack.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/nosqli.html#let-the-server-sleep-for-some-time'),
    difficulty: 4,
    solved: false
  }).then(challenge => {
    challenges.noSqlCommandChallenge = challenge
  })
  models.Challenge.create({
    name: 'NoSQL Injection Tier 2',
    category: 'NoSQL Injection',
    description: 'Update multiple product reviews at the same time.',
    hint: addHint('Take a close look on how the equivalent of UPDATE-statements in MongoDB work.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/nosqli.html#update-multiple-product-reviews-at-the-same-time'),
    difficulty: 4,
    solved: false
  }).then(challenge => {
    challenges.noSqlInjectionChallenge = challenge
  })
  models.Challenge.create({
    name: 'Retrieve Blueprint',
    category: 'Forgotten Content',
    description: 'Deprive the shop of earnings by downloading the blueprint for one of its products.',
    difficulty: 5,
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#deprive-the-shop-of-earnings-by-downloading-the-blueprint-for-one-of-its-products'),
    solved: false
  }).then(challenge => {
    challenges.retrieveBlueprintChallenge = challenge

    for (const product of config.get('products')) {
      if (product.fileForRetrieveBlueprintChallenge) {
        models.sequelize.query('UPDATE Challenges SET hint = \'The product you might want to give a closer look is the ' + product.name + '.\' WHERE id = ' + challenge.id)
        break
      }
    }
  })
  models.Challenge.create({
    name: 'Typosquatting Tier 1',
    category: 'Vulnerable Component',
    description: '<a href="/#/contact">Inform the shop</a> about a <i>typosquatting</i> trick it has become victim of. (Mention the exact name of the culprit)',
    difficulty: 4,
    hint: addHint('This challenge has nothing to do with URLs or domains. Investigate the forgotten developer\'s backup file instead.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/vulnerable-components.html#inform-the-shop-about-a-typosquatting-trick-it-has-become-victim-of'),
    solved: false
  }).then(challenge => {
    challenges.typosquattingNpmChallenge = challenge
  })
  models.Challenge.create({
    name: 'Typosquatting Tier 2',
    category: 'Vulnerable Component',
    description: '<a href="/#/contact">Inform the shop</a> about a more literal instance of <i>typosquatting</i> it fell for. (Mention the exact name of the culprit)',
    difficulty: 5,
    hint: addHint('This challenge has nothing to do with URLs or domains. It literally exploits a potentially common typo.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/vulnerable-components.html#inform-the-shop-about-a-more-literal-instance-of-typosquatting-it-fell-for'),
    solved: false
  }).then(challenge => {
    challenges.typosquattingBowerChallenge = challenge
  })
  models.Challenge.create({
    name: 'JWT Issues Tier 1',
    category: 'Weak Security Mechanism',
    description: 'Forge an essentially unsigned JWT token that impersonates the (non-existing) user <i>jwtn3d@juice-sh.op</i>.',
    difficulty: 5,
    hint: addHint('This challenge exploits a weird option that is supported when signing tokens with JWT.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/weak-security.html#forge-an-essentially-unsigned-jwt-token'),
    solved: false
  }).then(challenge => {
    challenges.jwtTier1Challenge = challenge
  })
  models.Challenge.create({
    name: 'JWT Issues Tier 2',
    category: 'Weak Security Mechanism',
    description: 'Forge an almost properly RSA-signed JWT token that impersonates the (non-existing) user <i>rsa_lord@juice-sh.op</i>.',
    difficulty: 6,
    hint: addHint('This challenge is explicitly not about acquiring the RSA private key used for JWT signing.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/weak-security.html#forge-an-almost-properly-rsa-signed-jwt-token'),
    solved: false
  }).then(challenge => {
    challenges.jwtTier2Challenge = challenge
  })
  models.Challenge.create({
    name: 'Misplaced Signature File',
    category: 'Forgotten Content',
    description: 'Access a misplaced <a href="https://github.com/Neo23x0/sigma">SIEM signature</a> file.',
    difficulty: 4,
    hint: addHint('You need to trick a security mechanism into thinking that the file you want has a valid file type.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#access-a-misplaced-siem-signature-file'),
    solved: false
  }).then(challenge => {
    challenges.misplacedSignatureFileChallenge = challenge
  })
  models.Challenge.create({
    name: 'Deprecated Interface',
    category: 'Forgotten Content',
    description: 'Use a deprecated B2B interface that was not properly shut down.',
    difficulty: 2,
    hint: addHint('The developers who disabled the interface think they could go invisible by just closing their eyes.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/forgotten-content.html#use-a-deprecated-b2b-interface-that-was-not-properly-shut-down'),
    solved: false
  }).then(challenge => {
    challenges.deprecatedInterfaceChallenge = challenge
  })
  models.Challenge.create({
    name: 'XXE Tier 1',
    category: 'XXE',
    description: 'Retrieve the content of <code>C:\\Windows\\system.ini</code> or <code>/etc/passwd</code> from the server.',
    difficulty: 3,
    hint: addHint('The leverage point for this challenge is the deprecated B2B interface.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/xxe.html#retrieve-the-content-of-cwindowssystemini-or-etcpasswd-from-the-server'),
    solved: false
  }).then(challenge => {
    challenges.xxeFileDisclosureChallenge = challenge
  })
  models.Challenge.create({
    name: 'XXE Tier 2',
    category: 'XXE',
    description: 'Give the server something to chew on for quite a while.',
    difficulty: 5,
    hint: addHint('It is not as easy as sending a large amount of data directly to the deprecated B2B interface.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/xxe.html#give-the-server-something-to-chew-on-for-quite-a-while'),
    solved: false
  }).then(challenge => {
    challenges.xxeDosChallenge = challenge
  })
  models.Challenge.create({
    name: 'RCE Tier 1',
    category: 'Deserialization',
    description: 'Perform a Remote Code Execution that would keep a less hardened application busy <em>forever</em>.',
    difficulty: 5,
    hint: addHint('The feature you need to exploit for this challenge is not directly advertised anywhere.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/deserialization.html#perform-a-remote-code-execution-that-would-keep-a-less-hardened-application-busy-forever'),
    solved: false
  }).then(challenge => {
    challenges.rceChallenge = challenge
  })
  models.Challenge.create({
    name: 'RCE Tier 2',
    category: 'Deserialization',
    description: 'Perform a Remote Code Execution that occupies the server for a while without using infinite loops.',
    difficulty: 6,
    hint: addHint('Your attack payload must not trigger the protection againt too many iterations.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/deserialization.html#perform-a-remote-code-execution-that-occupies-the-server-for-a-while-without-using-infinite-loops'),
    solved: false
  }).then(challenge => {
    challenges.rceOccupyChallenge = challenge
  })
  models.Challenge.create({
    name: 'Blockchain Tier 1',
    category: 'Cryptographic Issues',
    description: 'Learn about the Token Sale before its official announcement.',
    difficulty: 4,
    hint: addHint('The developers truly believe in "Security through Obscurity" over actual access restrictions.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/crypto.html#learn-about-the-token-sale-before-its-official-announcement'),
    solved: false
  }).then(challenge => {
    challenges.tokenSaleChallenge = challenge
  })
/*
  models.Challenge.create({
    name: 'Blockchain Tier 2',
    category: 'Cryptographic Issues',
    description: 'Be <em>the first</em> to sign up for the Token Sale before its official go-live.',
    difficulty: 6,
    hint: addHint('Unfortunately, several others have been faster than you. You need to push to the front somehow.'),
    hintUrl: addHint('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part2/crypto.html#be-the-first-to-sign-up-for-the-token-sale-before-its-official-go-live'),
    solved: false
  }).then(challenge => {
    challenges.tokenSaleSignUpChallenge = challenge
  })
*/
}

function createUsers () {
  models.User.create({
    email: 'admin@' + config.get('application.domain'),
    password: 'admin123'
  }).catch(console.error)
  models.User.create({
    email: 'jim@' + config.get('application.domain'),
    password: 'ncc-1701'
  })
  models.User.create({
    email: 'bender@' + config.get('application.domain'),
    password: 'OhG0dPlease1nsertLiquor!'
  }).then(user => {
    users.bender = user
  })
  models.User.create({
    email: 'bjoern.kimminich@googlemail.com',
    password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
  }).then(user => {
    users.bjoern = user
  })
  models.User.create({
    email: 'ciso@' + config.get('application.domain'),
    password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
  }).then(user => {
    users.ciso = user
  })
  models.User.create({
    email: 'support@' + config.get('application.domain'),
    password: 'J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P'
  }).then(user => {
    users.support = user
  })
  models.User.create({
    email: 'morty@' + config.get('application.domain'),
    password: 'focusOnScienceMorty!focusOnScience'
  }).then(user => {
    users.morty = user
  })
  models.User.create({
    email: 'mc.safesearch@' + config.get('application.domain'),
    password: 'Mr. N00dles'
  }).then(user => {
    users.rapper = user
  })
}

function createRandomFakeUsers () {
  for (let i = 0; i < config.get('application.numberOfRandomFakeUsers'); i++) {
    models.User.create({
      email: getGeneratedRandomFakeUserEmail(),
      password: makeRandomString(5)
    })
  }
}

function getGeneratedRandomFakeUserEmail () {
  const randomDomain = makeRandomString(4).toLowerCase() + '.' + makeRandomString(2).toLowerCase()
  return makeRandomString(5).toLowerCase() + '@' + randomDomain
}

function makeRandomString (length) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

function createProducts () {
  function softDeleteIfConfigured ({name, id}) {
    for (const configuredProduct of config.get('products')) {
      if (name === configuredProduct.name) {
        if (configuredProduct.deletedDate) {
          models.sequelize.query('UPDATE Products SET deletedAt = \'' + configuredProduct.deletedDate + '\' WHERE id = ' + id)
        }
        break
      }
    }
  }

  for (const product of config.get('products')) {
    const name = product.name
    let description = product.description || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'
    const reviews = product.reviews
    if (product.useForChristmasSpecialChallenge) {
      description += ' (Seasonal special offer! Limited availability!)'
    } else if (product.urlForProductTamperingChallenge) {
      description += ' <a href="' + product.urlForProductTamperingChallenge + '" target="_blank">More...</a>'
    } else if (product.fileForRetrieveBlueprintChallenge) {
      if (datacache.retrieveBlueprintChallengeFile) {
        console.error('Cannot use ' + product.fileForRetrieveBlueprintChallenge + ' when ' + datacache.retrieveBlueprintChallengeFile + ' is already being used for the Retrieve Blueprint Challenge.')
        process.exit(1)
      }
      let blueprint = product.fileForRetrieveBlueprintChallenge
      if (utils.startsWith(blueprint, 'http')) {
        const blueprintUrl = blueprint
        blueprint = decodeURIComponent(blueprint.substring(blueprint.lastIndexOf('/') + 1))
        utils.downloadToFile(blueprintUrl, 'app/public/images/products/' + blueprint)
      }
      datacache.retrieveBlueprintChallengeFile = blueprint
    }
    const price = product.price || Math.floor(Math.random())
    let image = product.image || 'undefined.png'
    if (utils.startsWith(image, 'http')) {
      const imageUrl = image
      image = decodeURIComponent(image.substring(image.lastIndexOf('/') + 1))
      utils.downloadToFile(imageUrl, 'app/public/images/products/' + image)
    }
    models.Product.create({
      name,
      description,
      price,
      image
    }).then(product => {
      softDeleteIfConfigured(product)
      if (product.description.match(/Seasonal special offer! Limited availability!/)) {
        if (products.christmasSpecial) {
          console.error('Cannot use ' + product.name + ' when ' + products.christmasSpecial.name + ' is already being used for the Christmas Special Challenge.')
          process.exit(1)
        }
        products.christmasSpecial = product
        models.sequelize.query('UPDATE Products SET deletedAt = \'2014-12-27 00:00:00.000 +00:00\' WHERE id = ' + product.id)
      } else if (product.description.match(/a href="https:\/\/www\.owasp\.org\/index\.php\/O-Saft"/)) {
        if (products.osaft) {
          console.error('Cannot use ' + product.name + ' when ' + products.osaft.name + ' is already being used for the Product Tampering Challenge.')
          process.exit(1)
        }
        products.osaft = product
        if (product.deletedAt) { // undo delete to be consistent about corresponding challenge difficulty
          models.sequelize.query('UPDATE Products SET deletedAt = null WHERE id = ' + product.id)
        }
      }
      return product
    }).then(({id}) => {
      if (reviews) {
        return Promise.all(
          reviews
          .map((review) => {
            review.message = review.text
            review.author = review.author + '@' + config.get('application.domain')
            review.product = id
            return review
          }).map((review) => {
            return mongodb.reviews.insert(review)
          })
        )
      }
    })
  }
}

function createBaskets () {
  models.Basket.create({
    UserId: 1
  })
  models.Basket.create({
    UserId: 2
  })
  models.Basket.create({
    UserId: 3
  })
  models.BasketItem.create({
    BasketId: 1,
    ProductId: 1,
    quantity: 2
  })
  models.BasketItem.create({
    BasketId: 1,
    ProductId: 2,
    quantity: 3
  })
  models.BasketItem.create({
    BasketId: 1,
    ProductId: 3,
    quantity: 1
  })
  models.BasketItem.create({
    BasketId: 2,
    ProductId: 4,
    quantity: 2
  })
  models.BasketItem.create({
    BasketId: 3,
    ProductId: 5,
    quantity: 1
  })
}

function createFeedback () {
  models.Feedback.create({
    UserId: 1,
    comment: 'I love this shop! Best products in town! Highly recommended!',
    rating: 5
  })
  models.Feedback.create({
    UserId: 2,
    comment: 'Great shop! Awesome service!',
    rating: 4
  })
  models.Feedback.create({
    comment: 'Incompetent customer support! Can\'t even upload photo of broken purchase!<br><em>Support Team: Sorry, only order confirmation PDFs can be attached to complaints!</em>',
    rating: 2
  })
  models.Feedback.create({
    comment: 'This is <b>the</b> store for awesome stuff of all kinds!',
    rating: 4
  })
  models.Feedback.create({
    comment: 'Never gonna buy anywhere else from now on! Thanks for the great service!',
    rating: 4
  })
  models.Feedback.create({
    comment: 'Keep up the good work!',
    rating: 3
  })
  models.Feedback.create({
    UserId: 3,
    comment: 'Nothing useful available here!',
    rating: 1
  })
}

function createComplaints () {
  models.Complaint.create({
    UserId: 3,
    message: 'I\'ll build my own eCommerce business! With Black Jack! And Hookers!'
  })
}

function createRecycles () {
  models.Recycle.create({
    UserId: 2,
    quantity: 800,
    address: 'Starfleet HQ, 24-593 Federation Drive, San Francisco, CA',
    date: '2270-01-17',
    isPickup: true
  })
}

function createSecurityQuestions () {
  models.SecurityQuestion.create({
    question: 'Your eldest siblings middle name?'
  })
  models.SecurityQuestion.create({
    question: 'Mother\'s maiden name?'
  })
  models.SecurityQuestion.create({
    question: 'Mother\'s birth date? (MM/DD/YY)'
  })
  models.SecurityQuestion.create({
    question: 'Father\'s birth date? (MM/DD/YY)'
  })
  models.SecurityQuestion.create({
    question: 'Maternal grandmother\'s first name?'
  })
  models.SecurityQuestion.create({
    question: 'Paternal grandmother\'s first name?'
  })
  models.SecurityQuestion.create({
    question: 'Name of your favorite pet?'
  })
  models.SecurityQuestion.create({
    question: 'Last name of dentist when you were a teenager? (Do not include \'Dr.\')'
  })
  models.SecurityQuestion.create({
    question: 'Your ZIP/postal code when you were a teenager?'
  })
  models.SecurityQuestion.create({
    question: 'Company you first work for as an adult?'
  })
}

function createSecurityAnswers () {
  models.SecurityAnswer.create({
    SecurityQuestionId: 2,
    UserId: 1,
    answer: '@xI98PxDO+06!'
  }).catch(console.error)
  models.SecurityAnswer.create({
    SecurityQuestionId: 1,
    UserId: 2,
    answer: 'Samuel' // https://en.wikipedia.org/wiki/James_T._Kirk
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 10,
    UserId: 3,
    answer: 'Stop\'n\'Drop' // http://futurama.wikia.com/wiki/Suicide_booth
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 9,
    UserId: 4,
    answer: 'West-2082' // http://www.alte-postleitzahlen.de/uetersen
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 7,
    UserId: 5,
    answer: 'Brd?j8sEMziOvvBf§Be?jFZ77H?hgm'
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 10,
    UserId: 6,
    answer: 'SC OLEA SRL' // http://www.olea.com.ro/
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 1,
    UserId: 7,
    answer: 'JeRRy' // bruteforcible/
  })
}
