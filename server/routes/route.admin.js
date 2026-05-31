const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.admin");
const { verifyJWT } = require("../middleware/middleware.jwtoken");
const { isAdmin } = require("../middleware/middleware.admin"); 

router.get("/usuarios", verifyJWT, isAdmin, (req, res) => {
  responseHandler(req, res, () => controller.getListarUsuariosController(req), "result");
});

router.put("/usuarios/:id", verifyJWT, isAdmin, (req, res) => {
  responseHandler(req, res, () => controller.putAtualizarUsuarioController(req), "result");
});

module.exports = router;