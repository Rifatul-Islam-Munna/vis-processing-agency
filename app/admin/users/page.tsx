import UserManager from "@/components/UserManager";
import { connectDB, hasDatabase } from "@/lib/db";
import { User } from "@/lib/models";

export default async function UsersPage() {
  let rows: any[] = [];
  if (hasDatabase()) {
    try {
      await connectDB();
      rows = await User.find({}).sort({ createdAt: -1 }).lean();
    } catch {}
  }

  const users = rows.map((user) => ({
    id: String(user._id),
    name: String(user.name),
    email: String(user.email),
    role: user.role === "admin" ? "admin" as const : "user" as const,
    active: user.active !== false,
    createdAt: new Date(user.createdAt).toISOString(),
  }));

  return <>
    <h1 className="text-3xl font-black">Users</h1>
    <p className="mb-6 mt-1 text-slate-500">Manage registered clients, administrators and account access.</p>
    <UserManager initialUsers={users} />
  </>;
}
