import { updateSettings } from "@/app/actions/admin";
import { ImageUploadField } from "@/components/image-upload-field";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { getSettings } from "@/lib/data";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <form action={updateSettings} className="glass mx-auto grid max-w-2xl gap-3 rounded-card p-5">
      <h2 className="text-xl font-bold">Website And Instagram Settings</h2>
      <Input name="site_title" defaultValue={settings.site_title} placeholder="Site title" required />
      <Input name="site_description" defaultValue={settings.site_description} placeholder="Site description" required />
      <Input name="creator_name" defaultValue={settings.creator_name} placeholder="Creator name" required />
      <Input name="instagram_username" defaultValue={settings.instagram_username} placeholder="@username" required />
      <Input name="instagram_url" defaultValue={settings.instagram_url} placeholder="Instagram URL" required />
      <ImageUploadField
        name="creator_avatar"
        defaultValue={settings.creator_avatar}
        placeholder="Profile picture URL"
        label="Upload Creator Avatar"
      />
      <SubmitButton loadingText="Updating...">Update Settings</SubmitButton>
    </form>
  );
}
