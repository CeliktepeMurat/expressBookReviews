const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password });

      return res.status(200).json({ message: "User registered" });
    } else {
      return res.status(401).json({ message: "User exist" });
    }
  } else {
    return res.status(400).json({ message: "Invalid request" });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json({ book: books[isbn] });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  const bookKeys = Object.keys(books);

  bookKeys.forEach((book) => {
    if (books[book].author === author) {
      matchingBooks.push(books[book]);
    }
  });

  if (matchingBooks.length) {
    return res.status(200).json({ books: matchingBooks });
  }

  return res.status(404).json({ message: "No books found" });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  const bookKeys = Object.keys(books);

  bookKeys.forEach((book) => {
    if (books[book].title === title) {
      matchingBooks.push(books[book]);
    }
  });

  if (matchingBooks.length) {
    return res.status(200).json({ books: matchingBooks });
  }

  return res.status(404).json({ message: "No books found" });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json({ Reviews: books[isbn].reviews });
  }
});

// Function to fetch the list of books using async-await
const getBooksAsync = async () => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return response.data.books;
  } catch (error) {
    console.error(
      "Error fetching books:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Function to fetch book details based on ISBN using async-await
const getBookDetails = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return response.data.book;
  } catch (error) {
    console.error(
      "Error fetching book details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Function to fetch books based on Author using async-await
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return response.data.books;
  } catch (error) {
    console.error(
      "Error fetching books by author:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Function to fetch books based on Title using async-await
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return response.data.books;
  } catch (error) {
    console.error(
      "Error fetching books by title:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

module.exports.general = public_users;
