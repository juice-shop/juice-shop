// demo-vulnerabilities.js
// Intentionally insecure snippet for testing security scanning tools.
// Not imported or executed anywhere in the app.

const mysql = require('mysql')

function getUserById (userId) {
  // SQL Injection: user input concatenated directly into the query
  const query = "SELECT * FROM users WHERE id = '" + userId + "'"
  db.query(query, (err, results) => {
    console.log(results)
  })
}

// Hardcoded secret
const stripeApiKey = 'sk-live-51H8xJ2eZvKYlo2CvQ9X7aBcDeFgHiJ'

function renderUserComment (comment) {
  // XSS: raw user input inserted into the DOM without sanitizing
  document.getElementById('comments').innerHTML = comment
}

module.exports = { getUserById, renderUserComment }