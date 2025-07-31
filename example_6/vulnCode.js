/*
  GOAT Name: Node Api Goat,
  Vulnerable Start Line: 79,
  Vulnerable End Line: 79,
  Link: https://gitlab.com/oxsecurity/research/code/kpis/javascript-goats/node-api-goat/blob/master/app/server.js#L80
*/

var express = require("express");
var serialize = require('node-serialize');
var cprocess = require('child_process');
// Error installing libxmljs:
//     Error: Cannot find module '../'
// var libxmljs = require('libxmljs');
var fse = require("fs-extra");
var app = express();

var converter = require("./converter");

// This function is called when you want the server to end gracefully
// (i.e. wait for existing connections to close).
var gracefulShutdown = function() {
  console.log("Received shutdown command, shutting down gracefully.");
  process.exit();
}

// listen for TERM signal (e.g. kill command issued by forever).
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal (e.g. Ctrl+C).
process.on('SIGINT', gracefulShutdown);

// Id:          CWE-95
// Description: Eval Injection
// Exploit URL: http://localhost:3001/cwe95/rgbToHex?red=255&green=255&blue=255
// Status:      PASS
app.get("/cwe95/rgbToHex", function(req, res) {
  // To fix these security vulnerabilities, 
  // Replace the three eval() statements with their parseInt() versions.
  var red = eval(req.query.red);
  var green = eval(req.query.green, 10);
  var blue  = eval(req.query.blue, 10);

  // var red   = parseInt(req.query.red, 10);
  // var green = parseInt(req.query.green, 10);
  // var blue  = parseInt(req.query.blue, 10);
  var hex = converter.rgbToHex(red, green, blue);
//   res.send(hex);
});

app.get("/hexToRgb", function(req, res) {
  var hex = req.query.hex;
  var rgb = converter.hexToRgb(hex);
//   res.send(JSON.stringify(rgb));
});

// Id:          CWE-73
// Description: External Control of File Name or Path
// Exploit URL: http://localhost:3001/cwe73/read?foo=package.json
// Status:      PASS
app.get("/cwe73/read", function(req, res) {
//   res.send(fse.readJsonSync(req.query.foo));
});

// Id:          CWE-113
// Description: Improper Neutralization of CRLF Sequences in HTTP Headers ('HTTP Response Splitting')
// Exploit URL: http://localhost:3001/cwe113/split?key=myKey&value=myValueThatCouldHaveCRLFs
// Status:      PASS
app.get('/cwe113/split', function (req, res) {
  res.append(req.query.key, req.query.value);
  res.status(200).send('Check your headers!');
});


// Id:          CWE-201
// Description: Information Exposure Through Sent Data
// Exploit URL: http://localhost:3001/cwe201/exposure?text=sensitive
// Status:      PASS
app.get('/cwe201/exposure', function (req, res) {
  res.send(req.query.text);
});


// Id:          CWE-601
// Description: URL Redirection to Untrusted Site ('Open Redirect')
// Exploit URL: http://localhost:3001/cwe601/redirect?text=www.maliciouswebsite.com
// Status:      PASS
app.get('/cwe601/redirect', function (req, res) {
  res.redirect("http://localhost:3001/echo?text=" + req.query.text + " (Redirected)");
});

// Id:          CWE-502
// Description: Deserialization of Untrusted Data
// Exploit URL: http://localhost:3001/cwe502/serialize?foo={"rce":"_$$ND_FUNC$$_function (){console.log('exploited')}()"}
// Status:      PASS
app.get("/cwe502/serialize", function(req, res) {
  serialize.unserialize(req.query.foo);
  res.send("node-serialize");
});

// Id:          CWE-78
// Description: OS Command Injection
// Exploit URL: http://localhost:3001/cwe78/childprocess?foo=pwd
// Status:      PASS
app.get("/cwe78/childprocess", function(req, res) {
  cprocess.exec(req.query.foo, (error,stdout,stderr) => {
  if (error) {
    console.log(`Error executing endpoint /cwe78/childprocess: ${error}`);
  }});
  res.send("child_process");
});

// Id:          CWE-611
// Description: Improper Restriction of XML External Entity Reference
// Exploit URL: http://localhost:3001/cwe611/xmlref/?xml=<xml>xml</xml>
// Status:      PASS
//app.get('/cwe611/xmlref', function (req, res) {
//  var xmlout = libxmljs.parseXmlString(req.query.xml, {noent:true});
//	res.send(xmlout.childNodes()[0].toString());
//});

var server = app.listen(3001, function () {
  var port = server.address().port;
  //console.log('node-api-goat app listening at port %s', port);
});
module.exports = server;