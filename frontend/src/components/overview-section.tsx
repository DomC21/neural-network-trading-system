import { ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function OverviewSection() {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-panels')
    demoSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardHeader className="text-center space-y-6">
        <CardTitle className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-brand-cyan">
          Lukz: Turning Financial Data into Actionable Insights
        </CardTitle>
        <CardDescription className="text-xl text-brand-gray-300">
          Powered by the Unusual Whales API
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-3xl mx-auto space-y-12">
        <div className="grid gap-8 text-lg">
          <p className="leading-relaxed text-brand-gray-200">
            Discover powerful financial insights through our comprehensive analysis platform. Lukz leverages cutting-edge technology to transform complex market data into clear, actionable intelligence.
          </p>
          <ul className="space-y-6">
            <li className="flex items-start group">
              <span className="mr-3 text-brand-cyan">•</span>
              <span className="text-brand-gray-200 group-hover:text-brand-gray-100 transition-colors">Real-time analysis of Congress trades, insider activity, and premium flow data</span>
            </li>
            <li className="flex items-start group">
              <span className="mr-3 text-brand-cyan">•</span>
              <span className="text-brand-gray-200 group-hover:text-brand-gray-100 transition-colors">AI-powered insights using ChatGPT for instant market interpretation</span>
            </li>
            <li className="flex items-start group">
              <span className="mr-3 text-brand-cyan">•</span>
              <span className="text-brand-gray-200 group-hover:text-brand-gray-100 transition-colors">Dynamic visualizations showcasing market trends and opportunities</span>
            </li>
          </ul>
        </div>
        <div className="flex justify-center">
          <Button
            size="lg"
            className="group bg-gradient-to-r from-brand-teal to-brand-cyan hover:from-brand-cyan hover:to-brand-teal text-brand-navy font-semibold transition-all duration-300"
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
