import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  return (
    <section className="section">
      <div className="container" style={{ paddingBlock: "96px", maxWidth: 520 }}>
        <LoginForm />
      </div>
    </section>
  );
}
