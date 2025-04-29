import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const integrations = [
  {
    title: "Webhooks",
    description: "Create custom webhooks to connect Helfzen with your other systems and automate workflows.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/webhooks",
  },
  {
    title: "Workflow Automation",
    description: "Build automated workflows to streamline your billing and receivables processes.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/workflows",
  },
  {
    title: "API Integration",
    description: "Connect to our API to build custom integrations and extend Helfzen's functionality.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/api",
  },
  {
    title: "QuickBooks",
    description: "Sync your invoices, payments, and financial data with QuickBooks for seamless accounting.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/quickbooks",
  },
  {
    title: "Xero",
    description: "Connect your Helfzen account with Xero for automated accounting and financial reporting.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/xero",
  },
  {
    title: "Stripe",
    description: "Process payments directly through Stripe and automatically reconcile them in Helfzen.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/stripe",
  },
  {
    title: "HHAeXchange",
    description: "Integrate with HHAeXchange for seamless home health agency management and billing.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/hhaexchange",
  },
  {
    title: "Trello",
    description: "Connect with Trello to manage your billing workflows and track invoice status visually.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/trello",
  },
  {
    title: "Asana",
    description: "Integrate with Asana to manage your billing tasks and workflows alongside your other projects.",
    icon: "/placeholder.svg?height=40&width=40",
    url: "/apps/asana",
  },
]

export default function AppsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Apps & Integrations</h1>
        <p className="text-sm text-muted-foreground">Connect Helfzen with your favorite tools and services</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.title} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
              <img
                src={integration.icon || "/placeholder.svg"}
                alt={`${integration.title} icon`}
                className="h-10 w-10 rounded-md border bg-muted p-1"
              />
              <div>
                <CardTitle className="text-lg">{integration.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="text-sm">{integration.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={integration.url}>
                  Connect
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
