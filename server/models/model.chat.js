const mongoose = require("mongoose");

const mensagemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  tipo: { type: String, enum: ["usuario", "bot"], required: true },
  conteudo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  titulo: { type: String, default: "Nova conversa" },
  historico: [mensagemSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", chatSchema);
