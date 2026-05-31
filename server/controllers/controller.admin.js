const Account = require("../models/model.account");

async function getListarUsuariosController(req) {
  const usuarios = await Account.find({}, '_id nome email role');
  
  return usuarios.map((u) => ({
    id: String(u._id),
    nome: u.nome,
    email: u.email,
    role: u.role
  }));
}


async function putAtualizarUsuarioController(req) {
  const { id } = req.params;
  const { role } = req.body; 

  const usuarioAtualizado = await Account.findByIdAndUpdate(
    id,
    { role },
    { new: true, select: '_id nome email role' }
  );

  if (!usuarioAtualizado) {
    throw { success: false, message: "Usuário não encontrado." };
  }

  return {
    id: String(usuarioAtualizado._id),
    nome: usuarioAtualizado.nome,
    email: usuarioAtualizado.email,
    role: usuarioAtualizado.role
  };
}

module.exports = { 
  getListarUsuariosController, 
  putAtualizarUsuarioController 
};