import { Link, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { PortalNav } from "~/components/layouts/portal-nav";
import { useRfqs, RFQ_STATE_LABELS, RFQ_STATE_COLORS } from "~/rfq/hooks/use-rfqs";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useConfigurables } from "~/modules/configurables";
import { FileText, Filter } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

const STATE_OPTIONS = [
  { value: "", label: "All States" },
  { value: "DRAFT_INQUIRY", label: "Draft Inquiry" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "QUOTED", label: "Quoted" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PAYMENT_VERIFIED", label: "Payment Verified" },
  { value: "IN_PRODUCTION", label: "In Production" },
  { value: "READY_TO_SHIP", label: "Ready to Ship" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function BuyerRfqsPage() {
  const { config } = useConfigurables();
  const [stateFilter, setStateFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = config?.rfqItemsPerPage ?? 20;

  const { data, loading, error } = useRfqs({
    state: stateFilter || undefined,
    page,
    limit,
  });

  return (
    <div className="flex min-h-screen bg-background">
      <PortalNav variant="buyer" />

      <main className="flex-1 pt-14 md:pt-0 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My RFQs</h1>
              <p className="text-sm text-muted-foreground mt-1">Track and manage your requests for quotation.</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <select
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
              className="bg-card border border-border rounded-md text-sm text-foreground px-3 py-2 focus:outline-none focus:border-accent"
            >
              {STATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {data && (
              <span className="text-xs text-muted-foreground">{data.total} total</span>
            )}
          </div>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-card border border-border rounded-md animate-pulse" />
              ))}
            </div>
          )}

          {error && <div className="text-destructive text-sm p-4">{error}</div>}

          {!loading && !error && data && (
            <>
              {data.items.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" strokeWidth={1} />
                  <p className="text-sm">No RFQs found.</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">RFQ #</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Items</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Updated</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((rfq, i) => (
                        <tr
                          key={rfq._id}
                          className={`hover:bg-muted/20 transition-colors ${i < data.items.length - 1 ? "border-b border-border" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-foreground">{rfq.rfqNumber}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${RFQ_STATE_COLORS[rfq.state] ?? "bg-muted text-muted-foreground"}`}>
                              {RFQ_STATE_LABELS[rfq.state] ?? rfq.state}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                            {rfq.lineItems.length}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {rfq.totalQuotedAmount !== "0" ? (
                              <span className="font-mono text-xs text-accent">
                                {rfq.currency} {Number(rfq.totalQuotedAmount).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
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

              {data.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-border rounded-sm text-foreground disabled:opacity-40 hover:border-accent"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">{page} / {data.pages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="px-3 py-1.5 text-sm border border-border rounded-sm text-foreground disabled:opacity-40 hover:border-accent"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
