module.exports = function(req, res, next) {
  // Este middleware deve ser usado DEPOIS do middleware 'auth'.
  // Por isso, já temos acesso a req.user.

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Acesso negado. Rota apenas para administradores.' });
  }

  // Se o utilizador for um admin, segue para a rota.
  next();
};