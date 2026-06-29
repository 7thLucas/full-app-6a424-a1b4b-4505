import { Link, useLocation, Form } from "react-router";
import { useAuth } from "~/modules/authentication";
import { useConfigurables } from "~/modules/configurables";
import { UserRole } from "~/modules/authentication/authentication.types";
import {
  Package,
  FileText,
  MessageSquare,
  FolderOpen,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const BUYER_NAV = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/catalog", label: "Catalog", icon: Package },
  { href: "/portal/cart", label: "Inquiry Cart", icon: ShoppingCart },
  { href: "/portal/rfqs", label: "My RFQs", icon: FileText },
];

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rfqs", label: "RFQ Management", icon: FileText },
  { href: "/admin/catalog", label: "Catalog", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function PortalNav({ variant = "buyer" }: { variant?: "buyer" | "admin" }) {
  const { user, logout } = useAuth();
  const { config } = useConfigurables();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = variant === "admin" ? ADMIN_NAV : BUYER_NAV;
  const appName = config?.appName ?? "FurniTrade Portal";

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-sidebar-background border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <span className="text-sidebar-primary font-bold text-lg tracking-tight">{appName}</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-sidebar-primary" strokeWidth={1.5} />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="px-3 mb-2">
            <p className="text-xs text-sidebar-foreground truncate">{user?.email}</p>
            <p className="text-xs text-sidebar-primary uppercase tracking-wider mt-0.5">{user?.role}</p>
          </div>
          <Form method="post" action="/auth/logout">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Sign Out
            </button>
          </Form>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-navbar-background border-b border-border">
        <span className="text-foreground font-bold text-base">{appName}</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground p-1"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="absolute left-0 top-14 bottom-0 w-60 bg-sidebar-background border-r border-sidebar-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-sidebar-border">
              <Form method="post" action="/auth/logout">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Sign Out
                </button>
              </Form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
