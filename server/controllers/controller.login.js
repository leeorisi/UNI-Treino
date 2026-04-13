const { getToken } = require("../middleware/middleware.jwtoken");

/**
 * Função para listar apartamentos
 * @param {object} user_info - Informações do usuário
 * @param {object} req - Requisição HTTP query: {status: 'Desocupado' | 'Manutencao' | 'Ocupado'}
 * @returns {object} - Retorna um objeto com a lista de apartamentos
 */
async function postTokenController(req, res) {
  res = getToken({});
  return res;
}

module.exports = { postTokenController };
