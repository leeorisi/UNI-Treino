function isAdmin(req, res, next) {
  // Presume-se que o middleware verifyJWT injete os dados do token decodificado em req.user
  // Se o verifyJWT injetar em outro lugar (ex: req.account), ajuste 'req.user' de acordo
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ 
    success: false, 
    error: 'Acesso negado. Requer privilégios de administrador.' 
  });
}

module.exports = { isAdmin };