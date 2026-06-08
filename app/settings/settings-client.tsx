"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Lock, AlertTriangle, Loader2, Sparkles, Clock, CheckCircle, XCircle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile, updatePassword, deleteAccount, deletePrompt } from "@/app/actions/user";
import Link from "next/link";
import Image from "next/image";
import { ImageUploadField } from "@/components/image-upload-field";

export function SettingsClient({ user, profile, userPrompts }: { user: User; profile: any; userPrompts: any[] }) {
  const [name, setName] = useState(profile.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [profileMessage, setProfileMessage] = useState("");

  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "error">("idle");
  const [deleteMessage, setDeleteMessage] = useState("");

  const isEmailProvider = user.app_metadata.provider === "email" || (user.app_metadata.providers && user.app_metadata.providers.includes("email"));

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileStatus("loading");
    setProfileMessage("");
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const result = await updateProfile(formData);
    if (result?.error) {
      setProfileStatus("error");
      setProfileMessage(result.error);
    } else {
      setProfileStatus("success");
      setProfileMessage("Profile updated successfully!");
      setTimeout(() => setProfileStatus("idle"), 3000);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordStatus("loading");
    setPasswordMessage("");
    
    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    
    const result = await updatePassword(formData);
    if (result?.error) {
      setPasswordStatus("error");
      setPasswordMessage(result.error);
    } else {
      setPasswordStatus("success");
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordStatus("idle"), 3000);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") {
      setDeleteStatus("error");
      setDeleteMessage("Please type DELETE to confirm");
      return;
    }
    
    setDeleteStatus("loading");
    setDeleteMessage("");
    
    const result = await deleteAccount();
    if (result?.error) {
      setDeleteStatus("error");
      setDeleteMessage(result.error);
    }
    // On success, the server action will sign out and redirect, or the layout handles it
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Account Settings</h1>
        <p className="mt-2 text-zinc-400">Manage your profile, password, and account preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Card */}
        <div className="rounded-card border border-white/10 bg-[#090909] p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
              <UserIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/10 bg-black/50">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt="Avatar" fill className="object-cover" />
                ) : (
                  <UserIcon className="h-full w-full p-4 text-zinc-500" />
                )}
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-zinc-300">Profile Picture</label>
                <div className="mt-2 max-w-sm">
                  <ImageUploadField 
                    name="avatar" 
                    defaultValue={profile.avatar || ""} 
                    placeholder="Avatar URL" 
                    label="Upload Picture"
                    bucket="avatars"
                    cropAspectRatio={1}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Display Name</label>
                <Input 
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-black/50 border-white/10 text-white focus:border-accent"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email Address</label>
                <Input 
                  value={user.email || ""}
                  disabled
                  className="bg-black/50 border-white/10 text-zinc-500 opacity-70"
                />
                <p className="text-xs text-zinc-500">Email cannot be changed.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Instagram URL (Optional)</label>
              <Input 
                name="instagram_url"
                defaultValue={profile.instagram_url || ""}
                placeholder="https://instagram.com/username"
                className="bg-black/50 border-white/10 text-white focus:border-accent"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button type="submit" disabled={profileStatus === "loading"}>
                {profileStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
              {profileStatus === "success" && <span className="text-sm text-green-400">{profileMessage}</span>}
              {profileStatus === "error" && <span className="text-sm text-red-400">{profileMessage}</span>}
            </div>
          </form>
        </div>

        {/* Security Card */}
        {isEmailProvider && (
          <div className="rounded-card border border-white/10 bg-[#090909] p-6 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">Security</h2>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Current Password</label>
                  <Input 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-black/50 border-white/10 text-white focus:border-accent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">New Password</label>
                  <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-black/50 border-white/10 text-white focus:border-accent"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button type="submit" variant="secondary" disabled={passwordStatus === "loading"}>
                  {passwordStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
                {passwordStatus === "success" && <span className="text-sm text-green-400">{passwordMessage}</span>}
                {passwordStatus === "error" && <span className="text-sm text-red-400">{passwordMessage}</span>}
              </div>
            </form>
          </div>
        )}

        {/* My Submissions */}
        <div className="rounded-card border border-white/10 bg-[#090909] p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-500/20 text-lime-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">My Prompts</h2>
                <p className="text-sm text-zinc-400">Prompts you have contributed</p>
              </div>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/contribute">Submit New</Link>
            </Button>
          </div>
          
          <div className="space-y-3">
            {userPrompts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                <p className="text-sm text-zinc-400">You haven&apos;t submitted any prompts yet.</p>
              </div>
            ) : (
              userPrompts.map(prompt => (
                <div key={prompt.id} className="group relative flex items-center gap-4 rounded-xl border border-white/5 bg-black/40 p-3 pr-4 transition hover:bg-white/[0.02]">
                  {prompt.status === 'approved' ? (
                    <Link href={`/prompt/${prompt.slug}`} className="absolute inset-0 z-0" aria-label="View prompt"></Link>
                  ) : null}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg z-10 pointer-events-none">
                    <Image src={prompt.preview_image} alt={prompt.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 z-10 pointer-events-none">
                    <h3 className="truncate font-medium text-white group-hover:text-accent transition-colors">{prompt.title}</h3>
                    <p className="truncate text-xs text-zinc-400">{prompt.category?.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 z-10">
                    <div className="flex shrink-0 items-center gap-1.5">
                      {prompt.status === 'pending' && <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400"><Clock className="h-3.5 w-3.5" /> Pending</span>}
                      {prompt.status === 'approved' && <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400"><CheckCircle className="h-3.5 w-3.5" /> Approved</span>}
                      {prompt.status === 'rejected' && <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400"><XCircle className="h-3.5 w-3.5" /> Rejected</span>}
                    </div>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white pointer-events-auto">
                      <Link href={`/edit-prompt/${prompt.id}`} title="Edit Prompt">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-400 hover:text-red-500 pointer-events-auto"
                      title="Delete Prompt"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (confirm("Are you sure you want to delete this prompt? This cannot be undone.")) {
                          await deletePrompt(prompt.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-card border border-red-500/20 bg-[#1a0b0b] p-6 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
              <p className="text-sm text-red-400/80">Permanently delete your account and all data.</p>
            </div>
          </div>
          
          <div className="space-y-4 max-w-md">
            <p className="text-sm text-zinc-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-400">Type DELETE to confirm</label>
              <div className="flex gap-3">
                <Input 
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="bg-black/50 border-red-500/30 text-white focus:border-red-500"
                />
                <Button 
                  variant="danger" 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleteStatus === "loading"}
                >
                  {deleteStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete Account
                </Button>
              </div>
              {deleteStatus === "error" && <span className="text-sm text-red-400 block mt-2">{deleteMessage}</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
