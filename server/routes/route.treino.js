const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.treino");

router.get("/", (req, res) => {
  responseHandler(req, res, controller.getListarTreinosController, "result");
});

router.post("/", (req, res) => {
  responseHandler(req, res, controller.postCriarTreinoController, "result");
});

router.put("/:id", (req, res) => {
  responseHandler(req, res, controller.putAtualizarTreinoController, "result", req.params);
});

router.delete("/:id", (req, res) => {
  responseHandler(req, res, controller.deleteRemoverTreinoController, "result", req.params);
});

router.get("/:id/exercicios", (req, res) => {
  responseHandler(req, res, controller.getListarExerciciosController, "result", req.params);
});

router.post("/:id/exercicios", (req, res) => {
  responseHandler(req, res, controller.postAdicionarExercicioController, "result", req.params);
});

router.delete("/:id/exercicios/:exercicioId", (req, res) => {
  responseHandler(req, res, controller.deleteRemoverExercicioController, "result", req.params);
});

module.exports = router;