"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface UserItem {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "customer" | "staff" | "admin";
  status: "active" | "suspended";
  createdAt: string;
}

export default function UsersClient() {
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (res.ok && json.success) {
        setUsersList(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: UserItem["role"]) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error("Role update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus: UserItem["status"] =
      user.status === "active" ? "suspended" : "active";

    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            RBAC & Security
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            User Accounts & Roles
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Manage user roles for kitchen staff, administrators, account suspension, and authentication security.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="px-3.5 py-2 rounded-button bg-white border border-sand-300 hover:bg-sand-50 text-stone-700 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card bg-white p-4 rounded-card border border-sand-300 shadow-elevation-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or email address..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary outline-none transition-all"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary outline-none transition-all"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="staff">Kitchen Staff</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-stone-500">
          Total {filteredUsers.length} Registered Accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="glass-card bg-white rounded-card border border-sand-300 shadow-elevation-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-stone-600 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role (RBAC)</th>
                <th className="p-4 text-center">Account Status</th>
                <th className="p-4">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    Loading user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400">
                    No accounts found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  let roleBadge = "bg-sand-100 text-stone-700 border-sand-300";
                  if (user.role === "admin") roleBadge = "bg-primary/10 text-primary border-primary/30 font-bold";
                  if (user.role === "staff") roleBadge = "bg-amber-100 text-amber-800 border-amber-300 font-bold";

                  return (
                    <tr key={user.id} className="hover:bg-sand-50/60 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <span className="font-heading font-bold text-stone-900 block text-xs sm:text-sm">
                            {user.name || "Anonymous Guest"}
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">
                            ID: {user.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-stone-700 font-medium">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <select
                          disabled={updatingId === user.id}
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              user.id,
                              e.target.value as UserItem["role"]
                            )
                          }
                          className={`text-xs px-2.5 py-1 rounded-full border outline-none cursor-pointer ${roleBadge}`}
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Kitchen Staff</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          disabled={updatingId === user.id}
                          onClick={() => handleToggleStatus(user)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            user.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                          }`}
                        >
                          {user.status === "active" ? "Active" : "Suspended"}
                        </button>
                      </td>
                      <td className="p-4 text-stone-500">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
