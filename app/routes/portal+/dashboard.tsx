import { Link, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { PortalNav } from "~/components/layouts/portal-nav";
import { useAuth } from "~/modules/authentication";
import { useRfqs, RFQ_STATE_LABELS, RFQ_STATE_COLORS } from "~/rfq/hooks/use-rfqs";
import { useConfigurables } from "~/modules/configurables";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import {
  FileText,
  Package,
  ShoppingCart,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  if (user.role === "admin" || user.role === "sales") return redirect("/admin/dashboard");
  return null;
}

function StatCard({ label, value, icon: Icon, accent = false }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-md p-5 ${accent ? "border-accent/50" : "border-border"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${accent ? "text-accent" : "text-muted-foreground"}`} strokeWidth={1.5} />
      </div>
      <p className={`text-3xl font-bold font-mono ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const { config } = useConfigurables();
  const { data: rfqData, loading } = useRfqs({ limit: 5 });

  const activeRfqs = rfqData?.items.filter(
    (r) => !["COMPLETED", "CANCELLED"].includes(r.state)
  ).length ?? 0;

  const completedRfqs = rfqData?.items.filter(
    (r) => r.state === "COMPLETED"
  ).length ?? 0;

  return (
    <div className="flex min-h-screen bg-background">
      <PortalNav variant="buyer" />

      <main className="flex-1 pt-14 md:pt-0 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.username}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.role === "authenticated"
                ? "Your account is pending verification. A team member will review your request."
                : "Manage your inquiries and track your orders."}
            </p>
          </div>

          {/* Pending verification banner */}
          {user?.role === "authenticated" && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-md">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-amber-400">Buyer Verification Pending</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your account is under review. Once verified, you will get access to pricing, RFQ submission, and negotiation tools.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total RFQs" value={rfqData?.total ?? 0} icon={FileText} />
            <StatCard label="Active RFQs" value={activeRfqs} icon={Clock} accent />
            <StatCard label="Completed" value={completedRfqs} icon={Package} />
            <StatCard label="Currency" value={config?.currencyCode ?? "USD"} icon={ShoppingCart} />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/portal/catalog"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-md hover:border-accent/50 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-sm">
                <Package className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Browse Catalog</p>
                <p className="text-xs text-muted-foreground">Add items to inquiry</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" strokeWidth={1.5} />
            </Link>

            <Link
              to="/portal/cart"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-md hover:border-accent/50 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-sm">
                <ShoppingCart className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Inquiry Cart</p>
                <p className="text-xs text-muted-foreground">Review and submit</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" strokeWidth={1.5} />
            </Link>

            <Link
              to="/portal/rfqs"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-md hover:border-accent/50 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-sm">
                <FileText className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">My RFQs</p>
                <p className="text-xs text-muted-foreground">Track all inquiries</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" strokeWidth={1.5} />
            </Link>
          </div>

          {/* Recent RFQs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent RFQs</h2>
              <Link to="/portal/rfqs" className="text-xs text-accent hover:underline">View all</Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-card border border-border rounded-md animate-pulse" />
                ))}
              </div>
            ) : rfqData?.items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" strokeWidth={1} />
                <p className="text-sm">No RFQs yet. Browse the catalog and submit your first inquiry.</p>
                <Link
                  to="/portal/catalog"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs text-accent hover:underline"
                >
                  Browse Catalog
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">RFQ #</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Items</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Updated</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {rfqData?.items.map((rfq, i) => (
                      <tr key={rfq._id} className={`hover:bg-muted/20 transition-colors ${i < rfqData.items.length - 1 ? "border-b border-border" : ""}`}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-foreground">{rfq.rfqNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${RFQ_STATE_COLORS[rfq.state] ?? "bg-muted text-muted-foreground"}`}>
                            {RFQ_STATE_LABELS[rfq.state] ?? rfq.state}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                          {rfq.lineItems.length} item{rfq.lineItems.length !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {new Date(rfq.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/portal/rfqs/${rfq._id}`}
                            className="text-xs text-accent hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
