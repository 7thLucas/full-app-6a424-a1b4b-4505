import { Link, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState, useEffect } from "react";
import { PortalNav } from "~/components/layouts/portal-nav";
import { useRfqs, RFQ_STATE_LABELS, RFQ_STATE_COLORS } from "~/rfq/hooks/use-rfqs";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { UserRole } from "~/modules/authentication/authentication.types";
import { useConfigurables } from "~/modules/configurables";
import {
  FileText,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  if (user.role === UserRole.VerifiedBuyer || user.role === UserRole.Authenticated) {
    return redirect("/portal/dashboard");
  }
  return null;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <div className={`bg-card border rounded-md p-5 ${accent ? "border-accent/50" : "border-border"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${accent ? "text-accent" : "text-muted-foreground"}`} strokeWidth={1.5} />
      </div>
      <p className={`text-3xl font-bold font-mono ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { config } = useConfigurables();
  const { data: rfqData, loading: rfqLoading } = useRfqs({ limit: 10 });
  const [stats, setStats] = useState<{ stateCounts: { _id: string; count: number }[]; total: number } | null>(null);
  const [userStats, setUserStats] = useState<{ roleCounts: { _id: string; count: number }[]; total: number } | null>(null);

  useEffect(() => {
    window.fetch("/api/rfqs/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setStats(j.data); });

    window.fetch("/api/admin/users/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setUserStats(j.data); });
  }, []);

  const pendingCount = stats?.stateCounts.find((s) => s._id === "SUBMITTED")?.count ?? 0;
  const inProductionCount = stats?.stateCounts.find((s) => s._id === "IN_PRODUCTION")?.count ?? 0;
  const completedCount = stats?.stateCounts.find((s) => s._id === "COMPLETED")?.count ?? 0;
  const buyerCount = userStats?.roleCounts.find((r) => r._id === UserRole.VerifiedBuyer)?.count ?? 0;

  return (
    <div className="flex min-h-screen bg-background">
      <PortalNav variant="admin" />

      <main className="flex-1 pt-14 md:pt-0 overflow-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of {config?.appName ?? "FurniTrade Portal"} operations.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total RFQs"
              value={stats?.total ?? "—"}
              icon={FileText}
              accent
            />
            <StatCard
              label="Pending Review"
              value={pendingCount}
              icon={Clock}
              sub="Awaiting quote"
            />
            <StatCard
              label="In Production"
              value={inProductionCount}
              icon={Package}
            />
            <StatCard
              label="Verified Buyers"
              value={buyerCount}
              icon={Users}
            />
          </div>

          {/* State breakdown */}
          {stats && stats.stateCounts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">RFQ State Breakdown</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {stats.stateCounts.map((s) => (
                  <div key={s._id} className="bg-card border border-border rounded-md p-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${RFQ_STATE_COLORS[s._id] ?? "bg-muted text-muted-foreground"}`}>
                      {RFQ_STATE_LABELS[s._id] ?? s._id}
                    </span>
                    <p className="text-xl font-bold text-foreground font-mono">{s.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/admin/rfqs"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-md hover:border-accent/50 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-sm">
                <FileText className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Manage RFQs</p>
                <p className="text-xs text-muted-foreground">Review, quote, approve</p>
              </div>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-md hover:border-accent/50 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-sm">
                <Users className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">User Management</p>
                <p className="text-xs text-muted-foreground">Verify buyers, manage roles</p>
              </div>
            </Link>
            <Link
              to="/admin/catalog"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-md hover:border-accent/50 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-sm">
                <Package className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Catalog</p>
                <p className="text-xs text-muted-foreground">Manage products</p>
              </div>
            </Link>
          </div>

          {/* Recent RFQs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent RFQs</h2>
              <Link to="/admin/rfqs" className="text-xs text-accent hover:underline">View all</Link>
            </div>

            {rfqLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-card border border-border rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">RFQ #</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Buyer</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Amount</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {rfqData?.items.map((rfq, i) => (
                      <tr
                        key={rfq._id}
                        className={`hover:bg-muted/20 transition-colors ${i < (rfqData.items.length - 1) ? "border-b border-border" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-foreground">{rfq.rfqNumber}</span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-xs text-foreground">{rfq.buyerName}</p>
                          <p className="text-xs text-muted-foreground">{rfq.buyerEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${RFQ_STATE_COLORS[rfq.state] ?? "bg-muted text-muted-foreground"}`}>
                            {RFQ_STATE_LABELS[rfq.state] ?? rfq.state}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          {rfq.totalQuotedAmount !== "0" ? (
                            <span className="font-mono text-xs text-accent">
                              {rfq.currency} {Number(rfq.totalQuotedAmount).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/rfqs/${rfq._id}`} className="text-xs text-accent hover:underline">
                            Manage
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
