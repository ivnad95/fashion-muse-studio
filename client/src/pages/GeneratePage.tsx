import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Camera, Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function GeneratePage() {
  const [imageCount, setImageCount] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [style, setStyle] = useState("Editorial");
  const [cameraAngle, setCameraAngle] = useState("Hero low angle");
  const [lighting, setLighting] = useState("Rembrandt");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: creditsData } = trpc.credits.getBalance.useQuery();
  const createMutation = trpc.generations.create.useMutation({
    onSuccess: () => {
      toast.success("Generation started! Check history for results.");
      setImageFile(null);
      setImagePreview("");
    },
    onError: error => {
      toast.error(error.message || "Failed to start generation");
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      toast.error("Please upload an image first");
      return;
    }

    if (!creditsData || creditsData.credits < imageCount) {
      toast.error("Insufficient credits");
      return;
    }

    // Convert image to base64 for upload
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      createMutation.mutate({
        originalUrl: base64, // Using base64 as URL for now
        imageCount,
        aspectRatio: "portrait",
        prompt: "Transform this into a professional fashion photoshoot",
        style,
        cameraAngle,
        lighting,
      });
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="space-y-6 pb-6">
      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h2 className="text-2xl font-bold text-[#F5F7FA] mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Generate Fashion Art
        </h2>

        <div className="space-y-6">
          {/* Image Upload Area */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[3/4] rounded-2xl glass-3d-surface border-2 border-dashed border-[#0A76AF]/30 hover:border-[#0A76AF]/60 transition-all overflow-hidden group relative"
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-white mx-auto mb-2" />
                      <p className="text-white font-medium">Change Image</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0A76AF]/20 to-[#004b93]/20 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-[#0A76AF]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[#F5F7FA] font-semibold text-lg mb-2">
                      Upload Your Photo
                    </p>
                    <p className="text-[#8A92A0] text-sm">
                      Click to select an image
                    </p>
                    <p className="text-[#8A92A0] text-xs mt-1">
                      JPG, PNG or WEBP
                    </p>
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Image Count Selector */}
          <div>
            <Label className="text-[#C8CDD5] mb-3 block">
              Number of Images ({imageCount})
            </Label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 4, 6, 8].map(num => (
                <button
                  key={num}
                  onClick={() => setImageCount(num)}
                  className={`number-chip glass-3d-button ${imageCount === num ? "active" : ""}`}
                >
                  <span className="button-text">{num}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#8A92A0] mt-2">
              Cost: {imageCount} credit{imageCount > 1 ? "s" : ""} | Available:{" "}
              {creditsData?.credits || 0}
            </p>
          </div>

          {/* Style Selection */}
          <div>
            <Label className="text-[#C8CDD5] mb-2 block">Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Editorial", "Vogue", "Minimalist", "Vintage"].map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`glass-3d-button px-4 py-2 rounded-xl ${style === s ? "active" : ""}`}
                >
                  <span className="button-text text-sm">{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Angle */}
          <div>
            <Label className="text-[#C8CDD5] mb-2 block">Camera Angle</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Hero low angle",
                "Beauty close-up",
                "Editorial side",
                "Full body",
              ].map(angle => (
                <button
                  key={angle}
                  onClick={() => setCameraAngle(angle)}
                  className={`glass-3d-button px-4 py-2 rounded-xl ${cameraAngle === angle ? "active" : ""}`}
                >
                  <span className="button-text text-sm">{angle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lighting */}
          <div>
            <Label className="text-[#C8CDD5] mb-2 block">Lighting</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Rembrandt", "Butterfly", "Split", "Loop"].map(light => (
                <button
                  key={light}
                  onClick={() => setLighting(light)}
                  className={`glass-3d-button px-4 py-2 rounded-xl ${lighting === light ? "active" : ""}`}
                >
                  <span className="button-text text-sm">{light}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={createMutation.isPending || !imageFile}
            className="glass-3d-button primary-button w-full mt-6"
          >
            {createMutation.isPending ? (
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                <span className="button-text">
                  Generate ({imageCount} credit{imageCount > 1 ? "s" : ""})
                </span>
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-sm font-semibold text-[#C8CDD5] mb-3">💡 Tips</h3>
        <ul className="space-y-2 text-sm text-[#8A92A0]">
          <li>• Use high-quality images for best results</li>
          <li>• Portrait orientation works best</li>
          <li>• Generation takes 10-30 seconds</li>
          <li>• Check history tab for completed images</li>
        </ul>
      </Card>
    </div>
  );
}
