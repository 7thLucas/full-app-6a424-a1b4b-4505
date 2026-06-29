import { Link } from "react-router";
import type { Product } from "~/catalog/hooks/use-products";
import { Package, Lock, ShoppingCart } from "lucide-react";
import { useInquiryCart } from "~/catalog/hooks/use-inquiry-cart";
import { useAuth } from "~/modules/authentication";
import { UserRole } from "~/modules/authentication/authentication.types";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export function ProductCard({ product, showAddToCart = false }: ProductCardProps) {
  const { addItem } = useInquiryCart();
  const { user } = useAuth();

  const canSeePricing =
    user?.role === UserRole.VerifiedBuyer ||
    user?.role === UserRole.Sales ||
    user?.role === UserRole.Admin;

  const hasPricing = canSeePricing || product.publicPricing;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id ?? product._id?.toString(),
      productName: product.name,
      productSku: product.sku,
      quantity: product.moq ?? 1,
      targetUnitPrice: "",
      notes: "",
    });
  };

  return (
    <Link
      to={`/portal/catalog/${product.id ?? product._id}`}
      className="group block bg-card border border-border rounded-md overflow-hidden hover:border-accent/50 transition-colors"
    >
      {/* Product image */}
      <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" strokeWidth={1} />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2 flex-1">
            {product.name}
          </h3>
        </div>

        {product.sku && (
          <p className="text-xs text-muted-foreground font-mono mb-2">SKU: {product.sku}</p>
        )}

        <div className="mb-3">
          <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-sm">
            {product.category}
          </span>
        </div>

        {hasPricing && product.unitPrice ? (
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-accent font-mono">
              ${Number(product.unitPrice).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">/ unit</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" strokeWidth={1.5} />
            <span>Price on request</span>
          </div>
        )}

        {hasPricing && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {product.moq && <span>MOQ: {product.moq.toLocaleString()} pcs</span>}
            {product.leadTimeDays && <span>Lead: {product.leadTimeDays}d</span>}
          </div>
        )}

        {showAddToCart && canSeePricing && (
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium bg-accent text-accent-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="w-3 h-3" strokeWidth={1.5} />
            Add to Inquiry
          </button>
        )}
      </div>
    </Link>
  );
}
