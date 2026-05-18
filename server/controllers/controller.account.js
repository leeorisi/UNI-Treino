const { getToken } = require("../middleware/middleware.jwtoken");
const runValidation = require("../handlers/utils");
const LoginFieldsValidator = require("../handlers/ConcreteHandlers/LoginFieldsValidator");
const ResetPassFieldsValidator = require("../handlers/ConcreteHandlers/ResetPassFieldsValidator");
const UserValidator = require("../handlers/ConcreteHandlers/UserValidator");
const PasswordStrengthValidator = require("../handlers/ConcreteHandlers/PasswordStrengthValidator");
const UserExistsValidator = require("../handlers/ConcreteHandlers/UserValidator");
const EmailSentValidator = require("../handlers/ConcreteHandlers/EmailSentValidator");
const ResetCodeValidator = require("../handlers/ConcreteHandlers/ResetCodeValidator");
const NotPreviousPasswordValidator = require("../handlers/ConcreteHandlers/NotPreviousPasswordValidator");
const EmailFormatValidator = require("../handlers/ConcreteHandlers/EmailFormatValidator");
const PasswordMatchValidator = require("../handlers/ConcreteHandlers/PasswordMatchValidator");
const Account = require("../models/model.account");
const { hashPassword } = require("../config/auth");

async function postLoginController(req, res) {
  const loginChain = new LoginFieldsValidator();
  loginChain.setNext(new EmailFormatValidator()).setNext(new UserValidator());

  res = runValidation(
    loginChain,
    req,
    (onSuccess = () => {
      return { success: true, accessToken: getToken({}) };
    }),
  );

  return res;
}

async function postRegisterController(req, res) {
  let { nome, email, senha } = req;
  
  const hash = await hashPassword(senha);
  senha = hash;
  console.log(hash)
  const account = new Account({ nome, email, senha });

  res = await account.save();

  return res;
}

async function postSendResetPasswordEmailController(req, res) {
  // Logica
  return {sucesso: true, email: req.email, codigo: 123}; // JSON que sera retornado
}

async function postResetPasswordController(req, res) {
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
