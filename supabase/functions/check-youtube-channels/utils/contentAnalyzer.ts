export const categoryKeywords = {
  Politics: [
    "politique", "gouvernement", "élection", "président", "ministre", "assemblée",
    "parlement", "démocratie", "loi", "réforme", "état", "constitution",
    "député", "sénat", "vote", "électeur", "campagne", "parti"
  ],
  Economy: [
    "économie", "finance", "marché", "entreprise", "croissance", "inflation",
    "investissement", "bourse", "budget", "commerce", "emploi", "pib",
    "dette", "banque", "monnaie", "euro", "dollar", "crise"
  ],
  Science: [
    "science", "recherche", "découverte", "étude", "laboratoire", "expérience",
    "scientifique", "biologie", "physique", "chimie", "théorie", "cerveau",
    "neuroscience", "cognition", "intelligence", "évolution", "nature"
  ],
  Technology: [
    "technologie", "innovation", "numérique", "intelligence artificielle", "ia",
    "robot", "internet", "digital", "informatique", "tech", "application",
    "algorithme", "données", "cybersécurité", "blockchain", "startup"
  ],
  Culture: [
    "culture", "art", "musique", "cinéma", "littérature", "théâtre",
    "exposition", "spectacle", "festival", "patrimoine", "histoire",
    "philosophie", "société", "civilisation", "tradition"
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
}

export function analyzeContent(title: string, description: string): string[] {
  const content = (title + " " + description).toLowerCase()
  const categories = new Set<string>()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        categories.add(category)
        break
      }
    }
  }

  return categories.size > 0 ? Array.from(categories) : ["News"]
}