/*
  GOAT Name: Open Redirect Variant A
  Vulnerable Start Line: 16,
  Vulnerable End Line: 16,
  Link: https://gitlab.com/oxsecurity/research/code/collections/sast-lab-pos/-/blob/main/JavaScript/open_redirect/example_01/vulnCode.js#L16
*/

const express = require('express');
const url = require('url');
const app = express();

app.get('/redirect', (req, res) => {
  const target = req.query.target;

  // 🚨 Vulnerable: no validation of external URL
  res.redirect(target);
});

app.listen(4000, () => {
  console.log('Server running on port 4000');
});
