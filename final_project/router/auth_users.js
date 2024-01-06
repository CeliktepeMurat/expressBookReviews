const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return !users.find((user) => {
    return user.username === username;
  });
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (authenticatedUser(username, password)) {
    const token = jwt.sign(
      {
        username,
      },
      "fingerprint_customer",
      { expiresIn: "1h" }
    );

    req.session.user = username;

    return res.status(200).json({ message: "Successfully logged in!", token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.user;
  const isbn = req.params.isbn;
  const reviewText = req.query.review;

  if (!username || !reviewText) {
    return res.status(400).json({ message: "Invalid request" });
  }

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Check if the book already has reviews
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    // Check if the user has already posted a review for this ISBN
    if (books[isbn].reviews[username]) {
      books[isbn].reviews[username] = reviewText;
      return res.status(200).json({ message: "Review modified successfully." });
    } else {
      books[isbn].reviews[username] = reviewText;
      return res.status(200).json({ message: "Review added successfully." });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.user;
  const isbn = req.params.isbn;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Check if the book has reviews
    if (books[isbn].reviews) {
      // Check if the user has posted a review for this ISBN
      if (books[isbn].reviews[username]) {
        // Delete the user's review
        delete books[isbn].reviews[username];
        return res
          .status(200)
          .json({ message: "Review deleted successfully." });
      } else {
        return res
          .status(404)
          .json({ message: "Review not found for the user." });
      }
    } else {
      return res
        .status(404)
        .json({ message: "No reviews found for the book." });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
