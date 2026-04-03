"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(t("error"));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-[#1E1E2E]">
            viopage
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-[#1E1E2E]">{t("title")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
          <GoogleOAuthButton label={t("google")} />

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-400 uppercase">
              {t("orContinue")}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-12 rounded-lg"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#FF6B35] hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-12 rounded-lg"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#FF6B35] hover:bg-[#e55a25] text-white font-medium"
            >
              {loading ? "..." : t("submit")}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-[#FF6B35] hover:underline font-medium">
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
