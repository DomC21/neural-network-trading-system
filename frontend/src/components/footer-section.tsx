import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Github } from "lucide-react"

export function FooterSection() {
  return (
    <Card className="w-full mt-16 border-none shadow-none">
      <CardContent className="py-8">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Call to Action */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stay Updated</h3>
              <p className="text-muted-foreground">
                Join our community to receive the latest updates and insights from Lukz.
              </p>
              <Button className="w-full sm:w-auto">
                Join Waitlist
              </Button>
            </div>

            {/* Related Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Related Projects</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com/your-org/neural-network-trading"
                    className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Neural Network Trading System
                  </a>
                </li>
                <li>
                  <a
                    href="https://unusual-whales.com"
                    className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Unusual Whales
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/docs"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/tutorials"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tutorials
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 Lukz. All rights reserved.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
