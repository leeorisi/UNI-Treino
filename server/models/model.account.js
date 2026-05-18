const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  id: String,
  nome: {type: String, required: true},
  email: {type: String, unique:true, required: true},
  senha: {type: String, required: true},
});

module.exports = mongoose.model("Account", accountSchema);