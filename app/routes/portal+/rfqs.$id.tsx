import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useParams, Link } from "react-router";
import { PortalNav } from "~/components/layouts/portal-nav";
import { useRfq, RFQ_STATE_LABELS, RFQ_STATE_COLORS, transitionRfq } from "~/rfq/hooks/use-rfqs";
import { RfqChat } from "~/chat/components/rfq-chat";
import { DocumentHub } from "~/documents/components/document-hub";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useAuth } from "~/modules/authentication";
import { UserRole } from "~/modules/authentication/authentication.types";
import { ArrowLeft, CheckCircle, Package, Clock } from "lucide-react";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export default function BuyerRfqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { rfq, loading, error } = useRfq(id ?? null);
  const { user } = useAuth();
  const [transitioning, setTransitioning] = useState(false);

  const isVerifiedBuyer = user?.role === UserRole.VerifiedBuyer;
  const canAccept = isVerifiedBuyer && rfq?.state === "QUOTED";

  const handleAccept = async () => {
    if (!id || !canAccept) return;
    setTransitioning(true);
    try {
      await transitionRfq(id, "ACCEPTED", "Buyer accepted the quote.");
      window.location.reload();
    } catch {
      setTransitioning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PortalNav variant="buyer" />

      <main className="flex-1 pt-14 md:pt-0 overflow-auto">
        <div className="p-6">
          <Link
            to="/portal/rfqs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            Back to RFQs
          </Link>

          {loading && (
            <div className="text-muted-foreground text-sm">Loading RFQ details...</div>
          )}
          {error && <div className="text-destructive text-sm">{error}</div>}

          {rfq && (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-start gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground font-mono">{rfq.rfqNumber}</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(rfq.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${RFQ_STATE_COLORS[rfq.state] ?? "bg-muted text-muted-foreground"}`}>
                    {RFQ_STATE_LABELS[rfq.state] ?? rfq.state}
                  </span>
                  {canAccept && (
                    <button
                      onClick={handleAccept}
                      disabled={transitioning}
                      className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Accept Quote
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* RFQ Info */}
                  <div className="bg-card border border-border rounded-md p-5">
                    <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">RFQ Details</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Currency</p>
                        <p className="font-mono text-foreground">{rfq.currency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Incoterm</p>
                        <p className="font-mono text-foreground">{rfq.incoterm}</p>
                      </div>
                      {rfq.totalQuotedAmount !== "0" && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                          <p className="font-mono font-bold text-accent">
                            {rfq.currency} {Number(rfq.totalQuotedAmount).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {rfq.trackingNumber && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tracking</p>
                          <p className="font-mono text-foreground">{rfq.trackingNumber}</p>
                        </div>
                      )}
                      {rfq.shippingPort && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ship From</p>
                          <p className="text-foreground">{rfq.shippingPort}</p>
                        </div>
                      )}
                      {rfq.destinationPort && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Destination</p>
                          <p className="text-foreground">{rfq.destinationPort}</p>
                        </div>
                      )}
                    </div>
                    {rfq.buyerNotes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Notes</p>
                        <p className="text-sm text-foreground">{rfq.buyerNotes}</p>
                      </div>
                    )}
                    {rfq.salesNotes && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sales Notes</p>
                        <p className="text-sm text-foreground">{rfq.salesNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="bg-card border border-border rounded-md overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                      <Package className="w-4 h-4 text-accent" strokeWidth={1.5} />
                      <h2 className="text-sm font-semibold text-foreground">Line Items</h2>
                    </div>
                    {rfq.lineItems.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">No items</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Product</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Qty</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Target</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Quoted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rfq.lineItems.map((item, i) => (
                            <tr key={i} className={i < rfq.lineItems.length - 1 ? "border-b border-border" : ""}>
                              <td className="px-4 py-3">
                                <p className="text-xs font-medium text-foreground">{item.productName}</p>
                                {item.productSku && (
                                  <p className="text-xs text-muted-foreground font-mono">{item.productSku}</p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                                {item.quantity.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground hidden sm:table-cell">
                                {item.targetUnitPrice ? `$${item.targetUnitPrice}` : "—"}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-xs text-accent hidden md:table-cell">
                                {item.quotedUnitPrice ? `$${item.quotedUnitPrice}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* State Timeline */}
                  <div className="bg-card border border-border rounded-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-accent" strokeWidth={1.5} />
                      <h2 className="text-sm font-semibold text-foreground">State History</h2>
                    </div>
                    {rfq.transitions?.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No transitions yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {rfq.transitions?.map((t: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 text-xs">
                            <div className="w-2 h-2 mt-1 rounded-full bg-accent flex-shrink-0" />
                            <div>
                              <span className="text-muted-foreground">{RFQ_STATE_LABELS[t.fromState]} → </span>
                              <span className="text-foreground font-medium">{RFQ_STATE_LABELS[t.toState]}</span>
                              {t.note && <p className="text-muted-foreground mt-0.5">{t.note}</p>}
                              <p className="text-muted-foreground/60">{new Date(t.performedAt).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <DocumentHub rfqId={id!} />
                  <RfqChat rfqId={id!} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
