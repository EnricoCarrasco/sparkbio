"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Link2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { LinkCard } from "@/components/dashboard/link-card";
import { LinkFormDialog } from "@/components/dashboard/link-form-dialog";
import { useLinkStore } from "@/lib/stores/link-store";

export function LinkList() {
  const t = useTranslations("dashboard.links");
  const links = useLinkStore((s) => s.links);
  const reorderLinks = useLinkStore((s) => s.reorderLinks);

  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag starts to allow clicks
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderLinks(String(active.id), String(over.id));
    }
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {links.length} {links.length === 1 ? "link" : "links"}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={() => setAddOpen(true)}
          className="bg-[#FF6B35] hover:bg-[#e55a25] text-white border-transparent gap-1.5"
        >
          <Plus className="size-3.5" />
          {t("add")}
        </Button>
      </div>

      {/* Empty state */}
      {links.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-14 px-4 border border-dashed border-border rounded-xl text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Link2 className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{t("empty")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("emptyDesc")}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setAddOpen(true)}
            className="bg-[#FF6B35] hover:bg-[#e55a25] text-white border-transparent gap-1.5 mt-1"
          >
            <Plus className="size-3.5" />
            {t("add")}
          </Button>
        </div>
      )}

      {/* Sortable link cards */}
      {links.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add link dialog */}
      <LinkFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
