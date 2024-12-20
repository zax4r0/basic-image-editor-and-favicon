"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, Download, ImageIcon, RefreshCw } from "lucide-react";
import { convertToWebP, resizeImage } from "../utils/imageProcessing";
import ImageCropper from "./ImageCropper";
import JSZip from "jszip";

const FAVICON_SIZES = [16, 32, 64, 80, 96, 192];

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [applyCrop, setApplyCrop] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = (dataUrl: string) => {
    setCroppedImage(dataUrl);
  };

  const handleDownloadWebP = async () => {
    setIsProcessing(true);
    const imageToConvert = applyCrop ? croppedImage : image;
    if (imageToConvert) {
      try {
        const webpDataUrl = await convertToWebP(imageToConvert);
        const link = document.createElement("a");
        link.href = webpDataUrl;
        link.download = "edited-image.webp";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error converting to WebP:", error);
      }
    }
    setIsProcessing(false);
  };

  const handleGenerateFavicons = async () => {
    setIsProcessing(true);
    const imageToUse = applyCrop ? croppedImage : image;
    if (imageToUse) {
      try {
        const zip = new JSZip();

        for (const size of FAVICON_SIZES) {
          const resizedDataUrl = await resizeImage(imageToUse, size, size);
          const data = resizedDataUrl.split(",")[1];
          zip.file(`favicon-${size}x${size}.png`, data, { base64: true });
        }

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "favicons.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error generating favicons:", error);
      }
    }
    setIsProcessing(false);
  };

  const handleReset = () => {
    setImage(null);
    setCroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          {!image ? (
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 mb-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  )}
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </Label>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <ImageCropper image={image} onCrop={handleCrop} />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="apply-crop"
                    checked={applyCrop}
                    onCheckedChange={(checked) =>
                      setApplyCrop(checked as boolean)
                    }
                  />
                  <Label htmlFor="apply-crop">Apply crop</Label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleDownloadWebP}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download as WebP
                </Button>
                <Button
                  onClick={handleGenerateFavicons}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 mr-2" />
                  )}
                  Generate Favicons
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
