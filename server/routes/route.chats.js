const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.chats");
const { verifyJWT } = require("../middleware/middleware.jwtoken");


router.get("/all", verifyJWT, (req, res) => {
  responseHandler(req, res, controller.getListarChatsController, "result");
});


router.get("/", verifyJWT, (req, res) => {
  responseHandler(req, res, controller.getListarMeusChatsController, "result");
});


router.get("/:id", verifyJWT, (req, res) => {
  responseHandler(req, res, controller.getChatController, "result");
});


router.post("/", verifyJWT, (req, res) => {
  responseHandler(req, res, controller.postCriarChatController, "result");
});


router.delete("/:id", verifyJWT, (req, res) => {
  responseHandler(req, res, controller.deleteRemoverChatController, "result");
});


router.post("/:id/mensagem", verifyJWT, (req, res) => {
  responseHandler(
    req,
    res,
    controller.postAdicionarMensagemController,
    "result",
  );
});

module.exports = router;
