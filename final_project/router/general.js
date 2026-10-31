const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const users = require('./auth_users.js').users;

const general = express.Router();
const baseUrl = process.env.BOOKS_API_URL || `http://localhost:${process.env.PORT || 5000}`;

const findBooks = (field, value) => Object.entries(books)
  .filter(([, book]) => book[field].toLowerCase() === value.toLowerCase())
  .map(([isbn, book]) => ({ isbn, ...book }));

general.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Unable to register user: Missing username or password.' });
  }
  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: 'User already exists!' });
  }

  users.push({ username, password });
  return res.status(200).json({
    message: 'Customer successfully registered. Now you can login'
  });
});

general.get('/', (req, res) => {
  Promise.resolve(books)
    .then((bookList) => res.status(200).json(bookList))
    .catch((error) => res.status(500).json({ message: error.message }));
});

general.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.status(200).json(book);
});

general.get('/author/:author', async (req, res) => {
  try {
    const matchingBooks = await Promise.resolve(findBooks('author', req.params.author));
    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: 'No books found for this author' });
    }
    return res.status(200).json(matchingBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

general.get('/title/:title', async (req, res) => {
  try {
    const matchingBooks = await Promise.resolve(findBooks('title', req.params.title));
    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: 'No books found with this title' });
    }
    return res.status(200).json(matchingBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

general.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.status(200).json(book.reviews);
});

const getBookListAxios = async () => (await axios.get(`${baseUrl}/`)).data;
const getBookByISBNAxios = (isbn) => axios.get(`${baseUrl}/isbn/${encodeURIComponent(isbn)}`)
  .then((response) => response.data);
const getBooksByAuthorAxios = async (author) => (
  await axios.get(`${baseUrl}/author/${encodeURIComponent(author)}`)
).data;
const getBooksByTitleAxios = async (title) => (
  await axios.get(`${baseUrl}/title/${encodeURIComponent(title)}`)
).data;

module.exports = {
  general,
  getBookListAxios,
  getBookByISBNAxios,
  getBooksByAuthorAxios,
  getBooksByTitleAxios
};
