"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link2 } from "lucide-react";
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
import { LinkCard } from "@/components/dashboard/link-card";
import { useLinkStore } from "@/lib/stores/link-store";

export function LinkList() {
  const t = useTranslations("dashboard.links");
  const links = useLinkStore((s) => s.links);
  const reorderLinks = useLinkStore((s) => s.reorderLinks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
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

  // Empty state
  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 px-4 border border-dashed border-border rounded-2xl text-center bg-white">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Link2 className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{t("empty")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("emptyDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={links.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
