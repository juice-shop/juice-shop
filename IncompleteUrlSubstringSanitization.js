app.get('/some/path', function(req, res) {
    let url = req.param('url'),
        host = urlLib.parse(url).host;
    // GOOD: the host of `url` can not be controlled by an attacker
    let allowedHosts = [
        'example.com',
        'beta.example.com',
        'www.example.com'
    ];
    if (allowedHosts.includes(host)) {
        res.redirect(url);
    }
});
