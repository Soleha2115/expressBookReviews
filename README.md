# Online Bookstore and Book Reviews

Express API for browsing books, registering customers, and managing authenticated
book reviews. The project files are in [`final_project/`](final_project/).

## Run locally

```bash
cd final_project
npm install
npm start
```

The API listens on port `5000` by default. Set `PORT`, `SESSION_SECRET`, and
`JWT_SECRET` to override the local defaults.

## Endpoints

- `GET /` lists all books.
- `GET /isbn/:isbn`, `GET /author/:author`, and `GET /title/:title` find books.
- `GET /review/:isbn` lists reviews for a book.
- `POST /register` registers a customer; `POST /customer/login` starts a session.
- `PUT /customer/auth/review/:isbn` adds or updates the logged-in customer's
	review. Pass `review` as a query parameter or JSON field.
- `DELETE /customer/auth/review/:isbn` deletes the logged-in customer's review.

The starter data and customer accounts are stored in memory and reset when the
server restarts. This project is intended for the course assignment, not
production use.