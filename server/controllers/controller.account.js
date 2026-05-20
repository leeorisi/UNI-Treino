const { getToken } = require("../middleware/middleware.jwtoken");
const runValidation = require("../handlers/utils");
const LoginFieldsValidator = require("../handlers/ConcreteHandlers/LoginFieldsValidator");
const ResetPassFieldsValidator = require("../handlers/ConcreteHandlers/ResetPassFieldsValidator");
const PasswordStrengthValidator = require("../handlers/ConcreteHandlers/PasswordStrengthValidator");
const EmailSentValidator = require("../handlers/ConcreteHandlers/EmailSentValidator");
const ResetCodeValidator = require("../handlers/ConcreteHandlers/ResetCodeValidator");
const NotPreviousPasswordValidator = require("../handlers/ConcreteHandlers/NotPreviousPasswordValidator");
const EmailFormatValidator = require("../handlers/ConcreteHandlers/EmailFormatValidator");
const PasswordMatchValidator = require("../handlers/ConcreteHandlers/PasswordMatchValidator");
const Account = require("../models/model.account");
const { hashPassword, verifyPassword } = require("../config/auth");
const { default: sendResetPasswordEmail } = require("../models/model.mailer");
const crypto = require("crypto");

async function postLoginController(body) {
  const { email, password } = body;

  // 1. Valida campos obrigatorios e formato do e-mail (sincrono)
  const fieldChain = new LoginFieldsValidator();
  fieldChain.setNext(new EmailFormatValidator());
  const fieldResult = fieldChain.handle({ email, password });
  if (!fieldResult.success) throw fieldResult;

  // 2. Busca usuario no banco
  const user = await Account.findOne({ email });
  if (!user) {
    throw { success: false, message: "Usuario ou senha invalidos.", campo: "email" };
  }

  // 3. Compara a senha usando bcrypt (verifyPassword = bcrypt.compare)
  const senhaValida = await verifyPassword(password, user.senha);
  if (!senhaValida) {
    throw { success: false, message: "Usuario ou senha invalidos.", campo: "senha" };
  }

  // 4. Gera o JWT com dados do usuario no payload
  const accessToken = getToken({
    id: String(user._id),
    email: user.email,
    nome: user.nome,
  });

  return { success: true, accessToken };
}

async function postRegisterController(req) {
  let { nome, email, senha } = req;

  const hash = await hashPassword(senha);
  senha = hash;
  console.log(hash);
  const account = new Account({ nome, email, senha });

  const result = await account.save();

  return result;

}

async function postSendResetPasswordEmailController(req) {
  const { email } = req;

  try {
    const token = crypto.randomBytes(20).toString("hex");
    const now = new Date();

    // Salvar token no banco
    return sendResetPasswordEmail(email, token);
  } catch (err) {
    return { error: "Cannot reset password, try again", message: err };
  }
}

async function postResetPasswordController(req) {
  const resetPasswordChain = new ResetCodeValidator();
  resetPasswordChain
    .setNext(new PasswordMatchValidator())
    .setNext(new NotPreviousPasswordValidator())
    .setNext(new PasswordStrengthValidator());

  return runValidation(resetPasswordChain, req);
}

module.exports = {
  postLoginController,
  postSendResetPasswordEmailController,
  postResetPasswordController,
  postRegisterController,
};
