const axios = require("axios");
const Account = require("../models/model.account");
require("dotenv").config();

const GEMINI_APIKEY = process.env.GEMINI_APIKEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Monta o system prompt da IA com:
 *  - Restricao ao tema academia/treinos (UniFor)
 *  - Lesoes do aluno para filtrar exercicios perigosos
 */
function buildSystemPrompt(lesoes = []) {
  const basePrompt = `
Voce e o UniTreino, assistente virtual de treinos da Academia UniFor (Universidade de Fortaleza).
Sua unica funcao e auxiliar os alunos com assuntos relacionados a academia e condicionamento fisico.

VOCE PODE ajudar com:
- Sugestao e planejamento de treinos (musculacao, funcional, cardio, etc.)
- Explicacao de execucao de exercicios
- Dicas de aquecimento, alongamento e recuperacao
- Orientacao sobre series, repeticoes e cargas
- Motivacao e habitos saudaveis relacionados a academia

VOCE NAO DEVE responder sobre:
- Culinaria, receitas ou dietas detalhadas (encaminhe para um nutricionista)
- Politica, entretenimento, tecnologia ou qualquer outro tema fora de academia
- Diagnosticos ou tratamentos medicos (recomende sempre um medico)
- Suplementacao com indicacao de marcas ou doses especificas

Caso o usuario pergunte algo fora do escopo, responda educadamente:
"Sou especializado apenas em treinos e condicionamento fisico. Para esse assunto, recomendo buscar um profissional adequado."

Seja sempre objetivo, motivador e seguro nas suas respostas.
  `.trim();

  const lesoesPrompt =
    lesoes.length > 0
      ? `\n\nRESTRICOES FISICAS DO ALUNO:\nEste aluno possui as seguintes lesoes ou limitacoes: ${lesoes.join(", ")}.\nSEMPRE leve isso em conta ao sugerir exercicios. Evite movimentos que possam agravar essas condicoes e proponha alternativas seguras quando necessario.`
      : "";

  return basePrompt + lesoesPrompt;
}

async function postEnviarMensagemController(body, req) {
  const { mensagem } = body;

  if (!mensagem || typeof mensagem !== "string" || !mensagem.trim()) {
    throw { success: false, message: "Mensagem nao pode ser vazia.", campo: "mensagem" };
  }

  // Busca lesoes do aluno pelo id que vem no JWT (decodificado pelo verifyJWT)
  let lesoes = [];
  try {
    const userId = req?.user?.id;
    if (userId) {
      const user = await Account.findById(userId).select("lesoes");
      lesoes = user?.lesoes ?? [];
    }
  } catch {
    // Se falhar, continua sem lesoes no prompt
  }

  const systemPrompt = buildSystemPrompt(lesoes);

  // Chama a API do Gemini
  const geminiResponse = await axios.post(
    GEMINI_URL,
    {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: mensagem.trim() }] }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_APIKEY,
      },
      timeout: 25000,
    }
  );

  const resposta =
    geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Nao foi possivel obter uma resposta no momento. Tente novamente.";

  return { Resposta: resposta };
}

module.exports = { postEnviarMensagemController };
