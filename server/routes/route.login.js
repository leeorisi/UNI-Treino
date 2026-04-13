const express = require("express");
const router = express.Router();
const responseHandler = require("../controllers/controller.responseHandler");
const controller = require("../controllers/controller.login");

/**
 * @swagger
 * /v1/login:
 *   post:
 *     tags:
 *       - Login
 *     summary: Retorna token de acesso
 *     description: Retorna token de acesso para que possam ser feitas requisições ao back-end
 *     responses:
 *       200:
 *         description: Token gerado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
//  *     parameters:
//  *       - in: query
//  *         name: status
//  *         schema:
//  *           type: string
router.post("/", (req, res) => {
  responseHandler(req, res, controller.postTokenController, "Token", req);
});

module.exports = router;
