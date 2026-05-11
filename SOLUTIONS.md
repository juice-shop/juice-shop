# Solutions

Did you write a guide specifically on hacking OWASP Juice Shop or record a hacking session of your own? Add it to this
file and open a PR! The same goes for any scripts or automated tools you made for making Juice Shop easier to hack!

> :godmode: **Everything** mentioned on this specific page is considered
> to contain _spoilers for entire challenge solutions_ so the entries
> themselves are not individually tagged! You might not want to view
> anything from this page before tackling the related challenges
> yourself! :broken_heart: marks resources which rely on
> [_some form of cheating_](https://pwning.owasp-juice.shop/companion-guide/latest/part1/rules.html#_things_considered_cheating)
> to solve a challenge.
>
> 🧃 is followed by the last known major release of OWASP Juice Shop
> that a solution/script/tool is supposedly working with or that a video
> guide/solution was recorded for.

## Table of contents

* [Hacking Videos](#hacking-videos)
* [Walkthroughs](#walkthroughs)
* [Scripts & Tools](#scripts--tools)

## Hacking Videos

* [7 Minute Security](https://7ms.us) Podcast (🧃`v16.x`)
  * Episode #606: [7MS #606: Hacking OWASP Juice Shop (2024 edition)]() ([YouTube](https://www.youtube.com/watch?v=-1rpelarf2E))
  * Legacy Episodes (🧃`v2.x`)
    * Episode #234:
      [7MS #234: Pentesting OWASP Juice Shop - Part 5](https://7ms.us/7ms-234-pentesting-owasp-juice-shop-part5/)
      ([YouTube](https://www.youtube.com/watch?v=lGVAXCfFwv0))
    * Episode #233:
      [7MS #233: Pentesting OWASP Juice Shop - Part 4](https://7ms.us/7ms-233-pentesting-owasp-juice-shop-part-4/)
      ([YouTube](https://www.youtube.com/watch?v=1hhd9EwX7h0))
    * Episode #232:
      [7MS #232: Pentesting OWASP Juice Shop - Part 3](https://7ms.us/7ms-232-pentesting-owasp-juice-shop-part-3/)
      ([YouTube](https://www.youtube.com/watch?v=F8iRF2d-YzE))
    * Episode #231:
      [7MS #231: Pentesting OWASP Juice Shop - Part 2](https://7ms.us/7ms-231-pentesting-owasp-juice-shop-part-2/)
      ([YouTube](https://www.youtube.com/watch?v=523l4Pzhimc))
    * Episode #230:
      [7MS #230: Pentesting OWASP Juice Shop - Part 1](https://7ms.us/7ms-230-pentesting-owasp-juice-shop-part-1/)
      ([YouTube](https://www.youtube.com/watch?v=Cz37iejTsH4))
    * Episode #229:
      [7MS #229: Intro to Docker for Pentesters](https://7ms.us/7ms-229-intro-to-docker-for-pentesters/)
      ([YouTube](https://youtu.be/WIpxvBpnylI?t=407))
* [How to Solve Juiceshop Challenges - Intern Talks](https://www.youtube.com/watch?v=dqxdbIWFD5c) by [Indian Servers University](https://www.youtube.com/c/IndianServersUniversity) (🧃`v11.x`)
* [Hacking the OWASP Juice Shop Series](https://www.youtube.com/playlist?list=PLcsrjMNFrcmbAFV8BxDKXZCcPrOlaYfWK) playlist of [Compass IT Compliance](https://www.youtube.com/channel/UCccfSU7EGGTS76hz2i6qdrg) (🧃`v12.x`)
  * [Hacking the OWASP Juice Shop Series - Deploying the Juice Shop](https://youtu.be/qjrEMEztxWM)
  * [Hacking the OWASP Juice Shop Series - Challenge #1 (Score Board)](https://youtu.be/3TKm5T0ul5Y)
  * [Hacking the OWASP Juice Shop Series - Challenge #2 (DOM XSS)](https://youtu.be/qTm52tJu4i4)
  * [Hacking the OWASP Juice Shop Series - Challenge #3 (Bonus Payload)](https://youtu.be/GoZbpBY6R1E)
  * [Hacking the OWASP Juice Shop Series - Challenge #4 (Repetitive Registration)](https://youtu.be/hRF1StzaXo4)
  * [Hacking the OWASP Juice Shop Series - Challenge #5 (Bully Chatbot)](https://youtu.be/dTm_55SUW88)
  * [Hacking the OWASP Juice Shop Series - Challenge #6 (Confidential Document)](https://youtu.be/pt6a5-O90G4)
  * [Hacking the OWASP Juice Shop Series - Challenge #7 (Error Handling)](https://youtu.be/aFJzZJcxVd8)
  * [Hacking the OWASP Juice Shop Series - Challenge #8 (Exposed Metrics)](https://youtu.be/PuU2deMxj3E)
  * [Hacking the OWASP Juice Shop Series - Challenge #9 (Missing Encoding)](https://youtu.be/40ndR8btKaU)
  * [Hacking the OWASP Juice Shop Series - Challenge #10 (Outdated Allowlist)](https://youtu.be/diXuxUxLmXU)
  * [Hacking the OWASP Juice Shop Series - Challenge #11 (Privacy Policy)](https://youtu.be/C3Qeyh3_xOA)
  * [Hacking the OWASP Juice Shop Series - Challenge #12 (Zero Stars)](https://youtu.be/aJOvzpOdAC0)
  * [Hacking the OWASP Juice Shop Series - Manage Heroku and Juice Shop](https://youtu.be/5jerMnM0vXw)
* [OWASP Juice Shop | TryHackMe Burp Suite Fundamentals](https://youtu.be/6n1pI9dJpW4) by [CyberInsight](https://www.youtube.com/channel/UCmJJUewPWfnyzvZRrFHlykA)
* [Wie werden APIs "gehackt" - API Sicherheit am Beispiel](https://youtu.be/wGtS5qQ0bC0) (:de:)
  by
  [predic8](https://www.youtube.com/channel/UC9ONq2LjrImWzWrWf6MYd2A) (🧃`v12.x`)
* [Hack OWASP Juice Shop](https://www.youtube.com/watch?v=0YSNRz0NRt8&list=PL8j1j35M7wtKXpTBE6V1RlN_pBZ4StKZw)
  playlist of
  [Hacksplained](https://www.youtube.com/channel/UCyv6ItVqQPnlFFi2zLxlzXA)
  (🧃`v10.x` - `v11.x`)
    * [★ Zero Stars](https://youtu.be/0YSNRz0NRt8)
    * [★ Confidential Document](https://youtu.be/Yi7OiMtzGXc)
    * [★ DOM XSS](https://youtu.be/BuVxyBo05F8)
    * [★ Error Handling](https://youtu.be/WGafQnjSMk4)
    * [★ Missing Encoding](https://youtu.be/W7Bt2AmYtao)
    * [★ Outdated Allowlist](https://youtu.be/TEdZAXuTfpk)
    * [★ Privacy Policy](https://youtu.be/f5tM_4vBq-w)
    * [★ Repetitive Registration](https://youtu.be/mHjYOtKGYQM)
    * [★★ Login Admin](https://youtu.be/LuU1fSuc7Gg)
    * [★★ Admin Section](https://youtu.be/BPLhu354esc)
    * [★★ Classic Stored XSS](https://youtu.be/dxzU6djocJQ)
    * [★★ Deprecated Interface](https://youtu.be/yQ40B_eSj48)
    * [★★ Five Star Feedback](https://youtu.be/9BsfRJA_-ik)
    * [★★ Login MC SafeSearch](https://youtu.be/8VhGBdVK9ik)
    * [★★ Password Strength](https://youtu.be/fnuz-3QM8ac)
    * [★★ Security Policy](https://youtu.be/_h829JTNtKo)
    * [★★ View Basket](https://youtu.be/hBbdxn3-aiU)
    * [★★ Weird Crypto](https://youtu.be/GWJouiMUJno)
    * [★★★ API-Only XSS](https://youtu.be/aGjLR4uc0ys)
    * [★★★ Admin Registration](https://youtu.be/-H3Ngs-S0Ms)
    * [★★★ Björn's Favorite Pet](https://youtu.be/a0k465G8Zkc)
    * [★★★ Captcha Bypass](https://youtu.be/pgGVVOhIiaM)
    * [★★★ Client-side XSS Protection](https://youtu.be/bNjsjs0T0_k)
    * [★★★ Database Schema](https://youtu.be/0-D-e66U2Z0)
    * [★★★ Forged Feedback](https://youtu.be/99iKTSkZ814)
    * [★★★ Forged Review](https://youtu.be/k2abfhtuU9c)
    * [★★★ GDPR Data Erasure](https://youtu.be/zBTYSpp41u8)
    * [★★★ Login Amy](https://youtu.be/ICln3xcVxzI)
    * [★★★ Login Bender](https://youtu.be/a6kh9fL77A0)
    * [★★★ Login Jim](https://youtu.be/zJpJibswGWA)
    * [★★★ Manipluate Basket](https://youtu.be/pdtDtmIiSOQ)
    * [★★★ Payback Time](https://youtu.be/QN4f00VsXn4)
    * [★★★ Privacy Policy Inspection](https://youtu.be/5DUXTmp5KbI)
    * [★★★ Product Tampering](https://youtu.be/G4UKdotkyu8)
    * [★★★ Reset Jim's Password](https://youtu.be/qYVlxeKVhgA)
    * [★★★ Upload Size](https://youtu.be/5pcAPUihhWA)
    * [★★★ Upload Type](https://youtu.be/4FPyMdyVt2s)
    * [★★★★ Access Log (Sensitive Data Exposure)](https://youtu.be/RBTfGk-ZwnY)
    * [★★★★ Ephemeral Accountant (SQL-Injection)](https://youtu.be/rD-_fRDHf9o)
    * [★★★★ Expired Coupon (Improper Input Validation)](https://youtu.be/4cWTUdTvTZg)
    * [★★★★ Forgotten Developer Backup (Sensitive Data Exposure)](https://youtu.be/YvkuVZ6r2Rg)
    * [★★★★ Forgotten Sales Backup (Sensitive Data Exposure)](https://youtu.be/5g4WRASni6g)
    * [★★★★ GDPR Data Theft (Sensitive Data Exposure)](https://youtu.be/GPW90c4Ahbc)
    * [★★★★ Legacy Typosquatting (Vulnerable Components)](https://youtu.be/HqkGeWtwiHY)
    * [★★★★ Login Bjoern (Broken Authentication)](https://youtu.be/pmBJ1ZAlpF8)
    * [★★★★ Misplaced Signature File (Sensitive Data Exposure)](https://youtu.be/56qHiwxTjYY)
    * [★★★★ Nested Easter Egg (Cryptographic Issues)](https://youtu.be/yvatrnWvcGE)
    * [★★★★ NoSql Manipulation (Injection)](https://youtu.be/frymuDxKwmc)
      :broken_heart:
    * [★★★★★ Change Benders Password (Broken Authentication)](https://youtu.be/J3BSi-z9_7I)
    * [★★★★★ Extra Language (Broken Anti Automation)](https://youtu.be/KU2LzxABetk)
* [Try Hack Me - OWASP Juice Shop](https://www.youtube.com/watch?v=xDQt-I7pncY) by [Silesio Carvalho](https://www.youtube.com/@silesiocarvalho) (🧃`v12.x`)
* [OWASP Juice Shop | TryHackMe](https://www.youtube.com/playlist?list=PLqM63j87R5p6Nc7XYSdQ7mnrdEsFGfUj0) series
  by [Motasem Hamdan - CyberSecurity Trainer](https://www.youtube.com/channel/UCNSdU_1ehXtGclimTVckHmQ)
  as part of [TryHackMe OWASP Juice Shop | The Complete Guide](https://motasemhamdan.medium.com/tryhackme-owasp-juice-shop-the-complete-guide-80c996df25c7) (🧃`v12.x`)
    * [Broken Authentication and SQL Injection](https://youtu.be/W4MXUnZB2jc)
    * [Exposing Sensitive Data and Viewing other users shopping carts](https://youtu.be/AdncxIRp0SI)
    * [Solving OWASP Juice Shop Stored and Reflected XSS](https://youtu.be/_s6VZRV-TDY)
* Live Hacking von Online-Shop „Juice Shop” (:de:)
  [Twitch live stream](https://www.twitch.tv/GregorBiswanger) recordings by
  [Gregor Biswanger](https://www.youtube.com/channel/UCGMA9qDbIQ-EhgLD-ZrsHWw)
  (🧃`v11.x`)
    * [Level 1](https://youtu.be/ccy-eKYpdbk)
    * [Level 2](https://youtu.be/KtMPEDJx0Sg)
    * [Level 3](https://youtu.be/aqXfFVHJ91g)
    * [Level 4](https://youtu.be/jfe-iEePlTc)
* [HackerOne #h1-2004 Community Day: Intro to Web Hacking - OWASP Juice Shop](https://youtu.be/KmlwIwG7Kv4)
  by [Nahamsec](https://twitch.tv/nahamsec) including the creation of a
  (fake) bugbounty report for all findings (🧃`v10.x`)
* [TryHackme - JuiceShop Walkthrough](https://youtu.be/3yYNvRVlKmo) by
  [Profesor Parno](https://www.youtube.com/channel/UCcBThq4OKjox_kfPkG1BF0Q)
  (🧃`v8.x`, 🇮🇩)
* [OWASP Juice Shop All Challenges Solved || ETHIKERS](https://youtu.be/Fjdhf6OHgRk)
  full-spoiler, time-lapsed, no-commentary hacking trip (🧃`v8.x`)
* [Hacking JavaScript - Intro to Hacking Web Apps (Episode 3)](https://youtu.be/ejB1i5n_d7o)
  by Arthur Kay (🧃`v8.x`)
* [HackerSploit](https://www.youtube.com/channel/UC0ZTPkdxlAKf-V33tqXwi3Q)
  YouTube channel (🧃`v7.x`)
    * [OWASP Juice Shop - SQL Injection](https://youtu.be/nH4r6xv-qGg)
    * [Web App Penetration Testing - #15 - HTTP Attributes (Cookie Stealing)](https://youtu.be/8s3ChNKU85Q)
    * [Web App Penetration Testing - #14 - Cookie Collection & Reverse Engineering](https://youtu.be/qtr0qtptYys)
    * [Web App Penetration Testing - #13 - CSRF (Cross Site Request Forgery)](https://youtu.be/TwG0Rd0hr18)
    * [How To Install OWASP Juice Shop](https://youtu.be/tvNKp1QXV_8)

## Walkthroughs

* Blog post (:myanmar:) on [LOL Security](http://location-href.com/):
  [Juice Shop Walkthrough](http://location-href.com/owasp-juice-shop-walkthroughs/)
  (🧃`v2.x`)
* Blog post on [IncognitJoe](https://incognitjoe.github.io/):
  [Hacking(and automating!) the OWASP Juice Shop](https://incognitjoe.github.io/hacking-the-juice-shop.html)
  (🧃`v2.x`)

## Scripts & Tools

* [Session management script for OWASP Juice Shop](https://github.com/zaproxy/zaproxy/blob/master/zap/src/main/dist/scripts/templates/session/Juice%20Shop%20Session%20Management.js)
  distributed as a scripting template with
  [OWASP ZAP](https://github.com/zaproxy/zaproxy) since version 2.9.0
  (🧃`v10.x`)
* [Automated solving script for the OWASP Juice Shop](https://github.com/incognitjoe/juice-shop-solver)
  written in Python by [@incognitjoe](https://github.com/incognitjoe)
  (🧃`v2.x`)

