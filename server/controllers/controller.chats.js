const Chat = require("../models/model.chat");

async function getListarChatsController() {
  const chats = await Chat.find()
    .populate("user", "nome email")
    .sort({ createdAt: -1 });
  return chats;
}

async function getListarMeusChatsController(body, req) {
  const userId = req?.user?.id;
  if (!userId) throw { success: false, message: "Usuário não autenticado." };

  const chats = await Chat.find({ user: userId }).sort({ createdAt: -1 });
  return chats;
}

async function getChatController(body, req) {
  const id = req?.params?.id;
  const userId = req?.user?.id;

  if (!id)
    throw { success: false, message: "ID do chat não informado.", campo: "id" };

  const chat = await Chat.find({ id: id, user: userId });
  if (!chat) throw { success: false, message: "Chat não encontrado." };

  return { success: true, chat };
}

async function postCriarChatController(body, req) {
  const userId = req?.user?.id;
  const { id, mensagem, resposta, msgIdUsuario, msgIdBot } = body;
  const chat = await Chat.find({ id: id });

  if (chat.length > 0) {
    return { success: true, chat };
  }

  if (!userId) throw { success: false, message: "Usuário não autenticado." };
  if (!mensagem || !mensagem.trim()) {
    throw {
      success: false,
      message: "Mensagem não pode ser vazia.",
      campo: "mensagem",
    };
  }

  const historicoInicial = [
    {
      id: msgIdUsuario || `user-${Date.now()}`,
      tipo: "usuario",
      conteudo: mensagem.trim(),
    },
  ];

  if (resposta) {
    historicoInicial.push({
      id: msgIdBot || `bot-${Date.now()}`,
      tipo: "bot",
      conteudo: resposta.trim(),
    });
  }

  const tituloChat =
    mensagem.length > 30 ? `${mensagem.substring(0, 30)}...` : mensagem;

  const novoChat = new Chat({
    id: id,
    user: userId,
    titulo: tituloChat,
    historico: historicoInicial,
  });
  const resultado = await novoChat.save();
  return { success: true, chat: resultado };
}

async function deleteRemoverChatController(body, req) {
  const id = req?.params?.id;
  const userId = req?.user?.id;

  if (!id) {
    throw { success: false, message: "ID do chat não informado.", campo: "id" };
  }

  const chat = await Chat.findOne({ id: id, user: userId });

  if (!chat) {
    throw { success: false, message: "Chat não encontrado." };
  }

  await chat.deleteOne();

  return { success: true, message: "Chat removido com sucesso." };
}

async function postAdicionarMensagemController(body, req) {
  const id = req?.params?.id;
  const userId = req?.user?.id;
  const { mensagem, resposta, msgIdUsuario, msgIdBot } = body;

  if (!id) throw { success: false, message: "ID do chat não informado." };

  const chat = await Chat.findOne({ id: id, user: userId });
  if (!chat)
    throw { success: false, message: "Chat não encontrado ou acesso negado." };

  if (mensagem) {
    chat.historico.push({
      id: msgIdUsuario || `user-${Date.now()}`,
      tipo: "usuario",
      conteudo: mensagem,
    });
  }
  if (resposta) {
    chat.historico.push({
      id: msgIdBot || `bot-${Date.now()}`,
      tipo: "bot",
      conteudo: resposta,
    });
  }

  await chat.save();
  return { success: true, chat };
}

module.exports = {
  getListarChatsController,
  getListarMeusChatsController,
  getChatController,
  postCriarChatController,
  postAdicionarMensagemController,
  deleteRemoverChatController,
};
