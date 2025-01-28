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
      <div className="min-h-screen bg-brand-black text-brand-gray-100 transition-colors duration-300">
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <main className="container mx-auto px-6 py-12 space-y-16">
          <OverviewSection />
          <div id="demo-panels" className="mt-24 space-y-12">
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
