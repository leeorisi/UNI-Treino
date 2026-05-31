const mongoose = require("mongoose");

const exercicioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  series: { type: Number, required: true },
  repeticoes: { type: Number, required: true },
  carga: { type: Number, required: false, default: 0 },
  observacao: { type: String, required: false, default: "" },
  imagemUrl: { type: String, required: false, default: null },
  videoUrl: { type: String, required: false, default: null },
});

const treinoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: false, default: "" },
    dia: { type: String, required: false, default: "A definir" },
    ultima: { type: String, required: false, default: "Nunca realizado" },
    duracaoMinutos: { type: Number, required: true },
    foto: { type: String, required: false, default: null },
    exercicios: { type: [exercicioSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Treino", treinoSchema);
