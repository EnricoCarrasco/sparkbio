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
import { SectionHead, DASH } from "./_dash-primitives";

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

  const liveCount = links.filter((l) => l.is_active).length;

  return (
    <>
      {/* Links section header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 20 }}>
        <SectionHead
          icon={<Link2 className="size-3.5" />}
          label={`${t("regularLinks")} (${liveCount} live)`}
        />
        <span style={{ fontSize: 11, color: DASH.muted, letterSpacing: "-0.01em" }}>
          {links.length} total
        </span>
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
          <div
            className="dash-links-list"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
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
