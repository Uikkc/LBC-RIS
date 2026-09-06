export function calculateQaScore(indexing: string, type: string, authorShare: number = 100): number {
  let baseScore = 0.2;

  if (type === "BOOK_TEXTBOOK" || type === "BOOK") {
    baseScore = 1.0;
  } else if (type === "CREATIVE_WORK") {
    baseScore = 0.8;
  } else {
    switch (indexing) {
      case "SCOPUS_Q1":
      case "WOS":
        baseScore = 1.0;
        break;
      case "SCOPUS_Q2":
        baseScore = 0.9;
        break;
      case "SCOPUS_Q3":
      case "TCI_TIER_1":
        baseScore = 0.8;
        break;
      case "SCOPUS_Q4":
        baseScore = 0.7;
        break;
      case "TCI_TIER_2":
        baseScore = 0.6;
        break;
      case "INTERNATIONAL_CONF":
      case "INTL_CONF":
        baseScore = 0.4;
        break;
      case "NATIONAL_CONF":
        baseScore = 0.2;
        break;
      default:
        baseScore = 0.2;
    }
  }

  const weightedScore = (baseScore * Math.min(100, Math.max(0, authorShare))) / 100;
  return Number(weightedScore.toFixed(2));
}

export function formatBuddhistYear(adYear: number | Date): number {
  const year = typeof adYear === 'number' ? adYear : adYear.getFullYear();
  return year > 2400 ? year : year + 543;
}
