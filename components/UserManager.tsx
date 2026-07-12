"use client";

import { useState } from "react";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  active: boolean;
  createdAt: string;
};

export default function UserManager({ initialUsers }: { initialUsers: ManagedUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState("");

  async function updateUser(id: string, patch: Partial<ManagedUser>) {
    setMessage("");
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(result.error || "Unable to update user");
    setUsers((items) => items.map((item) => item.id === id ? { ...item, ...result.user } : item));
    setMessage("User updated");
  }

  async function removeUser(id: string) {
    if (!window.confirm("Delete this user and remove account access?")) return;
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(result.error || "Unable to delete user");
    setUsers((items) => items.filter((item) => item.id !== id));
    setMessage("User deleted");
  }

  return <>
    {message && <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold">{message}</p>}
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[760px] text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Access</th><th className="p-4">Joined</th><th className="p-4" /></tr>
        </thead>
        <tbody>{users.map((user) => <tr key={user.id} className="border-t border-slate-100">
          <td className="p-4"><b className="block">{user.name}</b><span className="text-sm text-slate-500">{user.email}</span></td>
          <td className="p-4"><select value={user.role} onChange={(event) => updateUser(user.id, { role: event.target.value as ManagedUser["role"] })} className="rounded-lg border border-slate-300 px-3 py-2"><option value="user">User</option><option value="admin">Admin</option></select></td>
          <td className="p-4"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={user.active} onChange={(event) => updateUser(user.id, { active: event.target.checked })} /> Active</label></td>
          <td className="p-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
          <td className="p-4 text-right"><button onClick={() => removeUser(user.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600">Delete</button></td>
        </tr>)}</tbody>
      </table>
    </div>
  </>;
}
