export const categoryKeywords = {
  Politics: [
    "politique", "gouvernement", "élection", "président", "ministre", "assemblée",
    "parlement", "démocratie", "loi", "réforme", "état", "constitution",
    "député", "sénat", "vote", "électeur", "campagne", "parti", "pouvoir",
    "idéologie", "géopolitique", "diplomatie", "nation", "souveraineté",
    "citoyen", "droits", "libertés", "justice", "institution"
  ],
  Economy: [
    "économie", "finance", "marché", "entreprise", "croissance", "inflation",
    "investissement", "bourse", "budget", "commerce", "emploi", "pib",
    "dette", "banque", "monnaie", "euro", "dollar", "crise", "richesse",
    "capital", "profit", "business", "entrepreneur", "startup", "innovation",
    "management", "industrie", "production", "consommation", "développement"
  ],
  Science: [
    "science", "recherche", "découverte", "étude", "laboratoire", "expérience",
    "scientifique", "biologie", "physique", "chimie", "théorie", "cerveau",
    "neuroscience", "cognition", "intelligence", "évolution", "nature",
    "méthode", "hypothèse", "preuve", "démonstration", "observation",
    "expérimentation", "innovation", "progrès", "connaissance"
  ],
  Technology: [
    "technologie", "innovation", "numérique", "intelligence artificielle", "ia",
    "robot", "internet", "digital", "informatique", "tech", "application",
    "algorithme", "données", "cybersécurité", "blockchain", "startup",
    "machine learning", "deep learning", "big data", "cloud", "réseau",
    "programmation", "logiciel", "hardware", "software", "automation"
  ],
  Culture: [
    "culture", "art", "musique", "cinéma", "littérature", "théâtre",
    "exposition", "spectacle", "festival", "patrimoine", "histoire",
    "philosophie", "société", "civilisation", "tradition", "éducation",
    "savoir", "connaissance", "apprentissage", "enseignement", "formation"
  ],
  News: [
    "actualité", "information", "news", "journal", "média", "reportage",
    "événement", "direct", "breaking", "dernière minute", "analyse",
    "débat", "interview", "chronique", "édito"
  ],
  Humour: [
    "humour", "comédie", "blague", "rire", "sketch", "stand-up",
    "parodie", "satire", "comique", "drôle", "gag", "amusant",
    "divertissement", "humoriste"
  ],
  Musique: [
    "musique", "chanson", "concert", "album", "artiste", "groupe",
    "clip", "son", "mélodie", "rythme", "instrument", "musicien",
    "compositeur", "production", "live", "performance"
  ]
};

export function analyzeContent(title: string, description: string): string[] {
  const content = (title + " " + description).toLowerCase();
  const categories = new Set<string>();
  let categoryScores: { [key: string]: number } = {};

  // Initialiser les scores
  for (const category of Object.keys(categoryKeywords)) {
    categoryScores[category] = 0;
  }

  // Calculer les scores pour chaque catégorie
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        categoryScores[category]++;
      }
    }
  }

  // Sélectionner les catégories avec un score significatif (au moins 2 mots-clés)
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score >= 2) {
      categories.add(category);
    }
  }

  return categories.size > 0 ? Array.from(categories) : ["News"];
}