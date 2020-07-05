# Solutions

Did you write a guide specifically on hacking OWASP Juice Shop or record
a hacking session of your own? Add it to this file and open a PR! The
same goes for any scripts or automated tools you made for making Juice
Shop easier to hack!

> :godmode: **Everything** mentioned on this specific page is considered
> to contain _spoilers for entire challenge solutions_ so the entries
> themselves are not individually tagged! You might not want to view
> anything from this page before tackling the related challenges
> yourself!
>
> 🧃 is followed by the last known major release of OWASP Juice Shop
> that a solution/script/tool is supposedly working with or that a video
> guide/solution was recorded for.

## Hacking Videos

* [Hack OWASP Juice Shop](https://www.youtube.com/watch?v=0YSNRz0NRt8&list=PL8j1j35M7wtKXpTBE6V1RlN_pBZ4StKZw)
  playlist of
  [Hacksplained](https://www.youtube.com/channel/UCyv6ItVqQPnlFFi2zLxlzXA)
  (🧃`v10.x`)
  * [★ Zero Stars](https://youtu.be/0YSNRz0NRt8)
  * [★ Confidential Document](https://youtu.be/Yi7OiMtzGXc)
  * [★ DOM XSS](https://youtu.be/BuVxyBo05F8)
  * [★ Error Handling](https://youtu.be/WGafQnjSMk4)
  * [★ Missing Encoding](https://youtu.be/W7Bt2AmYtao)
  * [★ Outdated Whitelist](https://youtu.be/TEdZAXuTfpk)
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
* [HackerOne #h1-2004 Community Day: Intro to Web Hacking - OWASP Juice Shop](https://youtu.be/KmlwIwG7Kv4)
  by [Nahamsec](https://twitch.tv/nahamsec) including the creation of a
  (fake) bugbounty report for all findings (🧃`v10.x`)
* [OWASP Juice Shop All Challenges Solved || ETHIKERS](https://youtu.be/Fjdhf6OHgRk)
  full-spoiler, time-lapsed, no-commentary hacking trip (🧃`v8.x`)
* [HackerSploit](https://www.youtube.com/channel/UC0ZTPkdxlAKf-V33tqXwi3Q)
  Youtube channel (🧃`v7.x`)
  * [OWASP Juice Shop - SQL Injection](https://youtu.be/nH4r6xv-qGg)
  * [Web App Penetration Testing - #15 - HTTP Attributes (Cookie Stealing)](https://youtu.be/8s3ChNKU85Q)
  * [Web App Penetration Testing - #14 - Cookie Collection & Reverse Engineering](https://youtu.be/qtr0qtptYys)
  * [Web App Penetration Testing - #13 - CSRF (Cross Site Request Forgery)](https://youtu.be/TwG0Rd0hr18)
  * [How To Install OWASP Juice Shop](https://youtu.be/tvNKp1QXV_8)
* [7 Minute Security](https://7ms.us) Podcast (🧃`v2.x`)
  * Episode #234:
    [7MS #234: Pentesting OWASP Juice Shop - Part 5](https://7ms.us/7ms-234-pentesting-owasp-juice-shop-part5/)
    ([Youtube](https://www.youtube.com/watch?v=lGVAXCfFwv0))
  * Episode #233:
    [7MS #233: Pentesting OWASP Juice Shop - Part 4](https://7ms.us/7ms-233-pentesting-owasp-juice-shop-part-4/)
    ([Youtube](https://www.youtube.com/watch?v=1hhd9EwX7h0))
  * Episode #232:
    [7MS #232: Pentesting OWASP Juice Shop - Part 3](https://7ms.us/7ms-232-pentesting-owasp-juice-shop-part-3/)
    ([Youtube](https://www.youtube.com/watch?v=F8iRF2d-YzE))
  * Episode #231:
    [7MS #231: Pentesting OWASP Juice Shop - Part 2](https://7ms.us/7ms-231-pentesting-owasp-juice-shop-part-2/)
    ([Youtube](https://www.youtube.com/watch?v=523l4Pzhimc))
  * Episode #230:
    [7MS #230: Pentesting OWASP Juice Shop - Part 1](https://7ms.us/7ms-230-pentesting-owasp-juice-shop-part-1/)
    ([Youtube](https://www.youtube.com/watch?v=Cz37iejTsH4))
  * Episode #229:
    [7MS #229: Intro to Docker for Pentesters](https://7ms.us/7ms-229-intro-to-docker-for-pentesters/)
    ([Youtube](https://youtu.be/WIpxvBpnylI?t=407))

### Walkthroughs

* Blog post (:myanmar:) on [LOL Security](http://location-href.com/):
  [Juice Shop Walkthrough](http://location-href.com/owasp-juice-shop-walkthroughs/)
  (🧃`v2.x`)
* Blog post on [IncognitJoe](https://incognitjoe.github.io/):
  [Hacking(and automating!) the OWASP Juice Shop](https://incognitjoe.github.io/hacking-the-juice-shop.html)
  (🧃`v2.x`)

### Scripts & Tools

* [Session management script for OWASP Juice Shop](https://github.com/zaproxy/zaproxy/blob/master/zap/src/main/dist/scripts/templates/session/Juice%20Shop%20Session%20Management.js)
  distributed as a scripting template with
  [OWASP ZAP](https://github.com/zaproxy/zaproxy) since version 2.9.0
  (🧃`v10.x`)
* [Automated solving script for the OWASP Juice Shop](https://github.com/incognitjoe/juice-shop-solver)
  written in Python by [@incognitjoe](https://github.com/incognitjoe)
  (🧃`v2.x`)

