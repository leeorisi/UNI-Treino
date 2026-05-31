/**
 * Catálogo de exercícios com ilustrações pré-carregadas.
 * As imagens ficam em /public/exercises/
 */
const exerciseCatalog = [
  // ── PEITO ──
  {
    id: "supino_reto",
    nome: "Supino Reto",
    grupo: "Peito",
    imagem: "/exercises/supino_reto.png",
    video: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
  },
  {
    id: "crucifixo",
    nome: "Crucifixo",
    grupo: "Peito",
    imagem: "/exercises/crucifixo.png",
    video: "https://www.youtube.com/watch?v=eozdVDA78K0",
  },

  // ── COSTAS ──
  {
    id: "puxada_frontal",
    nome: "Puxada Frontal",
    grupo: "Costas",
    imagem: "/exercises/puxada_frontal.png",
    video: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
  },
  {
    id: "remada_curvada",
    nome: "Remada Curvada",
    grupo: "Costas",
    imagem: "/exercises/remada_curvada.png",
    video: "https://www.youtube.com/watch?v=kBWAon7ItDw",
  },

  // ── OMBROS ──
  {
    id: "desenvolvimento",
    nome: "Desenvolvimento",
    grupo: "Ombros",
    imagem: "/exercises/desenvolvimento.png",
    video: "https://www.youtube.com/watch?v=qEwKCR5JCog",
  },
  {
    id: "elevacao_lateral",
    nome: "Elevação Lateral",
    grupo: "Ombros",
    imagem: "/exercises/elevacao_lateral.png",
    video: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
  },

  // ── BRAÇOS ──
  {
    id: "rosca_direta",
    nome: "Rosca Direta",
    grupo: "Bíceps",
    imagem: "/exercises/rosca_direta.png",
    video: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
  },
  {
    id: "triceps_pulley",
    nome: "Tríceps Pulley",
    grupo: "Tríceps",
    imagem: "/exercises/triceps_pulley.png",
    video: "https://www.youtube.com/watch?v=2-LAMcpzODU",
  },

  // ── PERNAS ──
  {
    id: "agachamento",
    nome: "Agachamento Livre",
    grupo: "Pernas",
    imagem: "/exercises/agachamento.png",
    video: "https://www.youtube.com/watch?v=ultWZbUMPL8",
  },
  {
    id: "leg_press",
    nome: "Leg Press",
    grupo: "Pernas",
    imagem: "/exercises/leg_press.png",
    video: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
  },
  {
    id: "extensao_pernas",
    nome: "Extensão de Pernas",
    grupo: "Pernas",
    imagem: "/exercises/extensao_pernas.png",
    video: "https://www.youtube.com/watch?v=YyvSfVjQeL0",
  },
  {
    id: "stiff",
    nome: "Stiff",
    grupo: "Posterior",
    imagem: "/exercises/stiff.png",
    video: "https://www.youtube.com/watch?v=1uDiW5--rAE",
  },
  {
    id: "levantamento_terra",
    nome: "Levantamento Terra",
    grupo: "Posterior",
    imagem: "/exercises/levantamento_terra.png",
    video: "https://www.youtube.com/watch?v=op9kVnSso6Q",
  },
  {
    id: "panturrilha",
    nome: "Panturrilha em Pé",
    grupo: "Pernas",
    imagem: "/exercises/panturrilha.png",
    video: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
  },

  // ── CORE ──
  {
    id: "abdominal",
    nome: "Abdominal",
    grupo: "Core",
    imagem: "/exercises/abdominal.png",
    video: "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
  },
  {
    id: "prancha",
    nome: "Prancha",
    grupo: "Core",
    imagem: "/exercises/prancha.png",
    video: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
  },
];

/** Agrupado por grupo muscular para exibição visual */
export function getExercisesByGroup() {
  const groups = {};
  for (const ex of exerciseCatalog) {
    if (!groups[ex.grupo]) groups[ex.grupo] = [];
    groups[ex.grupo].push(ex);
  }
  return groups;
}

/** Busca por nome (case-insensitive, parcial) */
export function searchExercises(query) {
  if (!query) return exerciseCatalog;
  const q = query.toLowerCase();
  return exerciseCatalog.filter(
    (ex) =>
      ex.nome.toLowerCase().includes(q) ||
      ex.grupo.toLowerCase().includes(q),
  );
}

/** Busca por ID */
export function getExerciseById(id) {
  return exerciseCatalog.find((ex) => ex.id === id) || null;
}

export default exerciseCatalog;
