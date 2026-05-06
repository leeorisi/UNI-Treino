const mongoose = require("mongoose");

export default async (connectDB) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB conectado com sucesso!");
  } catch (e) {
    console.error(e);
  }
};
