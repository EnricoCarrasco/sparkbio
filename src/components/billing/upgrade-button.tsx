"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "./upgrade-dialog";

export function UpgradeButton() {
  const t = useTranslations("billing");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
      >
        <Crown className="size-3.5" />
        {t("upgrade")}
      </Button>
      <UpgradeDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
