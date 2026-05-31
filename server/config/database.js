const mongoose = require("mongoose");
const dns = require("dns");
const dotenv = require("dotenv");

dotenv.config();

function connectDB() {
  // Configura DNS públicos para evitar falha de resolução SRV
  // quando o DNS local (127.0.0.1) não responde
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Conectado ao MongoDB"))
    .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));
}

module.exports = { connectDB };

