"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLinkStore } from "@/lib/stores/link-store";
import { linkSchema, type LinkInput } from "@/lib/validators/link";
import type { Link } from "@/types";

interface LinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a link to edit; omit for add mode */
  link?: Link;
}

export function LinkFormDialog({
  open,
  onOpenChange,
  link,
}: LinkFormDialogProps) {
  const t = useTranslations("dashboard.links");
  const addLink = useLinkStore((s) => s.addLink);
  const updateLink = useLinkStore((s) => s.updateLink);

  const isEditing = Boolean(link);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkInput>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link?.title ?? "",
      url: link?.url ?? "",
    },
  });

  // Sync form values when the dialog opens with a different link
  useEffect(() => {
    if (open) {
      reset({
        title: link?.title ?? "",
        url: link?.url ?? "",
      });
    }
  }, [open, link, reset]);

  async function onSubmit(values: LinkInput) {
    try {
      if (isEditing && link) {
        await updateLink(link.id, values);
        toast.success("Link updated");
      } else {
        await addLink(values);
        toast.success("Link added");
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save link");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("edit") : t("add")}
          </DialogTitle>
        </DialogHeader>

        <form
          id="link-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 py-2"
          noValidate
        >
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="link-title">{t("titleLabel")}</Label>
            <Input
              id="link-title"
              placeholder={t("titlePlaceholder")}
              {...register("title")}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="link-url">{t("urlLabel")}</Label>
            <Input
              id="link-url"
              type="url"
              placeholder={t("urlPlaceholder")}
              {...register("url")}
              aria-invalid={Boolean(errors.url)}
            />
            {errors.url && (
              <p className="text-xs text-destructive">
                {errors.url.message}
              </p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="link-form"
            disabled={isSubmitting}
            className="bg-[#FF6B35] hover:bg-[#e55a25] text-white border-transparent"
          >
            {isSubmitting ? "Saving…" : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
