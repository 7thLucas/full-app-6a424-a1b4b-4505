import { useState, useEffect, useCallback } from "react";

export interface RfqLineItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  targetUnitPrice: string;
  quotedUnitPrice: string;
  notes: string;
}

export interface Rfq {
  _id: string;
  rfqNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  state: string;
  lineItems: RfqLineItem[];
  totalQuotedAmount: string;
  currency: string;
  incoterm: string;
  shippingPort: string;
  destinationPort: string;
  buyerNotes: string;
  salesNotes: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

export const RFQ_STATE_LABELS: Record<string, string> = {
  DRAFT_INQUIRY: "Draft Inquiry",
  SUBMITTED: "Submitted",
  QUOTED: "Quoted",
  ACCEPTED: "Accepted",
  PAYMENT_VERIFIED: "Payment Verified",
  IN_PRODUCTION: "In Production",
  READY_TO_SHIP: "Ready to Ship",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const RFQ_STATE_COLORS: Record<string, string> = {
  DRAFT_INQUIRY: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-500/20 text-blue-400",
  QUOTED: "bg-violet-500/20 text-violet-400",
  ACCEPTED: "bg-emerald-500/20 text-emerald-400",
  PAYMENT_VERIFIED: "bg-teal-500/20 text-teal-400",
  IN_PRODUCTION: "bg-amber-500/20 text-amber-400",
  READY_TO_SHIP: "bg-orange-500/20 text-orange-400",
  SHIPPED: "bg-sky-500/20 text-sky-400",
  COMPLETED: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-destructive/20 text-destructive",
};

export function useRfqs(params: { state?: string; page?: number; limit?: number } = {}) {
  const [data, setData] = useState<{ items: Rfq[]; total: number; page: number; pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/rfqs", window.location.origin);
      if (params.state) url.searchParams.set("state", params.state);
      if (params.page) url.searchParams.set("page", String(params.page));
      if (params.limit) url.searchParams.set("limit", String(params.limit));
      const res = await window.fetch(url.toString(), { credentials: "include" });
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [params.state, params.page, params.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useRfq(id: string | null) {
  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.fetch(`/api/rfqs/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setRfq(j.data); else setError(j.message); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { rfq, loading, error };
}

export async function transitionRfq(
  rfqId: string,
  toState: string,
  note?: string,
  extraData?: Record<string, unknown>
) {
  const res = await fetch(`/api/rfqs/${rfqId}/transition`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ toState, note, ...extraData }),
  });
  return res.json();
}

export async function createRfq(data: {
  lineItems: Partial<RfqLineItem>[];
  notes?: string;
  currency?: string;
  incoterm?: string;
}) {
  const res = await fetch("/api/rfqs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}
