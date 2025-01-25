interface PredefinedResponse {
  keywords: string[];
  response: string;
}

export const predefinedResponses: PredefinedResponse[] = [
  {
    keywords: ['improve', 'unprofitable', 'services'],
    response: "To improve unprofitable services, consider reducing fixed costs, renegotiating supplier contracts, or discontinuing low-demand services. Additionally, explore targeted marketing efforts for services with potential demand."
  },
  {
    keywords: ['profit', 'margins', 'under', '20'],
    response: "For services with low profit margins, analyze fixed and variable costs to identify inefficiencies. If demand is low, evaluate whether to scale back operations or discontinue the service."
  },
  {
    keywords: ['optimization', 'optimize', 'improve'],
    response: "For optimization, streamline operations to reduce costs, adjust pricing to better reflect value, and implement targeted campaigns to boost visibility."
  },
  {
    keywords: ['profitable', 'high performance'],
    response: "For highly profitable services, consider scaling operations through increased marketing investment, expanding the contractor team, and exploring opportunities in related market segments."
  },
  {
    keywords: ['recommendations', 'suggest'],
    response: "Based on our analysis, focus on three key areas: 1) Cost optimization through operational efficiency, 2) Strategic pricing adjustments based on market demand, and 3) Resource allocation optimization to maximize ROI."
  }
];

export function findBestResponse(input: string): string {
  const lowercaseInput = input.toLowerCase();
  let bestMatch = {
    response: "I apologize, but I'm not sure how to help with that specific query. Try asking about service optimization, profitability analysis, or specific recommendations for improving service performance.",
    matchCount: 0
  };

  predefinedResponses.forEach(({ keywords, response }) => {
    const matchCount = keywords.filter(keyword => 
      lowercaseInput.includes(keyword.toLowerCase())
    ).length;

    if (matchCount > bestMatch.matchCount) {
      bestMatch = { response, matchCount };
    }
  });

  return bestMatch.response;
}
