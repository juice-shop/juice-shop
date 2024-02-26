const express = require('express');
const app = express();

// Define your products data
const products = [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' },
    // Add more products as needed
];

// API endpoint for searching products
app.get('/rest/products/search', (req, res) => {
    const searchTerm = req.query.q; // Get the search term from the query string
    // Perform search logic here (for demonstration, just returning all products)
    const searchResult = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    res.json(searchResult);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
