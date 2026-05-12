const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  id: String,
  nome: String,
  email: String,
  senha: String,
});

module.exports = mongoose.model("Account", accountSchema);