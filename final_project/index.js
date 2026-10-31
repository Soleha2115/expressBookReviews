const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'access';

app.use(express.json());
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'fingerprint_customer',
  resave: false,
  saveUninitialized: false
}));

app.use('/customer/auth/*', (req, res, next) => {
  const accessToken = req.session?.authorization?.accessToken;
  if (!accessToken) {
    return res.status(403).json({ message: 'User not logged in' });
  }

  jwt.verify(accessToken, jwtSecret, (error, user) => {
    if (error) {
      return res.status(403).json({ message: 'User not authenticated' });
    }
    req.user = user;
    return next();
  });
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

if (require.main === module) {
  app.listen(port, () => console.log(`Server is running on port ${port}`));
}

module.exports = app;
