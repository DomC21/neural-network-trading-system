import { ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function OverviewSection() {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-panels')
    demoSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-4xl sm:text-5xl font-bold">
          Lukz: Turning Financial Data into Actionable Insights
        </CardTitle>
        <CardDescription className="text-xl">
          Powered by the Unusual Whales API
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-3xl mx-auto space-y-8">
        <div className="grid gap-6 text-lg">
          <p className="leading-relaxed">
            Discover powerful financial insights through our comprehensive analysis platform. Lukz leverages cutting-edge technology to transform complex market data into clear, actionable intelligence.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Real-time analysis of Congress trades, insider activity, and premium flow data</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>AI-powered insights using ChatGPT for instant market interpretation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Dynamic visualizations showcasing market trends and opportunities</span>
            </li>
          </ul>
        </div>
        <div className="flex justify-center">
          <Button
            size="lg"
            className="group"
            onClick={scrollToDemo}
          >
            Explore Lukz Now
            <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
