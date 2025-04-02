const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    return username && username.length >= 3 && users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ 
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({message: "Invalid credentials"});
    }

    const token = jwt.sign({ username: username }, "access", { expiresIn: '1h' });
    req.session.authorization = { accessToken: token };
    
    return res.status(200).json({message: "Login successful", token: token});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

    if (!review) {
        return res.status(400).json({message: "Review content is required"});
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    
    books[isbn].reviews[username] = review;
    
    return res.status(200).json({
        message: "Review added/updated successfully",
        book: books[isbn]
    });
});

// Delete a book review (only user's own review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({message: "No review found for this user"});
    }

    delete books[isbn].reviews[username];

    // If no reviews left, clean up the reviews object
    if (Object.keys(books[isbn].reviews).length === 0) {
        delete books[isbn].reviews;
    }

    return res.status(200).json({
        message: "Review deleted successfully",
        book: books[isbn]
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
