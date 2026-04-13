require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET = process.env.NODE_API_KEY;
const jwtExppirySeconds = 86400;
const getToken = (payload) => {
  const token = jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: jwtExppirySeconds,
  });
  return token;
};

const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"] || req.query.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Valida e decodifica o token
    const decoded = jwt.verify(token, SECRET);

    // Adiciona o ID do usuário na requisição
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { getToken, verifyJWT };
