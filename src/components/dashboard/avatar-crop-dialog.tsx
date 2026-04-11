"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedBlob, normalizeToSquare } from "@/lib/utils/crop-image";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onCropDone: (croppedFile: File) => void;
  onCancel: () => void;
  aspect?: number;
  cropShape?: "round" | "rect";
  title?: string;
}

export function AvatarCropDialog({
  open,
  imageSrc,
  onCropDone,
  onCancel,
  aspect = 1,
  cropShape = "round",
  title = "Crop your photo",
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isSquareCrop = aspect === 1;

  const onCropComplete = useCallback(
    (_croppedArea: CropArea, croppedPixels: CropArea) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  async function handleConfirm() {
    if (!processedSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(processedSrc, croppedAreaPixels);
      const file = new File([blob], "cropped.png", { type: "image/png" });
      onCropDone(file);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onCancel();
    }
  }

  // Normalize to square for avatar crops; use raw image for hero crops
  React.useEffect(() => {
    if (open && imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      if (isSquareCrop) {
        let revoked = false;
        normalizeToSquare(imageSrc).then((url) => {
          if (!revoked) setProcessedSrc(url);
        });
        return () => {
          revoked = true;
          setProcessedSrc((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
        };
      } else {
        setProcessedSrc(imageSrc);
      }
    }
  }, [open, imageSrc, isSquareCrop]);

  if (!imageSrc || !processedSrc) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div
          className="relative w-full bg-black/90 rounded-lg overflow-hidden"
          style={{ aspectRatio: aspect >= 1.5 ? "5/3" : "1/1" }}
        >
          <Cropper
            image={processedSrc}
            crop={crop}
            zoom={zoom}
            minZoom={isSquareCrop ? 0.5 : 0.3}
            aspect={aspect}
            cropShape={cropShape}
            objectFit="contain"
            showGrid={cropShape === "rect"}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-muted-foreground">-</span>
          <input
            type="range"
            min={isSquareCrop ? 0.5 : 0.3}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#FF6B35]"
          />
          <span className="text-xs text-muted-foreground">+</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={saving || !croppedAreaPixels}
            className="bg-[#FF6B35] hover:bg-[#e55a25] text-white"
          >
            {saving ? "Cropping..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
