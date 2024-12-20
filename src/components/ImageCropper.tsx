"use client";

import { useState, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { CropIcon } from "lucide-react";

interface ImageCropperProps {
  image: string;
  onCrop: (dataUrl: string) => void;
}

export default function ImageCropper({ image, onCrop }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const handleCropComplete = useCallback((c: PixelCrop) => {
    setCompletedCrop(c);
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop) => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
      }

      return canvas.toDataURL("image/png");
    },
    []
  );

  const handleApplyCrop = useCallback(async () => {
    if (completedCrop) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const croppedDataUrl = getCroppedImg(img, completedCrop);
        onCrop(croppedDataUrl);
      };
    }
  }, [completedCrop, getCroppedImg, image, onCrop]);

  return (
    <div className="space-y-4">
      <ReactCrop
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={handleCropComplete}
        className="max-w-full max-h-[400px] mx-auto border rounded-lg overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Crop me"
          className="max-w-full max-h-[400px] object-contain"
        />
      </ReactCrop>
      <Button
        onClick={handleApplyCrop}
        className="w-full"
        disabled={!completedCrop}
      >
        <CropIcon className="w-4 h-4 mr-2" />
        Apply Crop
      </Button>
    </div>
  );
}
