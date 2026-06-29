import { useState } from "react";
import { PortalNav } from "~/components/layouts/portal-nav";
import { ProductCard } from "~/catalog/components/product-card";
import { useProducts, useCategories } from "~/catalog/hooks/use-products";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication";
import { InquiryCartProvider } from "~/catalog/hooks/use-inquiry-cart";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

function CatalogContent() {
  const { user } = useAuth();
  const { config } = useConfigurables();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const limit = config?.catalogItemsPerPage ?? 24;

  const { data, loading, error } = useProducts({
    search: search || undefined,
    category: selectedCategory,
    page,
    limit,
  });

  const { categories } = useCategories();

  const isPortalPage = !!user;

  return (
    <div className={isPortalPage ? "flex min-h-screen bg-background" : "min-h-screen bg-background"}>
      {isPortalPage && <PortalNav variant="buyer" />}

      <div className={`flex-1 ${isPortalPage ? "md:ml-0 pt-14 md:pt-0" : ""}`}>
        {!isPortalPage && (
          <header className="border-b border-border bg-navbar-background sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <span className="font-bold text-foreground">FurniTrade Portal</span>
            </div>
          </header>
        )}

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {config?.catalogHeading ?? "Product Catalog"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {config?.catalogSubheading ?? "Browse our curated selection of furniture from verified manufacturers."}
            </p>
          </div>

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
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
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
            </div>
          </div>

          {/* Products grid */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-md overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-6 text-center text-destructive text-sm">{error}</div>
          )}

          {!loading && !error && data && (
            <>
              <div className="text-xs text-muted-foreground mb-4">
                {data.total} product{data.total !== 1 ? "s" : ""}
                {data.total > 0 && ` — page ${data.page} of ${data.pages}`}
              </div>
              {data.items.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Filter className="w-10 h-10 mx-auto mb-3 opacity-40" strokeWidth={1} />
                  <p className="text-sm">No products match your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.items.map((product) => (
                    <ProductCard key={product.id ?? product._id?.toString()} product={product} showAddToCart />
                  ))}
                </div>
              )}

              {data.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-border rounded-sm text-foreground disabled:opacity-40 hover:border-accent transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {data.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="px-3 py-1.5 text-sm border border-border rounded-sm text-foreground disabled:opacity-40 hover:border-accent transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <InquiryCartProvider>
      <CatalogContent />
    </InquiryCartProvider>
  );
}
