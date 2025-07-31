/*
  GOAT Name: Regex Injection Variant A
  Vulnerable Start Line: 22,
  Vulnerable End Line: 22,
  Link: https://gitlab.com/oxsecurity/research/code/collections/sast-lab-pos/-/blob/main/JavaScript/regex_injection/example_01/vulnCode.js#L22
*/

const express = require('express');
const app = express();
app.use(express.json());

const comments = [
  { user: "alice", message: "hello world" },
  { user: "bob", message: "regex is tricky!" },
  { user: "carol", message: "use \\b for word boundaries" }
];

app.post('/filter-comments', (req, res) => {
  const pattern = req.body.filter;

  const regex = new RegExp(pattern); // 🚨 Regex Injection vulnerable

  const result = comments.filter(entry => regex.test(entry.message));
  res.json(result);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
