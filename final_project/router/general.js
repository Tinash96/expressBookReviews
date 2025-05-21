const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:6000'; // your own API base url

// Task 6: Register a new user (unchanged)
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Task 10: Get the list of books using async/await + axios internally
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books-data`); // example internal API or data source
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Fallback: If you don't have /books-data endpoint, serve directly:
public_users.get('/books-data', function (req, res) {
  res.status(200).json(books);
});

// Task 11: Get book details by ISBN using async/await + axios internally
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const book = response.data[isbn];
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

// Task 12: Get book details by author using async/await + axios internally
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const matchedBooks = Object.values(response.data).filter(book => book.author.toLowerCase() === author);
    if (matchedBooks.length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({ message: "No books found by that author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Task 13: Get book details by title using async/await + axios internally
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const matchedBooks = Object.values(response.data).filter(book => book.title.toLowerCase() === title);
    if (matchedBooks.length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({ message: "No books found with that title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

// Task 5: Get book reviews by ISBN (unchanged)
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book or reviews not found" });
  }
});

module.exports.general = public_users;
