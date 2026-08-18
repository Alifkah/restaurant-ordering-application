import { Suspense } from "react";
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Daftar Akun | Nusantara Artisan Kitchen & Lounge",
  description: "Daftarkan akun pelanggan baru untuk memesan aneka kuliner artisan nusantara.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-sand-100">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <AuthCard initialMode="register" />
      </Suspense>
    </main>
  );
}
