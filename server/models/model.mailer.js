const { MailtrapClient } = require("mailtrap");

export const client = () => {
  try {
    new MailtrapClient({
      token: process.env.MAILTRAP_TOKEN,
    });
    console.log("Cliente Mailtrap criado com sucesso");
  } catch (err) {
    console.error("Erro ao criar Mailtrap:", err);
  }
};

export default function sendResetPasswordEmail(recipient, token) {
  const sender = {
    email: "hello@demomailtrap.co",
    name: "UniTreino",
  };

  client
    .send({
      from: sender,
      to: recipient,
      template: "views/passwordResetEmail",
      category: "Integration Test",
      context: { token },
    })
    .then(console.log, console.error);
}
