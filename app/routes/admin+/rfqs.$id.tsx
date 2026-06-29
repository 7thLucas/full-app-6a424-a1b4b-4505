import { redirect, useParams, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { PortalNav } from "~/components/layouts/portal-nav";
import { useRfq, RFQ_STATE_LABELS, RFQ_STATE_COLORS, transitionRfq } from "~/rfq/hooks/use-rfqs";
import { RfqChat } from "~/chat/components/rfq-chat";
import { DocumentHub } from "~/documents/components/document-hub";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { UserRole } from "~/modules/authentication/authentication.types";
import { ArrowLeft, Send, Package, Clock } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  if (user.role === UserRole.VerifiedBuyer || user.role === UserRole.Authenticated) {
    return redirect("/portal/dashboard");
  }
  return null;
}

const ADMIN_TRANSITIONS: Record<string, { toState: string; label: string; color: string }[]> = {
  SUBMITTED: [
    { toState: "QUOTED", label: "Issue Quote", color: "bg-violet-600 text-white" },
    { toState: "CANCELLED", label: "Cancel", color: "bg-destructive text-destructive-foreground" },
  ],
  ACCEPTED: [
    { toState: "PAYMENT_VERIFIED", label: "Verify Payment", color: "bg-teal-600 text-white" },
    { toState: "CANCELLED", label: "Cancel", color: "bg-destructive text-destructive-foreground" },
  ],
  PAYMENT_VERIFIED: [
    { toState: "IN_PRODUCTION", label: "Start Production", color: "bg-amber-600 text-white" },
  ],
  IN_PRODUCTION: [
    { toState: "READY_TO_SHIP", label: "Mark Ready to Ship", color: "bg-orange-600 text-white" },
  ],
  READY_TO_SHIP: [
    { toState: "SHIPPED", label: "Mark Shipped", color: "bg-sky-600 text-white" },
  ],
  SHIPPED: [
    { toState: "COMPLETED", label: "Mark Completed", color: "bg-green-600 text-white" },
  ],
};

export default function AdminRfqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { rfq, loading, error } = useRfq(id ?? null);
  const [transitioning, setTransitioning] = useState(false);
  const [note, setNote] = useState("");
  const [extraData, setExtraData] = useState({
    totalQuotedAmount: "",
    salesNotes: "",
    trackingNumber: "",
    shippingPort: "",
    destinationPort: "",
  });

  const currentTransitions = rfq ? (ADMIN_TRANSITIONS[rfq.state] ?? []) : [];

  const handleTransition = async (toState: string) => {
    if (!id || transitioning) return;
    setTransitioning(true);
    try {
      const extra: Record<string, any> = {};
      if (extraData.totalQuotedAmount) extra.totalQuotedAmount = extraData.totalQuotedAmount;
      if (extraData.salesNotes) extra.salesNotes = extraData.salesNotes;
      if (extraData.trackingNumber) extra.trackingNumber = extraData.trackingNumber;
      if (extraData.shippingPort) extra.shippingPort = extraData.shippingPort;
      if (extraData.destinationPort) extra.destinationPort = extraData.destinationPort;

      await transitionRfq(id, toState, note, extra);
      window.location.reload();
    } catch {
      setTransitioning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PortalNav variant="admin" />

      <main className="flex-1 pt-14 md:pt-0 overflow-auto">
        <div className="p-6">
          <Link
            to="/admin/rfqs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            Back to RFQs
          </Link>

          {loading && <div className="text-muted-foreground text-sm">Loading...</div>}
          {error && <div className="text-destructive text-sm">{error}</div>}

          {rfq && (
            <>
              <div className="flex flex-wrap items-start gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground font-mono">{rfq.rfqNumber}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rfq.buyerName} · {rfq.buyerEmail}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${RFQ_STATE_COLORS[rfq.state] ?? "bg-muted text-muted-foreground"}`}>
                    {RFQ_STATE_LABELS[rfq.state] ?? rfq.state}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    </div>
                    {rfq.buyerNotes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Buyer Notes</p>
                        <p className="text-sm text-foreground">{rfq.buyerNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="bg-card border border-border rounded-md overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                      <Package className="w-4 h-4 text-accent" strokeWidth={1.5} />
                      <h2 className="text-sm font-semibold text-foreground">Line Items ({rfq.lineItems.length})</h2>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Product</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Qty</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Target</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Quoted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfq.lineItems.map((item, i) => (
                          <tr key={i} className={i < rfq.lineItems.length - 1 ? "border-b border-border" : ""}>
                            <td className="px-4 py-3">
                              <p className="text-xs font-medium text-foreground">{item.productName}</p>
                              {item.productSku && <p className="text-xs text-muted-foreground font-mono">{item.productSku}</p>}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs">{item.quantity.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                              {item.targetUnitPrice ? `$${item.targetUnitPrice}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-accent">
                              {item.quotedUnitPrice ? `$${item.quotedUnitPrice}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* State history */}
                  <div className="bg-card border border-border rounded-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-accent" strokeWidth={1.5} />
                      <h2 className="text-sm font-semibold text-foreground">State History</h2>
                    </div>
                    {rfq.transitions?.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No transitions.</p>
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
                  {/* Transition Panel */}
                  {currentTransitions.length > 0 && (
                    <div className="bg-card border border-border rounded-md p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Actions</h3>

                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Total Quoted Amount (USD)</label>
                          <input
                            type="text"
                            placeholder="e.g. 12500.00"
                            value={extraData.totalQuotedAmount}
                            onChange={(e) => setExtraData((p) => ({ ...p, totalQuotedAmount: e.target.value }))}
                            className="w-full bg-background border border-border rounded-sm px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Tracking Number</label>
                          <input
                            type="text"
                            placeholder="e.g. MAEU123456789"
                            value={extraData.trackingNumber}
                            onChange={(e) => setExtraData((p) => ({ ...p, trackingNumber: e.target.value }))}
                            className="w-full bg-background border border-border rounded-sm px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Sales Notes</label>
                          <textarea
                            placeholder="Internal notes for buyer..."
                            value={extraData.salesNotes}
                            onChange={(e) => setExtraData((p) => ({ ...p, salesNotes: e.target.value }))}
                            rows={2}
                            className="w-full bg-background border border-border rounded-sm px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Transition Note</label>
                          <textarea
                            placeholder="Reason for state change..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            className="w-full bg-background border border-border rounded-sm px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent resize-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {currentTransitions.map((trans) => (
                          <button
                            key={trans.toState}
                            onClick={() => handleTransition(trans.toState)}
                            disabled={transitioning}
                            className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-sm disabled:opacity-50 hover:opacity-90 transition-opacity ${trans.color}`}
                          >
                            <Send className="w-3 h-3" strokeWidth={1.5} />
                            {trans.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

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
