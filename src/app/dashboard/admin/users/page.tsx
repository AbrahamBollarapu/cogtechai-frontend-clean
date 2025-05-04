'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CSVLink } from "react-csv";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  tier?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  subscription_active?: boolean;
}

export default function AdminUsersPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filterSubscribed, setFilterSubscribed] = useState<"all" | "active" | "inactive">("all");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("users_realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "user_profiles",
      }, () => refreshUsers())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: current }, error } = await supabase.auth.getUser();
      if (error || !current) return router.push("/dashboard");

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("id, email, is_admin, is_super_admin")
        .eq("id", current.id)
        .single();

      if (!profileData?.is_admin) return router.push("/dashboard");
      setProfile(profileData);
      setIsSuperAdmin(!!profileData.is_super_admin);
      await refreshUsers();
      setLoading(false);
    };
    fetchData();
  }, []);

  const refreshUsers = async () => {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .order("email");
    setUsers(data || []);
  };

  const updateStatus = async (userId: string, field: keyof UserProfile, value: boolean) => {
    setUpdating(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({ [field]: value })
      .eq("id", userId);
    if (!error) {
      setMessage(`${field.replace(/_/g, " ")} updated`);
      await refreshUsers();
    }
    setUpdating(false);
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    await supabase
      .from("user_profiles")
      .update({
        full_name: selectedUser.full_name,
        role: selectedUser.role,
        tier: selectedUser.tier,
      })
      .eq("id", selectedUser.id);
    setSelectedUser(null);
    await refreshUsers();
    setUpdating(false);
  };

  const filtered = users.filter((u) =>
    filterSubscribed === "all"
      ? true
      : filterSubscribed === "active"
      ? u.subscription_active
      : !u.subscription_active
  );

  const exportHeaders = [
    { label: "Email", key: "email" },
    { label: "Name", key: "full_name" },
    { label: "Role", key: "role" },
    { label: "Tier", key: "tier" },
    { label: "Subscribed", key: "subscription_active" },
    { label: "Admin", key: "is_admin" },
    { label: "Superadmin", key: "is_super_admin" },
  ];

  const analyticsData = (type: keyof UserProfile) => {
    const grouped: Record<string, number> = {};
    users.forEach((u) => {
      const key = u[type] === undefined ? "Unknown" : String(u[type]);
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management Panel</h1>
        <CSVLink
          data={users}
          headers={exportHeaders}
          filename="users_export.csv"
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          Export CSV
        </CSVLink>
      </div>

      <div className="flex gap-2">
        <span className="font-medium">Filter:</span>
        {(["all", "active", "inactive"] as const).map((key) => (
          <button
            key={key}
            className={`px-3 py-1 rounded ${filterSubscribed === key ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
            onClick={() => setFilterSubscribed(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {message && <p className="text-green-600">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["role", "tier"] as (keyof UserProfile)[]).map((field) => (
          <div className="h-64" key={field}>
            <h3 className="text-lg font-semibold mb-2">By {field.charAt(0).toUpperCase() + field.slice(1)}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData(field)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                >
                  {analyticsData(field).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <table className="min-w-full text-sm border rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Tier</th>
            <th className="px-4 py-2">Subscribed</th>
            <th className="px-4 py-2">Admin</th>
            <th className="px-4 py-2">Superadmin</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id} className="border-t hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.full_name}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">{user.tier}</td>
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={!!user.subscription_active}
                  disabled={updating}
                  onChange={() => updateStatus(user.id, "subscription_active", !user.subscription_active)}
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={!!user.is_admin}
                  disabled={updating}
                  onChange={() => updateStatus(user.id, "is_admin", !user.is_admin)}
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={!!user.is_super_admin}
                  disabled={updating || !isSuperAdmin}
                  onChange={() => updateStatus(user.id, "is_super_admin", !user.is_super_admin)}
                />
              </td>
              <td className="px-4 py-2">
                <button className="text-blue-600 hover:underline" onClick={() => setSelectedUser(user)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="mt-6 border-t pt-4 space-y-4">
          <h2 className="text-xl font-semibold">Edit: {selectedUser.email}</h2>
          <input
            value={selectedUser.full_name || ""}
            onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
            className="p-2 border rounded w-full"
            placeholder="Full Name"
          />
          <select
            value={selectedUser.role || ""}
            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Role</option>
            <option value="freelancer">Freelancer</option>
            <option value="client">Client</option>
            <option value="manufacturer">Manufacturer</option>
          </select>
          <select
            value={selectedUser.tier || ""}
            onChange={(e) => setSelectedUser({ ...selectedUser, tier: e.target.value })}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Tier</option>
            <option value="Unverified">Unverified</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
          <Button
            onClick={saveUser}
            disabled={updating}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
