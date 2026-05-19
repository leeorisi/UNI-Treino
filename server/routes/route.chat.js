const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.chat.js");
const { verifyJWT } = require("../middleware/middleware.jwtoken");

// verifyJWT valida o token JWT do header Authorization
// e injeta req.user = { id, email, nome } para o controller usar
router.post("/", verifyJWT, (req, res) => {
  responseHandler(req, res, controller.postEnviarMensagemController, "Mensagem");
});

module.exports = router;
