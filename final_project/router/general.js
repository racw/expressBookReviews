const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register new user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({message: "Username and password are required"});
  }
  if (users.some(user => user.username === username)) {
      return res.status(409).json({message: "Username already exists"});
  }
  users.push({ username, password });
  return res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        // Simulating an async operation to fetch books
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject(new Error('Failed to fetch books'));
                }
            });
        };

        const bookList = await getBooks();
        
        if (Object.keys(bookList).length === 0) {
            return res.status(404).json({message: "No books found"});
        }
        return res.status(200).json(bookList);
    } catch (error) {
        return res.status(500).json({message: "Error retrieving books", error: error.message});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        // Create a promise to find book by ISBN
        const findBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject(new Error('Book not found'));
                }
            });
        };

        const book = await findBookByISBN(isbn);
        return res.status(200).json(book);
        
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        
        // Create a promise to find books by author
        const findBooksByAuthor = (authorName) => {
            return new Promise((resolve, reject) => {
                const booksByAuthor = Object.values(books).filter(book => 
                    book.author.toLowerCase() === authorName.toLowerCase()
                );
                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject(new Error('No books found for this author'));
                }
            });
        };

        const booksList = await findBooksByAuthor(author);
        return res.status(200).json(booksList);
        
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        
        // Create a promise to find books by title
        const findBooksByTitle = (searchTitle) => {
            return new Promise((resolve, reject) => {
                const booksByTitle = Object.values(books).filter(book => 
                    book.title.toLowerCase().includes(searchTitle.toLowerCase())
                );
                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject(new Error('No books found with this title'));
                }
            });
        };

        const booksList = await findBooksByTitle(title);
        return res.status(200).json(booksList);
        
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({message: "Book not found"});
    }
    if (!book.reviews) {
        return res.status(404).json({message: "No reviews found for this book"});
    }
    return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
