"use client";

import React, { useState } from "react";
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
import { LinkInsightsModal } from "@/components/dashboard/link-insights-modal";
import { useLinkStore } from "@/lib/stores/link-store";
import { useLinkClickCounts } from "@/lib/hooks/use-link-click-counts";

export function LinkList() {
  const t = useTranslations("dashboard.links");
  const links = useLinkStore((s) => s.links);
  const reorderLinks = useLinkStore((s) => s.reorderLinks);
  const { counts } = useLinkClickCounts();

  // Insights modal state
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  const selectedLink = selectedLinkId
    ? links.find((l) => l.id === selectedLinkId) ?? null
    : null;

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

  function handleOpenInsights(linkId: string) {
    setSelectedLinkId(linkId);
    setInsightsOpen(true);
  }

  // Empty state
  if (links.length === 0) {
    return null;
  }

  return (
    <>
      {/* Links section header */}
      <div className="flex items-center gap-2">
        <Link2 className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("regularLinks")}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

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
              <LinkCard
                key={link.id}
                link={link}
                clickCount={counts[link.id] ?? 0}
                onOpenInsights={handleOpenInsights}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Link insights modal */}
      <LinkInsightsModal
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        link={selectedLink}
      />
    </>
  );
}
