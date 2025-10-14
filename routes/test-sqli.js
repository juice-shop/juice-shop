const express = require('express');
const router = express.Router();
const db = require('../data/db');

// VULNERABLE: SQL Injection
router.get('/vulnerable/search', (req, res) => {
    const searchTerm = req.query.q;

    // Intentionally vulnerable - direct concatenation
    const query = "SELECT * FROM Products WHERE name LIKE '%" + searchTerm + "%'";

    db.all(query, (err, products) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(products);
        }
    });
});

module.exports = router;