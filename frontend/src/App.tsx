import { ThemeProvider } from "./components/theme-provider"
import { ThemeToggle } from "./components/theme-toggle"
import { OverviewSection } from "./components/overview-section"
import { CongressTradesPanel } from "./components/congress-trades-panel"
import { GreekFlowPanel } from "./components/greek-flow-panel"
import { EarningsPanel } from "./components/earnings-panel"
import { InsiderTradingPanel } from "./components/insider-trading-panel"
import { PremiumFlowPanel } from "./components/premium-flow-panel"
import { FooterSection } from "./components/footer-section"
import { DevelopmentStatus } from "./components/development-status"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lukz-theme">
      <div className="min-h-screen bg-background text-foreground">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main className="container mx-auto px-4 py-8">
          <OverviewSection />
          <div id="demo-panels" className="mt-16 space-y-8">
            <CongressTradesPanel />
            <GreekFlowPanel />
            <EarningsPanel />
            <InsiderTradingPanel />
            <PremiumFlowPanel />
          </div>
          <DevelopmentStatus />
          <FooterSection />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
