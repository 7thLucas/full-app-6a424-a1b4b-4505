import { redirect, useNavigate } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { PortalNav } from "~/components/layouts/portal-nav";
import { InquiryCartProvider, useInquiryCart } from "~/catalog/hooks/use-inquiry-cart";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useAuth } from "~/modules/authentication";
import { UserRole } from "~/modules/authentication/authentication.types";
import { createRfq } from "~/rfq/hooks/use-rfqs";
import { useConfigurables } from "~/modules/configurables";
import { ShoppingCart, Trash2, Package, Send, AlertCircle } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

function CartContent() {
  const { items, removeItem, updateItem, clearCart } = useInquiryCart();
  const { user } = useAuth();
  const { config } = useConfigurables();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState(config?.currencyCode ?? "USD");
  const [incoterm, setIncoterm] = useState(config?.defaultIncoterm ?? "FOB");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVerifiedBuyer =
    user?.role === UserRole.VerifiedBuyer ||
    user?.role === UserRole.Sales ||
    user?.role === UserRole.Admin;

  const handleSubmit = async () => {
    if (items.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createRfq({
        lineItems: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          targetUnitPrice: item.targetUnitPrice,
          notes: item.notes,
        })),
        notes,
        currency,
        incoterm,
      });
      if (result.success) {
        clearCart();
        navigate(`/portal/rfqs/${result.data._id}`);
      } else {
        setError(result.message ?? "Failed to submit RFQ");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PortalNav variant="buyer" />

      <main className="flex-1 pt-14 md:pt-0 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              Inquiry Cart
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review your inquiry before submitting an RFQ.
            </p>
          </div>

          {!isVerifiedBuyer && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-md">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-amber-400">Buyer Verification Required</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  RFQ submission requires verified buyer status. Your account is pending approval.
                </p>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" strokeWidth={1} />
              <p className="text-sm">Your inquiry cart is empty.</p>
              <a href="/portal/catalog" className="inline-block mt-3 text-xs text-accent hover:underline">
                Browse Catalog
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Line Items */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <div key={item.productId} className="p-4 flex gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.productName}</p>
                          {item.productSku && (
                            <p className="text-xs text-muted-foreground font-mono">SKU: {item.productSku}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground">Qty</label>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item.productId, { quantity: parseInt(e.target.value) || 1 })
                                }
                                className="w-20 bg-background border border-border rounded-sm px-2 py-1 text-xs text-foreground font-mono focus:outline-none focus:border-accent"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground">Target Price</label>
                              <input
                                type="text"
                                placeholder="0.00"
                                value={item.targetUnitPrice}
                                onChange={(e) => updateItem(item.productId, { targetUnitPrice: e.target.value })}
                                className="w-24 bg-background border border-border rounded-sm px-2 py-1 text-xs text-foreground font-mono focus:outline-none focus:border-accent"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="Notes for this item..."
                            value={item.notes}
                            onChange={(e) => updateItem(item.productId, { notes: e.target.value })}
                            className="w-full mt-2 bg-background border border-border rounded-sm px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent placeholder:text-muted-foreground"
                          />
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Panel */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-md p-5">
                  <h2 className="text-sm font-semibold text-foreground mb-4">RFQ Settings</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                      >
                        {["USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD", "SGD"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Incoterm</label>
                      <select
                        value={incoterm}
                        onChange={(e) => setIncoterm(e.target.value)}
                        className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                      >
                        {["EXW", "FOB", "CIF", "DDP", "FCA", "CPT", "CIP", "DAP", "DPU"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">General Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional requirements, delivery timeline, port preferences..."
                        rows={3}
                        className="w-full bg-background border border-border rounded-sm px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-destructive mt-3">{error}</p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!isVerifiedBuyer || submitting || items.length === 0}
                    className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 bg-accent text-accent-foreground text-sm font-semibold rounded-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    {submitting ? "Submitting..." : "Submit RFQ"}
                  </button>

                  {!isVerifiedBuyer && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Verified buyer access required
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <InquiryCartProvider>
      <CartContent />
    </InquiryCartProvider>
  );
}
