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
const bcrypt = require('bcryptjs');



async function deleteRemoverLesaoController(body, params, req) {
    const { index } = params; 
    const userId = req.user.id;

    const usuario = await Account.findById(userId);
    if (!usuario) {
        throw { success: false, message: "Usuário não encontrado." };
    }

    if (index > -1 && index < usuario.lesoes.length) {
        usuario.lesoes.splice(index, 1);
        await usuario.save();
    }

    return { success: true, lesoes: usuario.lesoes };
}


async function getListarLesoesController(body, params, req) {
    const userId = req.user.id;
    const usuario = await Account.findById(userId);
    if (!usuario) {
        throw { success: false, message: "Usuário não encontrado." };
    }
    return { success: true, lesoes: usuario.lesoes };
}

module.exports = {
    postAdicionarLesaoController, 
    deleteRemoverLesaoController, 
    getListarLesoesController 
};