"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { RESERVED_USERNAMES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const username = watch("username");

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);

    // Check reserved usernames
    if (RESERVED_USERNAMES.includes(data.username.toLowerCase() as typeof RESERVED_USERNAMES[number])) {
      setError(t("usernameTaken"));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Check if username is available
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username.toLowerCase())
      .single();

    if (existing) {
      setError(t("usernameTaken"));
      setLoading(false);
      return;
    }

    // Sign up
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username.toLowerCase(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Update the profile username (trigger creates with email-derived username)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ username: data.username.toLowerCase() })
        .eq("id", user.id);
    }

    // Redirect to in-app trial page where user picks plan + starts checkout overlay
    router.push("/trial");
    router.refresh();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 py-8">
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
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder={t("usernamePlaceholder")}
                className="h-12 rounded-lg"
                {...register("username")}
              />
              {username && !errors.username && (
                <p className="text-xs text-gray-400">
                  {t("usernameHelp", { username: username.toLowerCase() })}
                </p>
              )}
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                className="h-12 rounded-lg"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={t("passwordPlaceholder")}
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
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-[#FF6B35] hover:underline font-medium">
            {t("logIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
