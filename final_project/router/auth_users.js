const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const authenticated = express.Router();
const users = [];
const jwtSecret = process.env.JWT_SECRET || 'access';

const isValid = (username) => users.some((user) => user.username === username);
const authenticatedUser = (username, password) => users.some(
  (user) => user.username === username && user.password === password
);

authenticated.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const accessToken = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: 'Customer successfully logged in' });
});

authenticated.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review ?? req.body.review;
  const username = req.user?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'Review content missing' });
  }

  books[isbn].reviews[username] = review.trim();
  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews
  });
});

authenticated.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const username = req.user?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  if (!Object.hasOwn(books[isbn].reviews, username)) {
    return res.status(404).json({
      message: `No review found for user ${username} on ISBN ${isbn}`
    });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`
  });
});

module.exports = { authenticated, isValid, users };
