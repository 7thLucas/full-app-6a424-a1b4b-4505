import { Link } from "react-router";
import { useAuth } from "~/modules/authentication";
import { useConfigurables } from "~/modules/configurables";
import { ArrowRight, Package, FileText, MessageSquare, Shield, Globe, Zap } from "lucide-react";

export default function IndexPage() {
  const { user } = useAuth();
  const { config } = useConfigurables();

  const appName = config?.appName ?? "FurniTrade Portal";
  const tagline = config?.appTagline ?? "Centralized Quoting Platform for International Furniture Trade";
  const heroHeading = config?.heroHeading ?? "Source Quality Furniture, Globally";
  const heroSubheading = config?.heroSubheading ?? "Access verified manufacturers, submit RFQs, and manage your international procurement with confidence.";

  const features = [
    {
      icon: Package,
      title: "Gated Catalog",
      desc: "Browse our curated product catalog. Verified buyers access full pricing, MOQ, and spec sheets.",
    },
    {
      icon: FileText,
      title: "RFQ State Machine",
      desc: "Track your inquiry through 9 lifecycle states — from draft to completed delivery.",
    },
    {
      icon: MessageSquare,
      title: "Negotiation Chat",
      desc: "Contextual per-RFQ messaging between buyers and sales, with attachment support.",
    },
    {
      icon: Shield,
      title: "Document Hub",
      desc: "Proforma invoices, bills of lading, and packing lists — all secured per RFQ.",
    },
    {
      icon: Globe,
      title: "International Ready",
      desc: "Multi-currency support, Incoterms, and trade documentation built in.",
    },
    {
      icon: Zap,
      title: "Event Notifications",
      desc: "Automated email alerts at every state transition — buyers and sales stay informed.",
    },
  ];

  const dashboardLink = user
    ? (user.role === "admin" || user.role === "sales" ? "/admin/dashboard" : "/portal/dashboard")
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b border-border bg-navbar-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-foreground text-lg tracking-tight">{appName}</span>
          <div className="flex items-center gap-3">
            <Link
              to="/portal/catalog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Catalog
            </Link>
            {user ? (
              <Link
                to={dashboardLink!}
                className="flex items-center gap-1.5 text-sm bg-accent text-accent-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="flex items-center gap-1.5 text-sm bg-accent text-accent-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
                >
                  Get Access
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-background to-background opacity-60" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold uppercase tracking-widest border border-accent/40 text-accent rounded-sm">
            {tagline}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            {heroHeading}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
            {heroSubheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/portal/catalog"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Browse Catalog
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            {!user && (
              <Link
                to="/auth/register"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-md font-semibold text-sm hover:border-accent transition-colors"
              >
                Request Buyer Access
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Built for International Trade
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature designed for the complexity of cross-border furniture procurement.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-card border border-border rounded-md p-6 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-accent/10 rounded-sm">
                      <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to source smarter?</h2>
          <p className="text-muted-foreground mb-8">
            Create an account and apply for verified buyer access to unlock the full catalog and RFQ system.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-md font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            {config?.footerText ?? "FurniTrade Portal — International Furniture Trade Platform. All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
