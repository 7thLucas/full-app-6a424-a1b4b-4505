import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { PortalNav } from "~/components/layouts/portal-nav";
import { useProducts, useCategories } from "~/catalog/hooks/use-products";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { UserRole } from "~/modules/authentication/authentication.types";
import { useConfigurables } from "~/modules/configurables";
import { Package, Search, Plus, Edit, Eye, EyeOff } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  if (user.role === UserRole.VerifiedBuyer || user.role === UserRole.Authenticated) {
    return redirect("/portal/dashboard");
  }
  return null;
}

export default function AdminCatalogPage() {
  const { config } = useConfigurables();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", category: "", description: "", shortDescription: "",
    unitPrice: "", moq: "1", leadTimeDays: "30", publicPricing: false,
  });

  const limit = config?.catalogItemsPerPage ?? 24;
  const { data, loading, refetch } = useProducts({ search, category: selectedCategory, page, limit }, );
  const { categories } = useCategories();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await window.fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          moq: parseInt(form.moq),
          leadTimeDays: parseInt(form.leadTimeDays),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateForm(false);
        setForm({ name: "", sku: "", category: "", description: "", shortDescription: "", unitPrice: "", moq: "1", leadTimeDays: "30", publicPricing: false });
        refetch();
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    await window.fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !currentActive }),
    });
    refetch();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PortalNav variant="admin" />

      <main className="flex-1 pt-14 md:pt-0 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Product Catalog</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your furniture product listings.</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1.5 text-sm bg-accent text-accent-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add Product
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <form onSubmit={handleCreate} className="mb-6 bg-card border border-border rounded-md p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">New Product</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {[
                  { key: "name", label: "Name*", required: true },
                  { key: "sku", label: "SKU" },
                  { key: "category", label: "Category*", required: true },
                  { key: "unitPrice", label: "Unit Price (USD)" },
                  { key: "moq", label: "MOQ (pcs)" },
                  { key: "leadTimeDays", label: "Lead Time (days)" },
                ].map(({ key, label, required }) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                    <input
                      type="text"
                      required={required}
                      value={(form as any)[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full bg-background border border-border rounded-sm px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-1 block">Short Description</label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
                  className="w-full bg-background border border-border rounded-sm px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-background border border-border rounded-sm px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent resize-none"
                />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="publicPricing"
                  checked={form.publicPricing}
                  onChange={(e) => setForm((p) => ({ ...p, publicPricing: e.target.checked }))}
                  className="w-4 h-4 accent-accent"
                />
                <label htmlFor="publicPricing" className="text-xs text-muted-foreground">
                  Public pricing (visible to guests)
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-1.5 text-sm bg-accent text-accent-foreground px-4 py-2 rounded-sm hover:opacity-90 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  {creating ? "Creating..." : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-sm border border-border text-foreground px-4 py-2 rounded-sm hover:border-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => { setSelectedCategory(e.target.value || undefined); setPage(1); }}
              className="bg-card border border-border rounded-md text-sm text-foreground px-3 py-2 focus:outline-none focus:border-accent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {data && <span className="text-xs text-muted-foreground self-center">{data.total} products</span>}
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-card border border-border rounded-md animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-md overflow-hidden">
              {data?.items.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-40" strokeWidth={1} />
                  <p className="text-sm">No products yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Price</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">MOQ</th>
                      <th className="px-4 py-3 text-right" />
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((product, i) => (
                      <tr key={product.id ?? product._id?.toString()} className={`hover:bg-muted/20 transition-colors ${i < (data.items.length - 1) ? "border-b border-border" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="w-8 h-8 object-cover rounded-sm" />
                              ) : (
                                <Package className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{product.name}</p>
                              {product.sku && <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                        </td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          {product.unitPrice ? (
                            <span className="font-mono text-xs text-accent">${Number(product.unitPrice).toLocaleString()}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground font-mono">{product.moq?.toLocaleString() ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => toggleActive(product.id ?? product._id?.toString(), product.isActive)}
                              className={`text-xs flex items-center gap-1 ${product.isActive ? "text-muted-foreground hover:text-destructive" : "text-emerald-400"} transition-colors`}
                              title={product.isActive ? "Deactivate" : "Activate"}
                            >
                              {product.isActive ? (
                                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {data && data.pages > 1 && (
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
        </div>
      </main>
    </div>
  );
}
