app.get('/some/path', function(req, res) {
    let url = req.param("url");
    // BAD: the host of `url` may be controlled by an attacker
    if (url.includes("example.com")) {
        res.redirect(url);
    }
});
