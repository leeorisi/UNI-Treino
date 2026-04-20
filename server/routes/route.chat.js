const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.chat.js");

router.get("/", (req, res) => {
  responseHandler(
    req,
    res,
    controller.getEnviarMensagemController,
    "Mensagem",
    req,
  );
});

module.exports = router;
