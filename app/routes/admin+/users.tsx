import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState, useEffect } from "react";
import { PortalNav } from "~/components/layouts/portal-nav";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { UserRole } from "~/modules/authentication/authentication.types";
import { Users, Search, CheckCircle, XCircle, Shield } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  if (user.role === UserRole.VerifiedBuyer || user.role === UserRole.Authenticated) {
    return redirect("/portal/dashboard");
  }
  return null;
}

const ROLE_LABELS: Record<string, string> = {
  unauthenticated: "Guest",
  authenticated: "Registered",
  verified_buyer: "Verified Buyer",
  sales: "Sales",
  admin: "Admin",
};

const ROLE_COLORS: Record<string, string> = {
  unauthenticated: "bg-muted text-muted-foreground",
  authenticated: "bg-blue-500/20 text-blue-400",
  verified_buyer: "bg-emerald-500/20 text-emerald-400",
  sales: "bg-violet-500/20 text-violet-400",
  admin: "bg-accent/20 text-accent",
};

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const url = new URL("/api/admin/users", window.location.origin);
    if (search) url.searchParams.set("search", search);
    if (roleFilter) url.searchParams.set("role", roleFilter);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "20");
    try {
      const res = await window.fetch(url.toString(), { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
        setTotal(json.data.total);
        setPages(json.data.pages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const verifyBuyer = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await window.fetch(`/api/admin/users/${userId}/verify-buyer`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: "verified_buyer" } : u));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await window.fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: "PUT",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, is_active: json.data.is_active } : u));
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PortalNav variant="admin" />

      <main className="flex-1 pt-14 md:pt-0 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verify buyers, manage roles and account status.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="bg-card border border-border rounded-md text-sm text-foreground px-3 py-2 focus:outline-none focus:border-accent"
            >
              <option value="">All Roles</option>
              <option value="authenticated">Registered</option>
              <option value="verified_buyer">Verified Buyer</option>
              <option value="sales">Sales</option>
              <option value="admin">Admin</option>
            </select>
            {!loading && <span className="text-xs text-muted-foreground self-center">{total} users</span>}
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-card border border-border rounded-md animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="bg-card border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">User</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr
                        key={user._id}
                        className={`hover:bg-muted/20 transition-colors ${i < users.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{user.username}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ROLE_COLORS[user.role] ?? "bg-muted text-muted-foreground"}`}>
                            {ROLE_LABELS[user.role] ?? user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            {user.is_active ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                            )}
                            <span className="text-xs text-muted-foreground">{user.is_active ? "Active" : "Suspended"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            {user.role === "authenticated" && (
                              <button
                                onClick={() => verifyBuyer(user._id)}
                                disabled={actionLoading === user._id}
                                className="flex items-center gap-1 text-xs text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-sm hover:bg-emerald-400/10 disabled:opacity-50 transition-colors"
                              >
                                <Shield className="w-3 h-3" strokeWidth={1.5} />
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => toggleActive(user._id)}
                              disabled={actionLoading === user._id}
                              className={`text-xs border px-2 py-0.5 rounded-sm disabled:opacity-50 transition-colors ${
                                user.is_active
                                  ? "text-destructive border-destructive/30 hover:bg-destructive/10"
                                  : "text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                              }`}
                            >
                              {user.is_active ? "Suspend" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-border rounded-sm text-foreground disabled:opacity-40 hover:border-accent"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">{page} / {pages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page >= pages}
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
