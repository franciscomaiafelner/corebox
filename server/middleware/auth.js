const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Obter o token do cabeçalho do pedido
  const token = req.header('x-auth-token');

  // 2. Verificar se não existe token
  if (!token) {
    return res.status(401).json({ msg: 'Não há token, autorização negada' });
  }

  // 3. Se houver token, vamos verificá-lo
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adicionar o utilizador (que está no payload do token) ao objeto do pedido
    req.user = decoded.user;
    next(); // Passar para a próxima função (a nossa rota)
  } catch (err) {
    res.status(401).json({ msg: 'Token não é válido' });
  }
};