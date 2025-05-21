const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // This will hold registered users {username, password}

// Check if username is valid (i.e., already exists)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username and password match a registered user
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Login endpoint - only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Create JWT token with username as payload
  const token = jwt.sign({ username }, "access", { expiresIn: 60 * 60 }); // token expires in 1 hour

  // Store token and username inside the session object correctly
  if (!req.session) req.session = {};  // safety check if session middleware is missing
  req.session.authorization = { accessToken: token, username };

  return res.status(200).json({ message: "User logged in successfully.", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session?.authorization?.username;
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or update the user's review
  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully.", reviews: book.reviews });
});

// Delete a book review by logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session?.authorization?.username;
  const isbn = req.params.isbn;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "No review found for this user." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
