import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { ProfileHome } from "@/components/profile/ProfileHome";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="wrap">
      <PageHead title="Profile" sub="Coins held, NFTs won and coins launched. Anyone's profile can be looked up without connecting a wallet." />
      <ProfileHome />
    </div>
  );
}
