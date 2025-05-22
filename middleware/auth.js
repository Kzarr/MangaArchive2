function isAuthenticated(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  }
  res.redirect('/admin/login');
}

module.exports = isAuthenticated;
