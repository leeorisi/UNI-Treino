const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.chat.js");

router.post("/", (req, res) => {
  responseHandler(
    req,
    res,
    controller.postEnviarMensagemController,
    "Mensagem",
    req,
  );
});

module.exports = router;
