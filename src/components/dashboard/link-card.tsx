"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
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
import { LinkFormDialog } from "@/components/dashboard/link-form-dialog";
import type { Link } from "@/types";

interface LinkCardProps {
  link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
  const t = useTranslations("dashboard.links");
  const toggleLink = useLinkStore((s) => s.toggleLink);
  const deleteLink = useLinkStore((s) => s.deleteLink);

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
      const path = pathname.length > 20 ? pathname.slice(0, 20) + "…" : pathname;
      return `${host}${path}`;
    } catch {
      return url.length > 40 ? url.slice(0, 40) + "…" : url;
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
          "flex items-center gap-3 p-4 rounded-xl border border-border bg-white transition-shadow",
          isDragging && "shadow-lg opacity-80 z-50"
        )}
      >
        {/* Drag handle */}
        <button
          type="button"
          aria-label="Drag to reorder"
          className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Link info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {link.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {truncateUrl(link.url)}
          </p>
        </div>

        {/* Active toggle */}
        <Switch
          checked={link.is_active}
          onCheckedChange={handleToggle}
          aria-label={link.is_active ? t("active") : t("inactive")}
        />

        {/* Edit button */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setEditOpen(true)}
          aria-label={t("edit")}
        >
          <Pencil className="size-3.5" />
        </Button>

        {/* Delete button */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setDeleteOpen(true)}
          aria-label={t("delete")}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
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
              {deleting ? "Deleting…" : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
