"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2 } from "lucide-react";
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
import { LINK_ICON_MAX_SIZE, LINK_ICON_ACCEPTED_TYPES } from "@/lib/constants";
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
  const uploadLinkIcon = useLinkStore((s) => s.uploadLinkIcon);
  const fetchLinkIcon = useLinkStore((s) => s.fetchLinkIcon);

  const isEditing = Boolean(link);

  const [detecting, setDetecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // The last URL we auto-fetched an icon for (avoids redundant fetches) and
  // whether the user manually set/removed the icon (suppresses auto-fetch
  // until the URL changes again).
  const lastFetchedUrl = useRef<string>("");
  const manualOverride = useRef<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LinkInput>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link?.title ?? "",
      url: link?.url ?? "",
      thumbnail_url: link?.thumbnail_url ?? "",
    },
  });

  const watchedUrl = watch("url");
  const thumb = watch("thumbnail_url");

  // Sync form values when the dialog opens with a different link
  useEffect(() => {
    if (open) {
      reset({
        title: link?.title ?? "",
        url: link?.url ?? "",
        thumbnail_url: link?.thumbnail_url ?? "",
      });
      lastFetchedUrl.current = link?.url ?? "";
      manualOverride.current = Boolean(link?.thumbnail_url);
      setDetecting(false);
      setUploading(false);
    }
  }, [open, link, reset]);

  // Debounced auto-detect of an icon when the URL changes
  useEffect(() => {
    if (!open) return;
    const url = (watchedUrl ?? "").trim();
    if (!url || url === lastFetchedUrl.current) return;
    if (!/^https?:\/\/.+\..+/i.test(url)) return;

    const timer = setTimeout(async () => {
      lastFetchedUrl.current = url;
      manualOverride.current = false;
      setDetecting(true);
      const icon = await fetchLinkIcon(url);
      setDetecting(false);
      if (icon && !manualOverride.current) {
        setValue("thumbnail_url", icon, { shouldDirty: true });
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [watchedUrl, open, fetchLinkIcon, setValue]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > LINK_ICON_MAX_SIZE) {
      toast.error("Image too large (max 2MB)");
      return;
    }
    if (!LINK_ICON_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Unsupported image type");
      return;
    }
    setUploading(true);
    const url = await uploadLinkIcon(file);
    setUploading(false);
    if (url) {
      manualOverride.current = true;
      setValue("thumbnail_url", url, { shouldDirty: true });
    } else {
      toast.error("Upload failed");
    }
  }

  function handleRemoveIcon() {
    manualOverride.current = true;
    setValue("thumbnail_url", "", { shouldDirty: true });
  }

  async function onSubmit(values: LinkInput) {
    const payload = { ...values, thumbnail_url: values.thumbnail_url || null };
    try {
      if (isEditing && link) {
        await updateLink(link.id, payload);
        toast.success("Link updated");
      } else {
        await addLink(payload);
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

          {/* Icon */}
          <div className="space-y-1.5">
            <Label>{t("iconLabel")}</Label>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted shrink-0">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="size-full object-cover" />
                ) : detecting ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <ImageIcon className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "…" : t("uploadImage")}
                  </Button>
                  {thumb && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveIcon}
                    >
                      {t("removeImage")}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {detecting ? t("detectingIcon") : t("iconAutoHint")}
                </p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <input type="hidden" {...register("thumbnail_url")} />
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
