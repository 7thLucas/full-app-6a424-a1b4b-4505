import { useState, useEffect, useCallback } from "react";

export interface Product {
  id: string;
  _id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  shortDescription: string;
  images: string[];
  unitPrice?: string;
  moq?: number;
  leadTimeDays?: number;
  specs?: { label: string; value: string }[];
  tags: string[];
  isActive: boolean;
  publicPricing: boolean;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function useProducts(params: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const [data, setData] = useState<ProductListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/products", window.location.origin);
      if (params.category) url.searchParams.set("category", params.category);
      if (params.search) url.searchParams.set("search", params.search);
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
  }, [params.category, params.search, params.page, params.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.fetch("/api/products/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setCategories(j.data); })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
