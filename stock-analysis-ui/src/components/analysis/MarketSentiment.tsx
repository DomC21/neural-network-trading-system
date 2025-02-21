
import { Card } from "../ui/card";
import { FC } from "react";
import { cn } from "@/lib/utils";

interface MarketSentimentProps {
  data: {
    ai_insight?: string;
  };
}

export const MarketSentiment: FC<MarketSentimentProps> = ({ data }) => {
  const sections = data?.ai_insight?.split('\n\n').filter(Boolean) || [];

  const renderSections = () => {
    if (sections.length === 0) {
      return <p className="text-white">No analysis available</p>;
    }

    return sections.map((section, sectionIndex) => (
      <div key={sectionIndex} className="space-y-2">
        {section.split('\n').map((paragraph, index) => (
          <p 
            key={`${sectionIndex}-${index}`} 
            className="text-white whitespace-pre-wrap"
          >
            {paragraph}
          </p>
        ))}
      </div>
    ));
  };

  return (
    <Card className={cn("p-6 bg-zinc-900", "border-gold")}>
      <h2 className={cn("text-xl font-semibold mb-4", "text-gold")}>
        Market Sentiment & Macroeconomic Analysis
      </h2>
      <div className="prose prose-invert max-w-none space-y-6">
        {renderSections()}
      </div>
    </Card>
  );
};
