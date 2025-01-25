import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, Sliders, Calendar } from "lucide-react"

export function DevelopmentStatus() {
  const upcomingFeatures = [
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Live Market Data Integration",
      description: "Real-time data feeds from multiple sources"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      title: "Advanced Backtesting Framework",
      description: "Detailed performance metrics and analysis"
    },
    {
      icon: <Sliders className="h-4 w-4" />,
      title: "Interactive Model Parameter Tuning",
      description: "Fine-tune your analysis parameters in real-time"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      title: "Custom Timeframe Selection",
      description: "Flexible time ranges for all analyses"
    }
  ]

  return (
    <Card className="w-full mt-16">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Development Status</CardTitle>
            <CardDescription>
              Track our progress and upcoming features
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="rounded-lg bg-muted p-6">
          <p className="text-sm leading-relaxed">
            This project is actively under development. Our goal is to provide users with cutting-edge financial analysis tools powered by the Unusual Whales API.
          </p>
        </div>

        {/* Upcoming Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      {feature.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium leading-none">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
