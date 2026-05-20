const treinoSchema = new mongoose.Schema({
  id: String,
  nome: { type: String, required: true },
  dia: { type: String, required: false }, // esta como String porque quem escolhe o dia que vai ser realizado o treino é o usuario
  data: { type: Date, required: true },
  treino: { type: [String], default: [] },
});

module.exports = mongoose.model("Treino", treinoSchema);
