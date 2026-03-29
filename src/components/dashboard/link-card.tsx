"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  GripVertical,
  Pencil,
  Trash2,
  Share2,
  QrCode,
  Image,
  Star,
  BarChart3,
  Copy,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLinkStore } from "@/lib/stores/link-store";
import { useDashboardStore } from "@/lib/stores/dashboard-store";
import { LinkFormDialog } from "@/components/dashboard/link-form-dialog";
import type { Link } from "@/types";

interface LinkCardProps {
  link: Link;
  clickCount?: number;
}

export function LinkCard({ link, clickCount = 0 }: LinkCardProps) {
  const t = useTranslations("dashboard.links");
  const toggleLink = useLinkStore((s) => s.toggleLink);
  const deleteLink = useLinkStore((s) => s.deleteLink);
  const navigateToLinkAnalytics = useDashboardStore(
    (s) => s.navigateToLinkAnalytics
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function truncateUrl(url: string): string {
    try {
      const { host, pathname } = new URL(url);
      const path = pathname.length > 30 ? pathname.slice(0, 30) + "..." : pathname;
      return `${host}${path}`;
    } catch {
      return url.length > 50 ? url.slice(0, 50) + "..." : url;
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteLink(link.id);
      toast.success("Link deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete link");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggle() {
    try {
      await toggleLink(link.id);
    } catch {
      toast.error("Failed to update link");
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "rounded-2xl bg-white border border-border/60 shadow-sm transition-shadow",
          isDragging && "shadow-lg opacity-80 z-50"
        )}
      >
        {/* Main card body */}
        <div className="flex items-start gap-2 p-4">
          {/* Drag handle */}
          <button
            type="button"
            aria-label="Drag to reorder"
            className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0 mt-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" />
          </button>

          {/* Link info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground truncate">
                {link.title}
              </p>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="shrink-0 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <Pencil className="size-3" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-muted-foreground truncate">
                {truncateUrl(link.url)}
              </p>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="shrink-0 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <Pencil className="size-2.5" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <BarChart3 className="size-3 text-muted-foreground/50" />
              <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                {clickCount} {t("clicks")}
              </span>
            </div>
          </div>

          {/* Right side: share + toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground/60 hover:text-muted-foreground"
            >
              <Share2 className="size-3.5" />
            </Button>
            <Switch
              checked={link.is_active}
              onCheckedChange={handleToggle}
              aria-label={link.is_active ? t("active") : t("inactive")}
            />
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-0">
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground/40 hover:text-muted-foreground"
              title="QR Code"
            >
              <QrCode className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground/40 hover:text-muted-foreground"
              title="Thumbnail"
            >
              <Image className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground/40 hover:text-muted-foreground"
              title="Highlight"
            >
              <Star className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground/40 hover:text-muted-foreground"
              title={t("viewAnalytics")}
              onClick={() => navigateToLinkAnalytics(link.id)}
            >
              <BarChart3 className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground/40 hover:text-muted-foreground"
              title="Copy link"
              onClick={() => {
                navigator.clipboard.writeText(link.url);
                toast.success("Link copied!");
              }}
            >
              <Copy className="size-3.5" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            className="size-7 text-muted-foreground/40 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit dialog */}
      <LinkFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        link={link}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("deleteConfirm")}
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              {deleting ? "Deleting..." : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
