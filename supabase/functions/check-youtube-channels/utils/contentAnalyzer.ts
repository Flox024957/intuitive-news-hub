export const categoryKeywords = {
  Politics: [
    "politique", "gouvernement", "élection", "président", "ministre", "assemblée",
    "parlement", "démocratie", "loi", "réforme", "état", "constitution",
    "député", "sénat", "vote", "électeur", "campagne", "parti"
  ],
  Economy: [
    "économie", "finance", "marché", "entreprise", "croissance", "inflation",
    "investissement", "bourse", "commerce", "business", "startup", "innovation",
    "entrepreneur", "management", "stratégie", "emploi", "budget", "dette"
  ],
  Technology: [
    "technologie", "numérique", "intelligence artificielle", "digital", "tech",
    "ia", "algorithme", "données", "informatique", "cybersécurité", "blockchain",
    "robot", "internet", "web", "mobile", "innovation"
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
  PersonalDevelopment: [
    "développement personnel", "croissance personnelle", "motivation", "productivité",
    "bien-être", "mindset", "coaching", "leadership", "succès", "objectifs",
    "habitudes", "psychologie", "méditation"
  ],
  Entertainment: [
    "divertissement", "humour", "comédie", "blague", "rire", "sketch", "stand-up",
    "parodie", "satire", "comique", "drôle", "gag", "amusant", "humoriste"
  ]
};

export function analyzeContent(title: string, description: string): string[] {
  const content = (title + " " + description).toLowerCase();
  const categories = new Set<string>();

  // Map French categories to valid enum values
  const categoryMapping: { [key: string]: string } = {
    'Politics': 'politics',
    'Economy': 'economy',
    'Technology': 'technology',
    'Culture': 'culture',
    'News': 'news',
    'PersonalDevelopment': 'personal_development',
    'Entertainment': 'entertainment'
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        const mappedCategory = categoryMapping[category];
        if (mappedCategory) {
          categories.add(mappedCategory);
        }
        break;
      }
    }
  }

  // If no category detected, set to news by default
  if (categories.size === 0) {
    categories.add('news');
  }

  return Array.from(categories);
}