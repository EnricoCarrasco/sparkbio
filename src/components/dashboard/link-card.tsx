"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { BrandDot, DASH, DASH_MONO } from "./_dash-primitives";
import type { Link } from "@/types";

interface LinkCardProps {
  link: Link;
  clickCount: number;
  onOpenInsights: (linkId: string) => void;
}

// Best-effort platform detection from a URL, mapping to BrandDot's BRAND_MAP keys.
function detectBrandFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("instagram.")) return "instagram";
    if (host.includes("tiktok.")) return "tiktok";
    if (host.includes("spotify.")) return "spotify";
    if (host.includes("youtube.") || host.includes("youtu.be")) return "youtube";
    if (host.includes("twitter.") || host === "x.com" || host.endsWith(".x.com"))
      return "x";
    if (host.includes("substack.")) return "substack";
    if (host.includes("whatsapp.") || host.includes("wa.me")) return "whatsapp";
    if (host.includes("linkedin.")) return "linkedin";
    if (host.includes("facebook.") || host.includes("fb.com")) return "facebook";
    if (host.includes("github.")) return "github";
    if (host.includes("calendly.") || host.includes("cal.com")) return "calendar";
    if (host.includes("shopify.") || host.includes("shop.")) return "shop";
    if (url.startsWith("mailto:")) return "email";
  } catch {
    // fall through
  }
  return "link";
}

export function LinkCard({ link, clickCount, onOpenInsights }: LinkCardProps) {
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

  const brand = detectBrandFromUrl(link.url);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn("dash-link-row", isDragging && "dragging")}
      >
        {/* Drag handle */}
        <button
          type="button"
          aria-label="Drag to reorder"
          className="touch-none"
          style={{
            cursor: "grab",
            color: DASH.muted,
            opacity: 0.55,
            background: "transparent",
            border: 0,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
          }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Brand dot */}
        <BrandDot brand={brand} size={38} />

        {/* Title + URL */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: DASH.ink,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {link.title}
            </p>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label={t("edit")}
              className="dash-icon-btn"
              style={{ width: 22, height: 22, borderRadius: 6 }}
            >
              <Pencil className="size-3" />
            </button>
          </div>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 12,
              color: DASH.muted,
              fontFamily: DASH_MONO,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {truncateUrl(link.url)}
          </p>
        </div>

        {/* Metrics block (hidden on small screens) */}
        <button
          type="button"
          onClick={() => onOpenInsights(link.id)}
          aria-label={t("insights")}
          className="link-metrics"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 10,
            background: clickCount > 0 ? DASH.orangeTint : DASH.cream2,
            color: clickCount > 0 ? DASH.orangeDeep : DASH.ink,
            border: `1px solid ${DASH.line}`,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <BarChart3 className="size-3" />
          {clickCount === 1
            ? t("clickSingular")
            : clickCount === 0
              ? t("clicksZero")
              : t("clicks", { count: clickCount })}
        </button>

        {/* Switch */}
        <button
          type="button"
          className="dash-switch"
          data-on={link.is_active}
          onClick={handleToggle}
          aria-label={link.is_active ? t("active") : t("inactive")}
          aria-pressed={link.is_active}
        >
          <span className="dash-switch-track">
            <span className="dash-switch-thumb" />
          </span>
        </button>

        {/* Action icons */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <button
            type="button"
            className="dash-icon-btn"
            title="Open link"
            aria-label="Open link"
            onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="size-3.5" />
          </button>
          <button
            type="button"
            className="dash-icon-btn danger"
            onClick={() => setDeleteOpen(true)}
            title={t("delete")}
            aria-label={t("delete")}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Hide the metrics pill on narrow screens */}
        <style jsx>{`
          @media (max-width: 640px) {
            :global(.dash-link-row) .link-metrics {
              display: none;
            }
          }
        `}</style>
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
