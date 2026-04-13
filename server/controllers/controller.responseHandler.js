const { decrypt } = require("./controller.criptography");

async function responseHandler(
  req,
  res,
  controllerMethod,
  responseKey,
  ...argument
) {
  const retorno = {};
  const INICIAL = performance.now();
  if (req.debug) {
    console.log(
      req.ip.split(":")[3],
      controllerMethod.name,
      "debug:",
      req.debug,
    );
  }

  try {
    try {
      req.user.sie = decrypt(req.user.sie);
    } catch {
      if (typeof req.user?.sie === "string" && req.user.sie.length > 5) {
        throw { msg: "405", campo: "responseHandler", conteudo: "" };
      }
    }

    retorno[responseKey] =
      argument.length === 0
        ? await controllerMethod(req.user, req)
        : await controllerMethod(req.user, ...argument);
    retorno.operacaoFinalizada = true;
    retorno.mensagem = { msg: "100: PROCESSO CONCLUIDO COM SUCESSO;" };
    const FINAL = performance.now();
    runtime = FINAL - INICIAL;
    retorno.runtime = runtime.toFixed(2);
  } catch (error) {
    error.contexto = req.user?.contexto || "NaoDefinido";
    console.log(error);
    let logNum;
    let ex;
    if (error.campo) {
      ex = new CustomError(
        error.msg || error.message || error.mensagem,
        error.campo,
        error.conteudo,
        error.detalhe || "",
      );
      ex.contexto = req.user?.contexto || "NaoDefinido";
      logNum = await recordOcorrencia(req, ex, controllerMethod.name);
    } else {
      ex = new CustomError(
        `209`,
        controllerMethod.name,
        req.body || req.query || req.params || "",
        error.message || error.mensagem || error,
        false,
      );
      ex.contexto = req.user?.contexto || "NaoDefinido";
      logNum = await recordOcorrencia(req, ex, controllerMethod.name);
    }
    retorno.operacaoFinalizada = false;
    retorno.mensagem = ex;
    const FINAL = performance.now();
    runtime = FINAL - INICIAL;
    retorno.runtime = runtime.toFixed(2);
  }
  res.json(retorno);
}

module.exports = responseHandler;
