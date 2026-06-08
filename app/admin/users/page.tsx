import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BadgeCheck, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { toggleUserVerification } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("follower_count", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Manage Users</h2>
        <p className="text-sm text-zinc-400">View and verify community contributors.</p>
      </div>

      <div className="rounded-card border border-white/10 bg-[#090909] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Followers</th>
                <th className="px-6 py-4 font-medium">Following</th>
                <th className="px-6 py-4 font-medium text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users?.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-black/50">
                        {user.avatar ? (
                          <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
                        ) : (
                          <UserIcon className="h-full w-full p-2 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 font-medium text-white">
                          {user.name || "Anonymous"}
                          {user.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-blue-400" />}
                        </div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-white/5 px-2 py-1 text-xs font-medium text-zinc-300">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{user.follower_count}</td>
                  <td className="px-6 py-4 font-medium text-white">{user.following_count}</td>
                  <td className="px-6 py-4 text-right">
                    <form action={toggleUserVerification}>
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="is_verified" value={user.is_verified ? "false" : "true"} />
                      <SubmitButton 
                        className={`h-8 px-3 text-xs ${user.is_verified ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"}`}
                        loadingText="Updating..."
                      >
                        {user.is_verified ? "Revoke Badge" : "Verify User"}
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
